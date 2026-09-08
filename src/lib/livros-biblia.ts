/** Livros da Bíblia na ordem canônica — usada para ordenar os estudos. */
export const LIVROS_BIBLIA = [
  "Gênesis", "Êxodo", "Levítico", "Números", "Deuteronômio", "Josué", "Juízes", "Rute",
  "1 Samuel", "2 Samuel", "1 Reis", "2 Reis", "1 Crônicas", "2 Crônicas", "Esdras", "Neemias",
  "Ester", "Jó", "Salmos", "Provérbios", "Eclesiastes", "Cânticos", "Isaías", "Jeremias",
  "Lamentações", "Ezequiel", "Daniel", "Oséias", "Joel", "Amós", "Obadias", "Jonas",
  "Miqueias", "Naum", "Habacuque", "Sofonias", "Ageu", "Zacarias", "Malaquias",
  "Mateus", "Marcos", "Lucas", "João", "Atos", "Romanos", "1 Coríntios", "2 Coríntios",
  "Gálatas", "Efésios", "Filipenses", "Colossenses", "1 Tessalonicenses", "2 Tessalonicenses",
  "1 Timóteo", "2 Timóteo", "Tito", "Filemom", "Hebreus", "Tiago", "1 Pedro", "2 Pedro",
  "1 João", "2 João", "3 João", "Judas", "Apocalipse",
] as const;

const normalizar = (v: string) =>
  v.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Posição do livro na Bíblia (1..66). Desconhecido vai para o fim. */
export function ordemDoLivro(livro: string): number {
  if (!livro?.trim()) return 999;
  const alvo = normalizar(livro);
  const i = LIVROS_BIBLIA.findIndex((l) => normalizar(l) === alvo);
  return i >= 0 ? i + 1 : 999;
}

/* ------------------------- Datas ------------------------- */

/** "2026-09-08" -> "08/09/2026" */
export function isoParaBR(iso: string): string {
  if (!iso) return "";
  const [a, m, d] = iso.split("-");
  return a && m && d ? `${d}/${m}/${a}` : iso;
}

/** "08/09/2026" -> "2026-09-08" (null quando inválida) */
export function brParaIso(br: string): string | null {
  const m = br.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mes, ano] = m as unknown as [string, string, string, string];
  const dia = Number(d);
  const mm = Number(mes);
  const aa = Number(ano);
  if (mm < 1 || mm > 12 || dia < 1 || dia > 31 || aa < 1900) return null;
  const dt = new Date(aa, mm - 1, dia);
  if (dt.getDate() !== dia || dt.getMonth() !== mm - 1) return null;
  return `${ano}-${mes}-${d}`;
}

/** Máscara progressiva DD/MM/AAAA enquanto digita. */
export function mascaraData(valor: string): string {
  const n = valor.replace(/\D/g, "").slice(0, 8);
  if (n.length <= 2) return n;
  if (n.length <= 4) return `${n.slice(0, 2)}/${n.slice(2)}`;
  return `${n.slice(0, 2)}/${n.slice(2, 4)}/${n.slice(4)}`;
}

export const hojeIso = () => new Date().toISOString().slice(0, 10);
