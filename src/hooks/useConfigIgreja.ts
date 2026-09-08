import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";

export interface ConfigIgreja {
  id: string;
  nome: string;
  cnpj: string;
  endereco: string;
  mapa_url: string;
  pix_chave: string;
  pix_tipo: string;
  pix_banco: string;
}

export const CONFIG_PADRAO: ConfigIgreja = {
  id: "",
  nome: "Igreja Presbiteriana Renovada",
  cnpj: "",
  endereco:
    "Rua José Finoteli, 730 — Città di Salerno (Jardim Explanada), Campinas / SP",
  mapa_url: "https://maps.app.goo.gl/yuVVKkDf6Sh6ieoV6?g_st=ac",
  pix_chave: "louvoriprb7@gmail.com",
  pix_tipo: "E-mail",
  pix_banco: "Banco do Brasil",
};

export function useConfigIgreja() {
  const [config, setConfig] = useState<ConfigIgreja>(CONFIG_PADRAO);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    const { data } = await supabase
      .from("configuracao_igreja")
      .select("id, nome, cnpj, endereco, mapa_url, pix_chave, pix_tipo, pix_banco")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (data) setConfig(data as ConfigIgreja);
    setCarregando(false);
  }, []);

  useEffect(() => {
    void recarregar();

    const canal = supabase
      .channel("configuracao-igreja")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "configuracao_igreja" },
        () => void recarregar(),
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(canal);
    };
  }, [recarregar]);

  return { config, carregando, recarregar };
}
