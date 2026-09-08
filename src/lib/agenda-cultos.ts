import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { isoParaBR } from "@/lib/livros-biblia";

export interface LouvorCulto {
  titulo: string;
  artista: string;
  tom: string;
}

export interface Culto {
  id: string;
  slug: string;
  dia: string;
  data: string | null;
  horario: string;
  tema: string;
  pregador: string;
  dirigente: string;
  tipo: string;
  descricao: string;
  louvores: LouvorCulto[];
}

export const dataCultoBR = (c: Culto) => (c.data ? isoParaBR(c.data) : "Data a definir");

export async function listarCultos(): Promise<Culto[]> {
  const { data, error } = await supabase
    .from("agenda_cultos")
    .select("*")
    .order("data", { ascending: true });
  if (error) {
    toast.error("Não foi possível carregar a agenda.");
    return [];
  }
  return (data ?? []).map((c) => ({
    id: c.id,
    slug: c.slug || c.id,
    dia: c.dia || c.titulo,
    data: c.data,
    horario: c.horario ?? "",
    tema: c.tema ?? "",
    pregador: c.pregador ?? "",
    dirigente: c.dirigente ?? "",
    tipo: c.tipo ?? "Culto",
    descricao: c.descricao ?? "",
    louvores: Array.isArray(c.louvores) ? (c.louvores as unknown as LouvorCulto[]) : [],
  }));
}

export async function salvarCulto(id: string | null, valores: Record<string, unknown>) {
  const { error } = id
    ? await supabase.from("agenda_cultos").update(valores).eq("id", id)
    : await supabase.from("agenda_cultos").insert(valores as never);
  if (error) {
    toast.error(
      error.message.includes("row-level security")
        ? "Você não tem permissão para alterar a agenda."
        : "Não foi possível salvar o culto.",
    );
    return false;
  }
  toast.success("Agenda atualizada.");
  return true;
}

export async function excluirCulto(id: string) {
  const { error } = await supabase.from("agenda_cultos").delete().eq("id", id);
  if (error) {
    toast.error("Não foi possível excluir o culto.");
    return false;
  }
  toast.success("Culto removido da agenda.");
  return true;
}

/** Lê os cultos direto do banco e permite recarregar após alterações. */
export function useCultos() {
  const [cultos, setCultos] = useState<Culto[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setCultos(await listarCultos());
    setCarregando(false);
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { cultos, carregando, recarregar };
}
