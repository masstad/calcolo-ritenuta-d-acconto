export interface RitenutaInput {
  giornate: number;
  tariffaGiornaliera: number;
}

export interface RitenutaResult {
  giornate: number;
  tariffaGiornaliera: number;
  lordo: number;
  totaleImponibile: number;
  rimborso: number;
  totaleRitenuta: number;
  totale: number;
  aliquotaRitenuta: number;
}