import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

import { supabase } from "@/integrations/supabase/client";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!ativo) return;
      setUser(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data }) => {
      if (!ativo) return;
      setUser(data.user ?? null);
      setCarregando(false);
    });

    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, carregando };
}
