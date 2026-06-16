import { useMemo, useState } from "react";
import "./styles.css";
import prestatoriJson from "./data/prestatori.json";
import { calcolaRitenuta, formatEuro } from "./services/calculationService";
import {
  generaRitenutaPdf,
  downloadPdf,
  condividiPdf,
  buildRitenutaFileName,
} from "./services/pdfService";

type Prestatore = {
  id: string;
  cognomeNome: string;
};

const PRESTATORI = prestatoriJson as Prestatore[];

const TARIFFE_GIORNALIERE = Array.from(
  { length: (120 - 30) / 5 + 1 },
  (_, index) => 30 + index * 5
);

function App() {
  const [cognomeNome, setCognomeNome] = useState<string>("");
  const [giornate, setGiornate] = useState<number>(0);
  const [tariffaGiornaliera, setTariffaGiornaliera] = useState<number>(30);
  const [message, setMessage] = useState<string>("");

  const result = useMemo(() => {
    return calcolaRitenuta({
      giornate,
      tariffaGiornaliera,
    });
  }, [giornate, tariffaGiornaliera]);

  const datiValidi =
    cognomeNome.trim().length > 0 &&
    giornate > 0 &&
    tariffaGiornaliera > 0;

  async function handleDownloadPdf() {
    if (!datiValidi) {
      setMessage("Inserisci cognome/nome, numero giornate e tariffa giornaliera.");
      return;
    }

    try {
      const filename = buildRitenutaFileName(cognomeNome);

      const blob = await generaRitenutaPdf({
        cognomeNome,
        totaleImponibile: result.totaleImponibile,
        rimborsoSpese: result.rimborso,
        ritenutaAcconto: result.totaleRitenuta,
        totaleNetto: result.totale,
      });

      downloadPdf(blob, filename);
      setMessage("PDF generato correttamente.");
    } catch (error) {
      console.error(error);
      setMessage("Errore durante la generazione del PDF.");
    }
  }

  async function handleSharePdf() {
    if (!datiValidi) {
      setMessage("Inserisci cognome/nome, numero giornate e tariffa giornaliera.");
      return;
    }

    try {
      const filename = buildRitenutaFileName(cognomeNome);

      const blob = await generaRitenutaPdf({
        cognomeNome,
        totaleImponibile: result.totaleImponibile,
        rimborsoSpese: result.rimborso,
        ritenutaAcconto: result.totaleRitenuta,
        totaleNetto: result.totale,
      });

      const condiviso = await condividiPdf(blob, filename);

      if (!condiviso) {
        downloadPdf(blob, filename);
        setMessage("Condivisione non supportata: ho scaricato il PDF.");
      } else {
        setMessage("PDF pronto per la condivisione.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Condivisione annullata o non riuscita.");
    }
  }

  return (
    <main className="page">
      <section className="card">
        <h1>Calcolo ritenuta d&apos;acconto</h1>

        <div className="form">
          <label>
			  Cognome e nome
			  <select
				value={cognomeNome}
				onChange={(e) => setCognomeNome(e.target.value)}
			  >
				<option value="">Seleziona nominativo</option>

				{PRESTATORI.map((prestatore) => (
				  <option key={prestatore.id} value={prestatore.cognomeNome}>
					{prestatore.cognomeNome}
				  </option>
				))}
			  </select>
			</label>

          <label>
            Numero giornate
            <input
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              value={giornate || ""}
              onChange={(e) => setGiornate(Number(e.target.value))}
              placeholder="Es. 5"
            />
          </label>

          <label>
			  Tariffa giornaliera
			  <select
				value={tariffaGiornaliera}
				onChange={(e) => setTariffaGiornaliera(Number(e.target.value))}
			  >
				{TARIFFE_GIORNALIERE.map((tariffa) => (
				  <option key={tariffa} value={tariffa}>
					{tariffa} €
				  </option>
				))}
			  </select>
			</label>
        </div>

        <section className="result">
          <div>
            <span>Totale Imponibile</span>
            <strong>{formatEuro(result.totaleImponibile)}</strong>
          </div>

          <div>
            <span>Rimborso Spese</span>
            <strong>{formatEuro(result.rimborso)}</strong>
          </div>

          <div>
            <span>Ritenuta d'acconto</span>
            <strong>{formatEuro(result.totaleRitenuta)}</strong>
          </div>

          <div className="netto">
            <span>Totale</span>
            <strong>{formatEuro(result.totale)}</strong>
          </div>
        </section>

        <div className="actions">
          <button onClick={handleDownloadPdf} disabled={!datiValidi}>
            Genera PDF
          </button>

          <button
            onClick={handleSharePdf}
            disabled={!datiValidi}
            className="secondary"
          >
            Condividi
          </button>
        </div>

        {message && <p className="message">{message}</p>}
      </section>
    </main>
  );
}

export default App;