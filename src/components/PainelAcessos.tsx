import { ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";

interface Conta {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  status: string;
}

const PAPEIS = [
  { valor: "membro", label: "Membro" },
  { valor: "lider", label: "Liderança" },
  { valor: "admin", label: "Administrador" },
] as const;

export function PainelAcessos() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, nome, email, cargo, status")
      .order("nome");
    setContas((data as Conta[]) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  async function promover(id: string, papel: string) {
    const { error } = await supabase.rpc("promote_user", { target_id: id, new_role: papel });
    if (error) {
      toast.error("Você não tem permissão para alterar acessos.");
      return;
    }
    toast.success("Acesso atualizado!");
    void carregar();
  }

  if (carregando || contas.length <= 1) return null;

  return (
    <div className="surface-card mx-5 mt-4 p-4">
      <h2 className="flex items-center gap-2 font-display text-lg">
        <ShieldCheck className="size-4 text-primary" /> Acessos do sistema
      </h2>
      <p className="mt-1 text-xs text-soft">
        Somente administradores conseguem alterar. Ninguém pode promover a si mesmo.
      </p>
      <ul className="mt-3 divide-y divide-border">
        {contas.map((c) => (
          <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">{c.nome}</p>
              <p className="truncate text-xs text-soft">
                {c.cargo} · {c.status}
              </p>
            </div>
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) void promover(c.id, e.target.value);
                e.target.value = "";
              }}
              className="rounded-xl border border-border bg-transparent px-2 py-1.5 text-xs"
            >
              <option value="">Alterar acesso</option>
              {PAPEIS.map((p) => (
                <option key={p.valor} value={p.valor}>
                  {p.label}
                </option>
              ))}
            </select>
          </li>
        ))}
      </ul>
    </div>
  );
}
