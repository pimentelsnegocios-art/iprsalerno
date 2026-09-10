/** Máscara de Real: usuário digita só números, os 2 últimos são centavos. */
export function formatarValorBRL(valorString: string): string {
  const apenasNumeros = (valorString ?? "").replace(/\D/g, "");
  if (!apenasNumeros) return "R$ 0,00";
  const valor = parseInt(apenasNumeros, 10) / 100;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valor);
}

/** Converte o texto mascarado em número (reais). */
export function valorBRLParaNumero(valorString: string): number {
  const apenasNumeros = (valorString ?? "").replace(/\D/g, "");
  if (!apenasNumeros) return 0;
  return parseInt(apenasNumeros, 10) / 100;
}

/** Converte um número em texto mascarado, para preencher o campo ao editar. */
export function numeroParaValorBRL(valor: number): string {
  return formatarValorBRL(String(Math.round((valor || 0) * 100)));
}
