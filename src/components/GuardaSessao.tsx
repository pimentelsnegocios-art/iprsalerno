import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import { supabase } from "@/integrations/supabase/client";

const ROTAS_PUBLICAS = ["/login", "/cadastro", "/reset-password"];

export function GuardaSessao({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [liberado, setLiberado] = useState(false);

  const publica = ROTAS_PUBLICAS.some((r) => pathname === r || pathname.startsWith(`${r}/`));

  useEffect(() => {
    let ativo = true;

    async function verificar() {
      const { data } = await supabase.auth.getUser();
      if (!ativo) return;
      if (!data.user && !publica) {
        setLiberado(false);
        navigate({ to: "/login", replace: true });
        return;
      }
      setLiberado(true);
    }

    void verificar();

    const { data: sub } = supabase.auth.onAuthStateChange((evento) => {
      if (evento === "SIGNED_OUT" && !publica) {
        setLiberado(false);
        navigate({ to: "/login", replace: true });
      }
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate, pathname, publica]);

  if (!liberado) {
    return <div className="min-h-dvh bg-background" aria-hidden />;
  }

  return <>{children}</>;
}
