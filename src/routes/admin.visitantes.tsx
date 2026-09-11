import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Lock, Search, Trash2, UserPlus, UserRound } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/AppShell";
import { appConfirm } from "@/components/ui/AppDialog";
import { usePerfil } from "@/hooks/usePerfil";
import { supabase } from "@/integrations/supabase/client";
import { excluirUsuario } from "@/lib/admin.functions";
import { podeAprovarCadastros, podeExcluirMembros } from "@/lib/permissoes";

export const Route = createFileRoute("/admin/visitantes")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hall de Visitantes — IPRB Renovada" },
      {
        name: "description",
        content: "Visitantes cadastrados na igreja, com conversão em membro e exclusão.",
      },
      { property: "og:title", content: "Hall de Visitantes — IPRB Renovada" },
      { property: "og:description", content: "Acompanhe quem está visitando a igreja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminVisitantes,
});

interface Visitante {
  id: string;
  nome: string;
  email: string;
  whatsapp: string | null;
  status: string;
  foto_url: string | null;
}

function AdminVisitantes() {
  const { permissao, carregando: carregandoPerfil } = usePerfil();
  const [lista, setLista] = useState<Visitante[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const apagarConta = useServerFn(excluirUsuario);

  const carregar = useCallback(async () => {
    const { data } = await supabase
      .from("profiles")
      .select("id, nome, email, whatsapp, status, foto_url")
      .eq("cargo", "Visitante")
      .order("nome");
    setLista((data as Visitante[] | null) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const filtrados = useMemo(
    () => lista.filter((v) => (v.nome ?? "").toLowerCase().includes(busca.trim().toLowerCase())),
    [lista, busca],
  );

  async function converter(v: Visitante) {
    const { error } = await supabase
      .from("profiles")
      .update({ cargo: "Membro", status: "Aprovado" })
      .eq("id", v.id);
    if (error) {
      toast.error("Você não tem permissão para essa alteração.");
      return;
    }
    toast.success(`${v.nome} agora é membro.`);
    setLista((atual) => atual.filter((x) => x.id !== v.id));
  }

  async function excluir(v: Visitante) {
    if (!(await appConfirm(`Excluir definitivamente o cadastro de ${v.nome}?`))) return;
    try {
      await apagarConta({ data: { targetId: v.id } });
      setLista((atual) => atual.filter((x) => x.id !== v.id));
      toast.success("Cadastro excluído.");
    } catch {
      toast.error("Não foi possível excluir esse cadastro.");
    }
  }

  if (carregando || carregandoPerfil) {
    return (
      <AppShell>
        <PageHeader title="Hall de Visitantes" back />
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!podeAprovarCadastros(permissao)) {
    return (
      <AppShell>
        <PageHeader title="Hall de Visitantes" back />
        <div className="surface-card mx-5 mt-5 p-5 text-center">
          <Lock className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-sm">Área exclusiva da liderança.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader
        title="Hall de Visitantes"
        subtitle={`Total de visitantes: ${lista.length}`}
        back
      />
      <div className="px-5 py-5">
        <label className="surface-card flex items-center gap-2 px-3 py-2.5">
          <Search className="size-4 text-soft" />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por nome"
            className="w-full bg-transparent text-sm outline-none"
          />
        </label>

        <div className="mt-4 space-y-3">
          {filtrados.map((v) => (
            <div key={v.id} className="surface-card p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/50 bg-secondary">
                  {v.foto_url ? (
                    <img src={v.foto_url} alt={v.nome} className="size-full object-cover" />
                  ) : (
                    <UserRound className="size-5 text-primary" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{v.nome}</p>
                  <p className="truncate text-[11px] text-soft">{v.email}</p>
                  {v.whatsapp ? (
                    <p className="truncate text-[11px] text-soft">{v.whatsapp}</p>
                  ) : null}
                </div>
              </div>
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <button
                  onClick={() => void converter(v)}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
                >
                  <UserPlus className="size-3.5" /> Tornar membro
                </button>
                {podeExcluirMembros(permissao) ? (
                  <button
                    onClick={() => void excluir(v)}
                    className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive px-3 py-2 text-xs font-semibold text-destructive"
                  >
                    <Trash2 className="size-3.5" /> Excluir
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {filtrados.length === 0 ? (
            <p className="text-sm text-soft">Nenhum visitante cadastrado.</p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
