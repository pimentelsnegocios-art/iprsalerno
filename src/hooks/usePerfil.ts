import { useCallback, useEffect, useState } from "react";

import { supabase } from "@/integrations/supabase/client";
import { perfilVazio, type PerfilPermissao } from "@/lib/permissoes";

export interface PerfilAtual extends PerfilPermissao {
  id: string;
  nome: string;
  email: string;
  foto_url: string | null;
}

export function usePerfil() {
  const [perfil, setPerfil] = useState<PerfilAtual | null>(null);
  const [carregando, setCarregando] = useState(true);

  const recarregar = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    if (!auth.user) {
      setPerfil(null);
      setCarregando(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, nome, email, cargo, status, ministerios, foto_url")
      .eq("id", auth.user.id)
      .maybeSingle();
    setPerfil(
      data
        ? {
            id: data.id,
            nome: data.nome,
            email: data.email,
            foto_url: data.foto_url,
            cargo: data.cargo,
            status: data.status,
            ministerios: data.ministerios ?? [],
          }
        : null,
    );
    setCarregando(false);
  }, []);

  useEffect(() => {
    void recarregar();
  }, [recarregar]);

  return { perfil, permissao: (perfil as PerfilPermissao | null) ?? perfilVazio, carregando, recarregar };
}
