import { useSyncExternalStore } from "react";

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
  /** data URL da imagem ou PDF */
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

interface PixState {
  contribuicoes: Contribuicao[];
}

const KEY = "ipr-pix-store-v1";

let state: PixState = { contribuicoes: [] };
let hydrated = false;
const listeners = new Set<() => void>();

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

function hydrate() {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PixState>;
      state = { contribuicoes: parsed.contribuicoes ?? [] };
    }
  } catch {
    /* ignore */
  }
}

function emit() {
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  hydrate();
  listeners.add(listener);
  listener();
  return () => listeners.delete(listener);
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
  enviar(dados: Omit<Contribuicao, "id" | "status" | "enviadoEm">) {
    const nova: Contribuicao = {
      ...dados,
      id: crypto.randomUUID(),
      status: "pendente",
      enviadoEm: new Date().toISOString(),
    };
    state = { contribuicoes: [nova, ...state.contribuicoes] };
    emit();
    return nova;
  },
  confirmar(id: string, revisor: string) {
    state = {
      contribuicoes: state.contribuicoes.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "confirmado" as const,
              motivo: undefined,
              revisadoPor: revisor,
              revisadoEm: new Date().toISOString(),
            }
          : c,
      ),
    };
    emit();
  },
  rejeitar(id: string, revisor: string, motivo: string) {
    state = {
      contribuicoes: state.contribuicoes.map((c) =>
        c.id === id
          ? {
              ...c,
              status: "rejeitado" as const,
              motivo,
              revisadoPor: revisor,
              revisadoEm: new Date().toISOString(),
            }
          : c,
      ),
    };
    emit();
  },
};
