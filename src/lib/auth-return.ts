export function caminhoSeguroDeRetorno(value: unknown): string | null {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) return null;
  return value;
}

export function irParaRetorno(next: string | null, fallback = "/") {
  window.location.assign(next ?? fallback);
}