# Calcolo Ritenuta d'Acconto

Applicazione web realizzata con **React + TypeScript + Vite** per calcolare una ritenuta d'acconto e generare un PDF precompilato a partire da un template.

L'applicazione è pensata per essere utilizzata anche da cellulare e può essere pubblicata tramite **GitHub Pages**.

## Funzionalità principali

- Selezione del nominativo da elenco predefinito
- Inserimento del numero di giornate
- Selezione della tariffa giornaliera da elenco predefinito
- Calcolo automatico di:
  - totale imponibile
  - rimborso spese
  - ritenuta d'acconto
  - totale netto
- Generazione PDF a partire da template
- Download del PDF
- Condivisione del PDF, se supportata dal dispositivo/browser

## Stack tecnologico

- React
- TypeScript
- Vite
- pdf-lib
- GitHub Pages
- gh-pages

## Struttura principale del progetto

```text
calcolo-ritenuta-d-acconto-app/
  public/
    Template_ritenuta_acconto.pdf
  src/
    data/
      prestatori.json
    services/
      calculationService.ts
      pdfService.ts
    App.tsx
    styles.css
  package.json
  vite.config.ts
  README.md
```

## Template PDF

Il template PDF deve essere presente nella cartella:

```text
public/Template_ritenuta_acconto.pdf
```

Il file viene caricato dall'applicazione tramite `pdfService.ts`.

Il template viene compilato scrivendo i valori in coordinate PDF predefinite.

Se il layout del PDF cambia, potrebbe essere necessario aggiornare le coordinate presenti in:

```text
src/services/pdfService.ts
```

In particolare nella costante:

```ts
const FIELD_BOXES = {
  ...
};
```

## Installazione dipendenze

Dalla cartella principale del progetto:

```powershell
npm install
```

## Avvio in locale

Per avviare l'applicazione in locale:

```powershell
npm run dev
```

L'applicazione sarà disponibile all'indirizzo indicato da Vite, ad esempio:

```text
http://localhost:5173/
```

Oppure, se è configurato il `base` path per GitHub Pages:

```text
http://localhost:5173/calcolo-ritenuta-d-acconto/
```

## Build di produzione

Per verificare che il progetto compili correttamente:

```powershell
npm run build
```

Questo comando genera la cartella:

```text
dist/
```

La cartella `dist` contiene i file statici pronti per la pubblicazione.

## Pubblicazione su GitHub Pages

Il progetto è configurato per essere pubblicato su GitHub Pages tramite il pacchetto `gh-pages`.

Nel file `vite.config.ts` deve essere presente il `base` path corretto:

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/calcolo-ritenuta-d-acconto/",
});
```

Nel file `package.json` deve essere presente lo script:

```json
"deploy": "npm run build && gh-pages -d dist"
```

Per pubblicare l'applicazione:

```powershell
npm run deploy
```

L'applicazione sarà disponibile all'indirizzo:

```text
https://masstad.github.io/calcolo-ritenuta-d-acconto/
```

Oppure:

```text
https://masstad.github.io/calcolo-ritenuta-d-acconto/index.html
```

## Aggiornare GitHub dopo una modifica

Quando viene modificato un file del progetto, per aggiornare il repository GitHub e poi l'applicazione pubblicata, eseguire questi comandi dalla cartella principale del progetto.

### 1. Verificare i file modificati

```powershell
git status
```

### 2. Aggiungere le modifiche

Per aggiungere tutte le modifiche:

```powershell
git add .
```

Oppure, per aggiungere un singolo file:

```powershell
git add src/App.tsx
```

### 3. Creare il commit

```powershell
git commit -m "Aggiornamento applicazione"
```

È consigliabile usare un messaggio di commit descrittivo, ad esempio:

```powershell
git commit -m "Aggiornamento elenco prestatori"
```

oppure:

```powershell
git commit -m "Correzione generazione PDF"
```

### 4. Aggiornare il repository GitHub

```powershell
git push
```

Questo aggiorna il branch principale del repository, ad esempio `main`.

### 5. Aggiornare l'applicazione pubblicata

```powershell
npm run deploy
```

Questo comando:

1. esegue la build del progetto;
2. genera la cartella `dist`;
3. pubblica il contenuto di `dist` sul branch `gh-pages`;
4. aggiorna l'applicazione pubblicata su GitHub Pages.

## Sequenza completa di aggiornamento

In condizioni normali, dopo aver modificato uno o più file, eseguire:

```powershell
git status
git add .
git commit -m "Aggiornamento applicazione"
git push
npm run deploy
```

Dopo il deploy attendere qualche minuto e aprire:

```text
https://masstad.github.io/calcolo-ritenuta-d-acconto/
```

Se il browser mostra ancora la versione precedente, effettuare un refresh forzato:

```text
CTRL + F5
```

Da cellulare può essere necessario chiudere e riaprire il browser.

## Gestione dei nominativi

I nominativi predefiniti sono configurati nel file:

```text
src/data/prestatori.json
```

Esempio:

```json
[
  {
    "id": "mario-rossi",
    "cognomeNome": "Mario Rossi"
  },
  {
    "id": "luigi-bianchi",
    "cognomeNome": "Luigi Bianchi"
  }
]
```

Dopo aver modificato questo file, eseguire nuovamente:

```powershell
git add .
git commit -m "Aggiornamento elenco prestatori"
git push
npm run deploy
```

## Note importanti

- Il PDF template deve restare nella cartella `public`.
- Il nome del file PDF deve corrispondere a quello usato in `pdfService.ts`.
- Se il repository GitHub cambia nome, va aggiornato anche il valore `base` in `vite.config.ts`.
- Se il layout del template PDF cambia, potrebbero dover essere aggiornate le coordinate in `FIELD_BOXES`.