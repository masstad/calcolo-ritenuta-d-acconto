export interface RitenutaInput {
  giornate: number;
  tariffaGiornaliera: number;
}

export interface RitenutaResult {
  giornate: number;
  tariffaGiornaliera: number;
  lordo: number;
  aliquotaRitenuta: number;
  importoRitenuta: number;
  netto: number;
}