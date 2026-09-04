export const OPCOES_MINISTERIOS = [
  "Louvor",
  "Jovens",
  "Irmãs",
  "Diaconia",
  "Mídia",
  "Intercessão",
  "Infantil",
  "Recepção",
] as const;

export type MinisterioNome = (typeof OPCOES_MINISTERIOS)[number];

export function listaMinisterios(valores: string[] | null | undefined) {
  return valores && valores.length > 0 ? valores.join(", ") : "Sem ministério";
}
