import { useSyncExternalStore } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

export type TipoContribuicao = "Dízimo" | "Oferta";
export type StatusContribuicao = "pendente" | "confirmado" | "rejeitado";

export interface Contribuicao {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  tipo: TipoContribuicao;
  valor: number;
  /** yyyy-MM */
  mesRef: string;
  comprovanteNome: string;
  comprovanteUrl: string;
  comprovanteTipo: "imagem" | "pdf";
  status: StatusContribuicao;
  motivo?: string | undefined;
  enviadoEm: string;
  revisadoPor?: string | undefined;
  revisadoEm?: string | undefined;
}

export const DADOS_PIX = {
  igreja: "Igreja Presbiteriana Renovada — IPRB Salerno",
  chave: "louvoriprb7@gmail.com",
  tipoChave: "E-mail",
  banco: "Banco do Brasil",
};

interface LinhaDB {
  id: string;
  usuario_id: string;
  usuario_nome: string;
  tipo: string;
  valor: number | string;
  mes_ref: string;
  comprovante_nome: string;
  comprovante_url: string;
  comprovante_tipo: string;
  status: string;
  motivo: string;
  revisado_por: string;
  revisado_em: string | null;
  created_at: string;
}

const mapear = (l: LinhaDB): Contribuicao => ({
  id: l.id,
  usuarioId: l.usuario_id,
  usuarioNome: l.usuario_nome,
  tipo: (l.tipo as TipoContribuicao) ?? "Oferta",
  valor: Number(l.valor),
  mesRef: l.mes_ref,
  comprovanteNome: l.comprovante_nome,
  comprovanteUrl: l.comprovante_url,
  comprovanteTipo: l.comprovante_tipo === "pdf" ? "pdf" : "imagem",
  status: (l.status as StatusContribuicao) ?? "pendente",
  motivo: l.motivo || undefined,
  enviadoEm: l.created_at,
  revisadoPor: l.revisado_por || undefined,
  revisadoEm: l.revisado_em ?? undefined,
});

let state: { contribuicoes: Contribuicao[] } = { contribuicoes: [] };
let carregado = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export async function recarregarContribuicoes() {
  const { data, error } = await supabase
    .from("contribuicoes")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) return;
  state = { contribuicoes: ((data ?? []) as unknown as LinhaDB[]).map(mapear) };
  emit();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!carregado) {
    carregado = true;
    void recarregarContribuicoes();
  }
  return () => {
    listeners.delete(listener);
  };
}

const getSnapshot = () => state;
const getServerSnapshot = () => state;

export function usePixStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const mesAtual = () => new Date().toISOString().slice(0, 7);

export function rotuloMes(mesRef: string) {
  const [ano, mes] = mesRef.split("-");
  const data = new Date(Number(ano), Number(mes) - 1, 1);
  const nome = data.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  return nome.charAt(0).toUpperCase() + nome.slice(1);
}

export const brlPix = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

async function atualizar(id: string, campos: Record<string, unknown>, sucesso: string) {
  const { error } = await supabase.from("contribuicoes").update(campos as never).eq("id", id);
  if (error) {
    toast.error("Não foi possível salvar agora. Tente novamente.");
    return;
  }
  toast.success(sucesso);
  await recarregarContribuicoes();
}

export const acoesPix = {
  possivelDuplicidade(usuarioId: string, mesRef: string, valor: number) {
    return state.contribuicoes.some(
      (c) =>
        c.usuarioId === usuarioId &&
        c.mesRef === mesRef &&
        Math.abs(c.valor - valor) < 0.005 &&
        c.status !== "rejeitado",
    );
  },
  async enviar(dados: Omit<Contribuicao, "id" | "status" | "enviadoEm">) {
    const { error } = await supabase.from("contribuicoes").insert({
      usuario_id: dados.usuarioId,
      usuario_nome: dados.usuarioNome,
      tipo: dados.tipo,
      valor: dados.valor,
      mes_ref: dados.mesRef,
      comprovante_nome: dados.comprovanteNome,
      comprovante_url: dados.comprovanteUrl,
      comprovante_tipo: dados.comprovanteTipo,
      status: "pendente",
    } as never);
    if (error) {
      toast.error("Não conseguimos registrar sua contribuição. Tente novamente.");
      return null;
    }
    toast.success("Comprovante enviado para conferência.");
    await recarregarContribuicoes();
    return true;
  },
  async confirmar(id: string, revisor: string) {
    await atualizar(
      id,
      { status: "confirmado", motivo: "", revisado_por: revisor, revisado_em: new Date().toISOString() },
      "Contribuição confirmada.",
    );
  },
  async rejeitar(id: string, revisor: string, motivo: string) {
    await atualizar(
      id,
      { status: "rejeitado", motivo, revisado_por: revisor, revisado_em: new Date().toISOString() },
      "Contribuição rejeitada.",
    );
  },
};
