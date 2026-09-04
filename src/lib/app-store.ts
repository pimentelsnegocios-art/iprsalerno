import { useSyncExternalStore } from "react";

import { avisos as avisosSeed, type Cargo, type MinisterioSlug } from "@/lib/church-data";

export interface Aviso {
  id: string;
  titulo: string;
  texto: string;
  data: string;
  autor: string;
  fixadoHome: boolean;
}

export type StatusMembro = "pendente" | "aprovado" | "bloqueado";

export interface Membro {
  id: string;
  nome: string;
  email: string;
  cargo: Cargo;
  ministerio: MinisterioSlug | "nenhum";
  funcao: string;
  acesso: "Admin" | "Membro";
  status: StatusMembro;
  foto: string | null;
}

interface AppState {
  avisos: Aviso[];
  membros: Membro[];
}

const KEY = "ipr-app-store-v1";

const avisosIniciais: Aviso[] = avisosSeed.map((a, i) => ({
  id: a.id,
  titulo: a.titulo,
  texto: a.texto,
  data: a.data,
  autor: a.autor,
  fixadoHome: i === 0,
}));

const membrosIniciais: Membro[] = [
  {
    id: "c1",
    nome: "Joana Reis",
    email: "joana@ipr.org.br",
    cargo: "Auxiliar de Caixa",
    ministerio: "nenhum",
    funcao: "Tesouraria",
    acesso: "Membro",
    status: "pendente",
    foto: null,
  },
  {
    id: "c2",
    nome: "Lucas Moreira",
    email: "lucas@ipr.org.br",
    cargo: "Membro",
    ministerio: "jovens",
    funcao: "Participante",
    acesso: "Membro",
    status: "pendente",
    foto: null,
  },
  {
    id: "m1",
    nome: "Pr. Marcos Andrade",
    email: "marcos@ipr.org.br",
    cargo: "Pastor",
    ministerio: "nenhum",
    funcao: "Pastor titular",
    acesso: "Admin",
    status: "aprovado",
    foto: null,
  },
  {
    id: "m2",
    nome: "Presb. Sérgio Lima",
    email: "sergio@ipr.org.br",
    cargo: "Presbítero",
    ministerio: "nenhum",
    funcao: "Conselho",
    acesso: "Admin",
    status: "aprovado",
    foto: null,
  },
  {
    id: "m3",
    nome: "Tiago Ferreira",
    email: "tiago@ipr.org.br",
    cargo: "Membro",
    ministerio: "jovens",
    funcao: "Líder de Jovens",
    acesso: "Membro",
    status: "aprovado",
    foto: null,
  },
  {
    id: "m4",
    nome: "Débora Nunes",
    email: "debora@ipr.org.br",
    cargo: "Membro",
    ministerio: "irmas",
    funcao: "Líder das Irmãs",
    acesso: "Membro",
    status: "aprovado",
    foto: null,
  },
  {
    id: "m5",
    nome: "Evandro Pimentel",
    email: "evandro@ipr.org.br",
    cargo: "Fundador",
    ministerio: "louvor",
    funcao: "Líder de Louvor",
    acesso: "Admin",
    status: "aprovado",
    foto: null,
  },
];

let state: AppState = { avisos: avisosIniciais, membros: membrosIniciais };
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
      const parsed = JSON.parse(raw) as Partial<AppState>;
      state = {
        avisos: parsed.avisos ?? state.avisos,
        membros: parsed.membros ?? state.membros,
      };
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

export function useAppStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export const hojeBR = () => new Date().toLocaleDateString("pt-BR");

export const acoes = {
  criarAviso(aviso: Omit<Aviso, "id">) {
    state = { ...state, avisos: [{ ...aviso, id: crypto.randomUUID() }, ...state.avisos] };
    emit();
  },
  atualizarAviso(id: string, patch: Partial<Aviso>) {
    state = {
      ...state,
      avisos: state.avisos.map((a) => (a.id === id ? { ...a, ...patch } : a)),
    };
    emit();
  },
  excluirAviso(id: string) {
    state = { ...state, avisos: state.avisos.filter((a) => a.id !== id) };
    emit();
  },
  atualizarMembro(id: string, patch: Partial<Membro>) {
    state = {
      ...state,
      membros: state.membros.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    };
    emit();
  },
};
