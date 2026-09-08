import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { hojeIso, isoParaBR } from "@/lib/livros-biblia";

export interface AvisoIgreja {
  id: string;
  titulo: string;
  descricao: string;
  autor: string;
  data_publicacao: string;
  fixado_home: boolean;
  tipo: string;
}

export const dataAvisoBR = (a: AvisoIgreja) => isoParaBR(a.data_publicacao);

export async function listarAvisos(): Promise<AvisoIgreja[]> {
  const { data, error } = await supabase
    .from("avisos")
    .select("*")
    .order("fixado_home", { ascending: false })
    .order("data_publicacao", { ascending: false });
  if (error) {
    toast.error("Não foi possível carregar os avisos.");
    return [];
  }
  return (data ?? []) as AvisoIgreja[];
}

export async function salvarAviso(id: string | null, valores: Record<string, unknown>) {
  const { error } = id
    ? await supabase.from("avisos").update(valores).eq("id", id)
    : await supabase.from("avisos").insert({ data_publicacao: hojeIso(), ...valores } as never);
  if (error) {
    toast.error(
      error.message.includes("row-level security")
        ? "Você não tem permissão para publicar avisos."
        : "Não foi possível salvar o aviso.",
    );
    return false;
  }
  toast.success("Aviso salvo.");
  return true;
}

export async function excluirAviso(id: string) {
  const { error } = await supabase.from("avisos").delete().eq("id", id);
  if (error) {
    toast.error("Não foi possível excluir o aviso.");
    return false;
  }
  toast.success("Aviso excluído.");
  return true;
}

export function useAvisos() {
  const [avisos, setAvisos] = useState<AvisoIgreja[]>([]);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    setAvisos(await listarAvisos());
    setCarregando(false);
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { avisos, carregando, recarregar };
}
