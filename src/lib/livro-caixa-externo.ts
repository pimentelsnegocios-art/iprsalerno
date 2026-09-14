import { toast } from "sonner";

const LIVRO_CAIXA_URL = "https://livro-caixaiprb.lovable.app";

export type DestinoLivroCaixa = "painel" | "minhas-contribuicoes";

export function abrirLivroCaixa(destino: DestinoLivroCaixa) {
  const caminho = destino === "painel" ? "/painel" : "/minhas-contribuicoes";
  const novaAba = window.open(`${LIVRO_CAIXA_URL}${caminho}`, "_blank", "noopener,noreferrer");

  if (!novaAba) {
    toast.error("Permita a abertura de uma nova aba para acessar o Livro Caixa.");
    return;
  }

  toast.success("Abrindo Livro Caixa...");
}