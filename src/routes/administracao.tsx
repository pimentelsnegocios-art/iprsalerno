import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { Check, Loader2, Lock, Users, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/AppShell";
import { usePerfil } from "@/hooks/usePerfil";
import { supabase } from "@/integrations/supabase/client";
import { CARGOS, MINISTERIOS_DISPONIVEIS, podeAprovarCadastros } from "@/lib/permissoes";

export const Route = createFileRoute("/administracao")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Administração — IPRB Renovada" },
      {
        name: "description",
        content: "Aprovação de cadastros pendentes com definição de cargo e ministérios.",
      },
      { property: "og:title", content: "Administração — IPRB Renovada" },
      { property: "og:description", content: "Aprovação de novos membros da igreja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Administracao,
});

interface Pendente {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  ministerios: string[] | null;
}

function Administracao() {
  const { permissao, carregando: carregandoPerfil } = usePerfil();
  const [pendentes, setPendentes] = useState<Pendente[]>([]);
  const [carregando, setCarregando] = useState(true);

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, nome, email, cargo, ministerios")
      .eq("status", "Pendente")
      .order("nome");
    setPendentes((data as Pendente[] | null) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  type Campos = { cargo?: string; ministerios?: string[]; status?: string };

  async function atualizar(id: string, campos: Campos) {
    const { error } = await supabase.from("profiles").update(campos).eq("id", id);
    if (error) {
      toast.error("Você não tem permissão para essa alteração.");
      return false;
    }
    setPendentes((atual) =>
      campos.status
        ? atual.filter((p) => p.id !== id)
        : atual.map((p) => (p.id === id ? { ...p, ...campos } : p)),
    );
    return true;
  }

  if (carregandoPerfil || carregando) {
    return (
      <AppShell>
        <PageHeader title="Administração" />
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!podeAprovarCadastros(permissao)) {
    return (
      <AppShell>
        <PageHeader title="Administração" />
        <div className="surface-card mx-5 mt-5 p-5 text-center">
          <Lock className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-sm">Área exclusiva da liderança e dos administradores.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Administração" subtitle="Aprovação de cadastros pendentes" />
      <div className="px-5 py-5">
        <Link
          to="/admin/membros"
          className="surface-card flex items-center gap-3 p-4 text-sm font-semibold"
        >
          <Users className="size-5 text-primary" /> Ir para Hall de Membros
        </Link>

        <h2 className="mt-6 font-display text-lg">Cadastros pendentes</h2>
        <div className="mt-3 space-y-3">
          {pendentes.map((p) => (
            <div key={p.id} className="surface-card p-4">
              <p className="font-semibold">{p.nome}</p>
              <p className="text-xs text-soft">{p.email}</p>

              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">Cargo</p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {CARGOS.map((c) => (
                  <button
                    key={c}
                    onClick={() => void atualizar(p.id, { cargo: c })}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      p.cargo === c ? "bg-primary text-primary-foreground" : "bg-secondary text-soft"
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>

              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-primary">
                Ministérios (pode marcar vários)
              </p>
              <div className="mt-1 flex flex-wrap gap-1.5">
                {MINISTERIOS_DISPONIVEIS.map((m) => {
                  const marcado = (p.ministerios ?? []).includes(m);
                  return (
                    <button
                      key={m}
                      onClick={() => {
                        const atuais = p.ministerios ?? [];
                        void atualizar(p.id, {
                          ministerios: marcado ? atuais.filter((x) => x !== m) : [...atuais, m],
                        });
                      }}
                      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                        marcado ? "bg-primary text-primary-foreground" : "bg-secondary text-soft"
                      }`}
                    >
                      {marcado ? "✓ " : ""}
                      {m}
                    </button>
                  );
                })}
                <button
                  onClick={() => void atualizar(p.id, { ministerios: [] })}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    (p.ministerios ?? []).length === 0
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-soft"
                  }`}
                >
                  Nenhum
                </button>
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={async () => {
                    if (await atualizar(p.id, { status: "Aprovado" })) {
                      toast.success(`${p.nome} aprovado(a)!`);
                    }
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground"
                >
                  <Check className="size-4" /> Aprovar
                </button>
                <button
                  onClick={async () => {
                    if (await atualizar(p.id, { status: "Bloqueado" })) {
                      toast.success("Cadastro recusado.");
                    }
                  }}
                  className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-sm font-semibold text-destructive"
                >
                  <X className="size-4" /> Recusar
                </button>
              </div>
            </div>
          ))}
          {pendentes.length === 0 ? (
            <p className="text-sm text-soft">Nenhum cadastro pendente.</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
