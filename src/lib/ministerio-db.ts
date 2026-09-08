import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

/* ------------------------------ Tipos ------------------------------ */

export interface ParteLetraDB {
  quem: string;
  texto: string;
  marcacao?: string;
}

export interface EnsaioDB {
  id: string;
  ministerio_slug: string;
  data: string | null;
  horario: string;
  local: string;
  titulo: string;
  artista: string;
  tom: string;
  link: string;
  solistas: string[];
  partes: ParteLetraDB[];
  observacoes: string[];
  autor_nome: string;
  created_at: string;
}

export interface LouvorDB {
  id: string;
  ministerio_slug: string;
  aba: string;
  titulo: string;
  artista: string;
  tom: string;
  link: string;
  letra: string[];
  autor_nome: string;
}

export interface AvisoMinDB {
  id: string;
  ministerio_slug: string;
  titulo: string;
  texto: string;
  fixado: boolean;
  autor_nome: string;
  created_at: string;
}

export interface CheckinDB {
  id: string;
  ministerio_slug: string;
  texto: string;
  autor_id: string | null;
  autor_nome: string;
  created_at: string;
}

export interface PresencaDB {
  nome: string;
  presente: boolean;
}

export interface LouvorDoDiaDB {
  titulo: string;
  ministro: string;
  tom: string;
}

export interface EventoMinDB {
  id: string;
  ministerio_slug: string;
  titulo: string;
  tipo: string;
  data: string | null;
  hora: string;
  presencas: PresencaDB[];
  louvores: LouvorDoDiaDB[];
}

export interface VisitaDB {
  id: string;
  ministerio_slug: string;
  nome: string;
  endereco: string;
  data: string | null;
  hora: string;
  irmas: string[];
  realizada: boolean;
}

export interface LinhaCifraDB {
  acordes: string;
  letra: string;
}

export interface CifraDB {
  id: string;
  ministerio_slug: string;
  titulo: string;
  artista: string;
  tom: string;
  linhas: LinhaCifraDB[];
  autor_nome: string;
}

/* ------------------------------ Base ------------------------------ */

type Tabela =
  | "ministerio_ensaios"
  | "ministerio_repertorio"
  | "ministerio_avisos"
  | "ministerio_checkins"
  | "ministerio_agenda"
  | "ministerio_visitas"
  | "cifras";

async function listarPor<T>(
  tabela: Tabela,
  slug: string,
  coluna: string,
  ordem: { campo: string; asc: boolean },
): Promise<T[]> {
  const { data, error } = await supabase
    .from(tabela)
    .select("*")
    .eq(coluna, slug)
    .order(ordem.campo, { ascending: ordem.asc });
  if (error) {
    toast.error("Não foi possível carregar os dados.");
    return [];
  }
  return (data ?? []) as T[];
}

async function gravar(tabela: Tabela, id: string | null, valores: Record<string, unknown>) {
  const { error } = id
    ? await supabase.from(tabela).update(valores).eq("id", id)
    : await supabase.from(tabela).insert(valores);
  if (error) {
    toast.error(error.message.includes("row-level security")
      ? "Você não tem permissão para essa alteração."
      : "Não foi possível salvar. Tente novamente.");
    return false;
  }
  toast.success("Salvo com sucesso.");
  return true;
}

async function apagar(tabela: Tabela, id: string) {
  const { error } = await supabase.from(tabela).delete().eq("id", id);
  if (error) {
    toast.error("Não foi possível excluir. Tente novamente.");
    return false;
  }
  toast.success("Excluído.");
  return true;
}

/** Carrega uma lista do banco e devolve um recarregador. */
export function useLista<T>(carregar: () => Promise<T[]>) {
  const [lista, setLista] = useState<T[] | null>(null);
  const recarregar = useCallback(async () => {
    setLista(await carregar());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    void recarregar();
  }, [recarregar]);
  return { lista, recarregar };
}

/* ------------------------------ Ensaios ------------------------------ */

export const listarEnsaios = (slug: string) =>
  listarPor<EnsaioDB>("ministerio_ensaios", slug, "ministerio_slug", {
    campo: "created_at",
    asc: false,
  });

export const salvarEnsaio = (id: string | null, v: Record<string, unknown>) =>
  gravar("ministerio_ensaios", id, v);

export const excluirEnsaio = (id: string) => apagar("ministerio_ensaios", id);

/* ------------------------------ Repertório ------------------------------ */

export const listarRepertorio = (slug: string) =>
  listarPor<LouvorDB>("ministerio_repertorio", slug, "ministerio_slug", {
    campo: "titulo",
    asc: true,
  });

export const salvarLouvor = (id: string | null, v: Record<string, unknown>) =>
  gravar("ministerio_repertorio", id, v);

export const excluirLouvor = (id: string) => apagar("ministerio_repertorio", id);

/* ------------------------------ Avisos ------------------------------ */

export const listarAvisosMin = (slug: string) =>
  listarPor<AvisoMinDB>("ministerio_avisos", slug, "ministerio_slug", {
    campo: "created_at",
    asc: false,
  });

export const salvarAvisoMin = (id: string | null, v: Record<string, unknown>) =>
  gravar("ministerio_avisos", id, v);

export const excluirAvisoMin = (id: string) => apagar("ministerio_avisos", id);

/* ------------------------------ Oração ------------------------------ */

export async function lerProposito(slug: string): Promise<string> {
  const { data } = await supabase
    .from("ministerio_oracao")
    .select("proposito")
    .eq("ministerio_slug", slug)
    .maybeSingle();
  return data?.proposito ?? "";
}

export async function salvarProposito(slug: string, proposito: string) {
  const { error } = await supabase
    .from("ministerio_oracao")
    .upsert({ ministerio_slug: slug, proposito }, { onConflict: "ministerio_slug" });
  if (error) {
    toast.error("Não foi possível salvar o propósito.");
    return false;
  }
  toast.success("Propósito atualizado.");
  return true;
}

export const listarCheckins = (slug: string) =>
  listarPor<CheckinDB>("ministerio_checkins", slug, "ministerio_slug", {
    campo: "created_at",
    asc: false,
  });

export const salvarCheckin = (id: string | null, v: Record<string, unknown>) =>
  gravar("ministerio_checkins", id, v);

export const excluirCheckin = (id: string) => apagar("ministerio_checkins", id);

/* ------------------------------ Agenda do ministério ------------------------------ */

export const listarAgendaMin = (slug: string) =>
  listarPor<EventoMinDB>("ministerio_agenda", slug, "ministerio_slug", {
    campo: "data",
    asc: true,
  });

export const salvarEventoMin = (id: string | null, v: Record<string, unknown>) =>
  gravar("ministerio_agenda", id, v);

export const excluirEventoMin = (id: string) => apagar("ministerio_agenda", id);

/* ------------------------------ Visitas ------------------------------ */

export const listarVisitas = (slug: string) =>
  listarPor<VisitaDB>("ministerio_visitas", slug, "ministerio_slug", {
    campo: "data",
    asc: true,
  });

export const salvarVisita = (id: string | null, v: Record<string, unknown>) =>
  gravar("ministerio_visitas", id, v);

export const excluirVisita = (id: string) => apagar("ministerio_visitas", id);

/* ------------------------------ Cifras ------------------------------ */

export const listarCifras = (slug: string) =>
  listarPor<CifraDB>("cifras", slug, "ministerio_slug", { campo: "titulo", asc: true });

export const salvarCifra = (id: string | null, v: Record<string, unknown>) =>
  gravar("cifras", id, v);

export const excluirCifra = (id: string) => apagar("cifras", id);
