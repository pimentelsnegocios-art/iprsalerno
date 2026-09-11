import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ban, Check, Loader2, Lock, MoreHorizontal, Search, Trash2, UserRound, X } from "lucide-react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/AppShell";
import { PainelAcessos } from "@/components/PainelAcessos";
import { supabase } from "@/integrations/supabase/client";
import { excluirUsuario } from "@/lib/admin.functions";
import { listaMinisterios } from "@/lib/ministerios-opcoes";
import { usePerfil } from "@/hooks/usePerfil";
import {
  CARGOS,
  MINISTERIOS_DISPONIVEIS,
  podeAprovarCadastros,
  podeExcluirMembros,
} from "@/lib/permissoes";

export const Route = createFileRoute("/admin/membros")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Hall de Membros — IPR" },
      {
        name: "description",
        content: "Aprovação, cargos, ministérios e acessos dos membros da igreja.",
      },
      { property: "og:title", content: "Hall de Membros — IPR" },
      { property: "og:description", content: "Gestão de membros e permissões." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminMembros,
});

interface Conta {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  status: string;
  ministerios: string[] | null;
  foto_url: string | null;
}

const tabs = [
  { key: "Pendente", label: "Pendentes" },
  { key: "Aprovado", label: "Aprovados" },
  { key: "Rejeitado", label: "Rejeitados" },
  { key: "Bloqueado", label: "Bloqueados" },
] as const;

const FUNDADOR = "louvoriprb7@gmail.com";

function AdminMembros() {
  const { permissao, carregando: carregandoPerfil } = usePerfil();
  const [contas, setContas] = useState<Conta[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [ehAdmin, setEhAdmin] = useState(false);
  const [meuId, setMeuId] = useState<string | null>(null);
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("Pendente");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const [confirmar, setConfirmar] = useState("");
  const [excluindo, setExcluindo] = useState(false);

  const apagarConta = useServerFn(excluirUsuario);

  const carregar = useCallback(async () => {
    const { data: auth } = await supabase.auth.getUser();
    setMeuId(auth.user?.id ?? null);
    if (auth.user) {
      const { data: admin } = await supabase.rpc("eh_gestor", { _user_id: auth.user.id });
      setEhAdmin(Boolean(admin));
    }
    const { data } = await supabase
      .from("profiles")
      .select("id, nome, email, cargo, status, ministerios, foto_url")
      .order("nome");
    setContas((data as Conta[] | null) ?? []);
    setCarregando(false);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  type Campos = Partial<Omit<Conta, "ministerios">> & { ministerios?: string[] };

  async function atualizar(id: string, campos: Campos) {
    const { error } = await supabase.from("profiles").update(campos).eq("id", id);
    if (error) {

      toast.error("Você não tem permissão para essa alteração.");
      return;
    }
    setContas((atual) => atual.map((c) => (c.id === id ? { ...c, ...campos } : c)));
  }

  const lista = useMemo(
    () =>
      contas.filter(
        (c) =>
          c.status === tab && (c.nome ?? "").toLowerCase().includes(busca.trim().toLowerCase()),
      ),
    [contas, tab, busca],
  );

  const emEdicao = contas.find((c) => c.id === aberto) ?? null;
  const pendentes = contas.filter((c) => c.status === "Pendente").length;
  const gestor = ehAdmin || podeAprovarCadastros(permissao);
  const podeExcluir =
    (podeExcluirMembros(permissao) || ehAdmin) &&
    emEdicao != null &&
    emEdicao.id !== meuId &&
    (emEdicao.email ?? "").toLowerCase() !== FUNDADOR;

  async function excluir() {
    if (!emEdicao) return;
    setExcluindo(true);
    try {
      await apagarConta({ data: { targetId: emEdicao.id } });
      setContas((atual) => atual.filter((c) => c.id !== emEdicao.id));
      setAberto(null);
      setConfirmar("");
      toast.success("Conta excluída do banco.");
    } catch {
      toast.error("Não foi possível excluir essa conta.");
    }
    setExcluindo(false);
  }

  if (carregando || carregandoPerfil) {
    return (
      <AppShell>
        <PageHeader title="Hall de Membros" />
        <div className="flex justify-center py-16">
          <Loader2 className="size-6 animate-spin text-primary" />
        </div>
      </AppShell>
    );
  }

  if (!gestor) {
    return (
      <AppShell>
        <PageHeader title="Hall de Membros" />
        <div className="surface-card mx-5 mt-5 p-5 text-center">
          <Lock className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-sm">Área exclusiva do Fundador e dos Admins.</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <PageHeader title="Hall de Membros" subtitle={`Total de Membros: ${contas.length}`} />
      <PainelAcessos />

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

        <div className="mt-4 flex gap-2">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-semibold ${
                tab === t.key ? "bg-primary text-primary-foreground" : "bg-secondary text-soft"
              }`}
            >
              {t.label}
              {t.key === "Pendente" && pendentes > 0 ? (
                <span className="rounded-full bg-destructive px-1.5 py-0.5 text-[10px] font-bold text-destructive-foreground">
                  {pendentes}
                </span>
              ) : null}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {lista.map((m) => (
            <div key={m.id} className="surface-card flex items-center gap-3 p-4">
              <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-primary/50 bg-secondary">
                {m.foto_url ? (
                  <img src={m.foto_url} alt={m.nome} className="size-full object-cover" />
                ) : (
                  <UserRound className="size-5 text-primary" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.nome}</p>
                <p className="truncate text-[11px] text-soft">
                  {m.cargo} · {listaMinisterios(m.ministerios)}
                </p>
              </div>

              {m.status === "Pendente" ? (
                <div className="flex gap-1.5">
                  <button
                    aria-label={`Aprovar ${m.nome}`}
                    onClick={() => atualizar(m.id, { status: "Aprovado" })}
                    className="rounded-lg bg-primary p-2 text-primary-foreground"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    aria-label={`Bloquear ${m.nome}`}
                    onClick={() => atualizar(m.id, { status: "Bloqueado" })}
                    className="rounded-lg bg-secondary p-2 text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : m.status === "Bloqueado" ? (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => atualizar(m.id, { status: "Aprovado" })}
                    className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-primary"
                  >
                    Desbloquear
                  </button>
                  <button
                    aria-label={`Opções de ${m.nome}`}
                    onClick={() => {
                      setConfirmar("");
                      setAberto(m.id);
                    }}
                    className="rounded-lg bg-secondary p-2 text-soft"
                  >
                    <MoreHorizontal className="size-4" />
                  </button>
                </div>
              ) : (
                <button
                  aria-label={`Opções de ${m.nome}`}
                  onClick={() => {
                    setConfirmar("");
                    setAberto(m.id);
                  }}
                  className="rounded-lg bg-secondary p-2 text-soft"
                >
                  <MoreHorizontal className="size-4" />
                </button>
              )}
            </div>
          ))}
          {lista.length === 0 ? (
            <p className="text-sm text-soft">Nenhum membro nesta aba.</p>
          ) : null}
        </div>
      </div>

      {emEdicao ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 sm:items-center sm:p-5">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-popover p-5 sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">{emEdicao.nome}</h2>
              <button aria-label="Fechar" onClick={() => setAberto(null)}>
                <X className="size-5 text-soft" />
              </button>
            </div>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-soft">
              Editar nome
              <input
                value={emEdicao.nome}
                onChange={(e) => atualizar(emEdicao.id, { nome: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground"
              />
            </label>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-soft">
              Trocar cargo
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {CARGOS.map((c) => (
                <button
                  key={c}
                  onClick={() => atualizar(emEdicao.id, { cargo: c })}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                    emEdicao.cargo === c
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-soft"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-soft">
              Ministérios (pode marcar vários)
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {MINISTERIOS_DISPONIVEIS.map((nome) => {
                const marcado = (emEdicao.ministerios ?? []).includes(nome);
                return (
                  <button
                    key={nome}
                    onClick={() => {
                      const atuais = emEdicao.ministerios ?? [];
                      const novos = marcado
                        ? atuais.filter((m) => m !== nome)
                        : [...atuais, nome];
                      void atualizar(emEdicao.id, { ministerios: novos });
                    }}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${
                      marcado ? "bg-primary text-primary-foreground" : "bg-secondary text-soft"
                    }`}
                  >
                    {marcado ? "✓ " : ""}
                    {nome}
                  </button>
                );
              })}
              <button
                onClick={() => void atualizar(emEdicao.id, { ministerios: [] })}
                className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-soft"
              >
                Nenhum
              </button>
            </div>

            <button
              onClick={() => {
                void atualizar(emEdicao.id, { status: "Bloqueado" });
                setAberto(null);
              }}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-destructive"
            >
              <Ban className="size-4" /> Bloquear usuário
            </button>

            {podeExcluir ? (
              <div className="mt-3 rounded-lg border border-destructive/50 p-3">
                <p className="text-xs text-soft">
                  Para apagar do banco definitivamente, digite <strong>EXCLUIR</strong>.
                </p>
                <input
                  value={confirmar}
                  onChange={(e) => setConfirmar(e.target.value)}
                  placeholder="EXCLUIR"
                  className="mt-2 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm"
                />
                <button
                  disabled={confirmar !== "EXCLUIR" || excluindo}
                  onClick={() => void excluir()}
                  className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-destructive px-4 py-2.5 text-sm font-semibold text-destructive disabled:opacity-40"
                >
                  {excluindo ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  Excluir de vez (Apagar do banco)
                </button>
              </div>
            ) : null}

            <button
              onClick={() => setAberto(null)}
              className="mt-2 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Concluir
            </button>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
