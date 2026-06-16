import type { RitenutaInput, RitenutaResult } from "../models/ritenuta";

const ALIQUOTA_RITENUTA = 0.20;
const GIOCHETTO = 5;

export function calcolaRitenuta(input: RitenutaInput): RitenutaResult {
  const lordo = input.giornate * input.tariffaGiornaliera;
  
  const pagaGiornaliera = input.tariffaGiornaliera - GIOCHETTO;
  const totaleImponibile = input.giornate * pagaGiornaliera;
  const valoreRitenuta = pagaGiornaliera * ALIQUOTA_RITENUTA;
  const chk = pagaGiornaliera - valoreRitenuta;
  const differenza = input.tariffaGiornaliera - chk;
  const rimborso = input.giornate * differenza;
  const totaleRitenuta = (input.giornate * valoreRitenuta) * -1;
  const totale = totaleImponibile + rimborso + totaleRitenuta;

  return {
    giornate: input.giornate,
    tariffaGiornaliera: input.tariffaGiornaliera,
    totaleImponibile,
    aliquotaRitenuta: ALIQUOTA_RITENUTA,
    rimborso,
    totaleRitenuta,
	totale,
  };
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}