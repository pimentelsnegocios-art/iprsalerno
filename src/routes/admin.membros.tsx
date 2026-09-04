import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Ban, Check, Lock, MoreHorizontal, Search, UserRound, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { PainelAcessos } from "@/components/PainelAcessos";
import { acoes, useAppStore, type Membro, type StatusMembro } from "@/lib/app-store";
import { ministerios, podeVerAdmin, usuarioAtual, type Cargo } from "@/lib/church-data";

export const Route = createFileRoute("/admin/membros")({
  head: () => ({
    meta: [
      { title: "Hall de Membros — IPR" },
      {
        name: "description",
        content: "Aprovação, cargos, ministérios e acessos dos membros da igreja.",
      },
      { property: "og:title", content: "Hall de Membros — IPR" },
      { property: "og:description", content: "Gestão de membros e permissões." },
    ],
  }),
  component: AdminMembros,
});

const cargos: Cargo[] = [
  "Membro",
  "Auxiliar de Caixa",
  "Presbítero",
  "Pastor",
  "Admin",
  "Fundador",
];

const tabs: { key: StatusMembro; label: string }[] = [
  { key: "pendente", label: "Pendentes" },
  { key: "aprovado", label: "Aprovados" },
  { key: "bloqueado", label: "Bloqueados" },
];

function AdminMembros() {
  const { membros } = useAppStore();
  const [tab, setTab] = useState<StatusMembro>("pendente");
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);

  const lista = useMemo(
    () =>
      membros.filter(
        (m) => m.status === tab && m.nome.toLowerCase().includes(busca.trim().toLowerCase()),
      ),
    [membros, tab, busca],
  );

  const emEdicao = membros.find((m) => m.id === aberto) ?? null;
  const pendentes = membros.filter((m) => m.status === "pendente").length;

  if (!podeVerAdmin(usuarioAtual.cargo)) {
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
      <PageHeader
        title="Hall de Membros"
        subtitle={`Total de Membros: ${membros.length}`}
      />
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
              {t.key === "pendente" && pendentes > 0 ? (
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
                {m.foto ? (
                  <img src={m.foto} alt={m.nome} className="size-full object-cover" />
                ) : (
                  <UserRound className="size-5 text-primary" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{m.nome}</p>
                <p className="truncate text-[11px] text-soft">
                  {m.cargo} · {m.ministerio === "nenhum" ? "Sem ministério" : m.ministerio} ·{" "}
                  {m.acesso}
                </p>
              </div>

              {m.status === "pendente" ? (
                <div className="flex gap-1.5">
                  <button
                    aria-label={`Aprovar ${m.nome}`}
                    onClick={() => acoes.atualizarMembro(m.id, { status: "aprovado" })}
                    className="rounded-lg bg-primary p-2 text-primary-foreground"
                  >
                    <Check className="size-4" />
                  </button>
                  <button
                    aria-label={`Bloquear ${m.nome}`}
                    onClick={() => acoes.atualizarMembro(m.id, { status: "bloqueado" })}
                    className="rounded-lg bg-secondary p-2 text-destructive"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ) : m.status === "bloqueado" ? (
                <button
                  onClick={() => acoes.atualizarMembro(m.id, { status: "aprovado" })}
                  className="rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-primary"
                >
                  Desbloquear
                </button>
              ) : (
                <button
                  aria-label={`Opções de ${m.nome}`}
                  onClick={() => setAberto(m.id)}
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
                onChange={(e) => acoes.atualizarMembro(emEdicao.id, { nome: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground"
              />
            </label>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-soft">
              Trocar cargo
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {cargos.map((c) => (
                <button
                  key={c}
                  onClick={() => acoes.atualizarMembro(emEdicao.id, { cargo: c })}
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
              Trocar ministério
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {["nenhum", ...ministerios.map((m) => m.slug)].map((slug) => (
                <button
                  key={slug}
                  onClick={() =>
                    acoes.atualizarMembro(emEdicao.id, {
                      ministerio: slug as Membro["ministerio"],
                    })
                  }
                  className={`rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                    emEdicao.ministerio === slug
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-soft"
                  }`}
                >
                  {slug}
                </button>
              ))}
            </div>

            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-soft">
              Alterar acesso
            </p>
            <div className="mt-1 flex gap-1.5">
              {(["Admin", "Membro"] as const).map((a) => (
                <button
                  key={a}
                  onClick={() => acoes.atualizarMembro(emEdicao.id, { acesso: a })}
                  className={`rounded-full px-3 py-1 text-[11px] font-medium ${
                    emEdicao.acesso === a
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-soft"
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>

            <button
              onClick={() => {
                acoes.atualizarMembro(emEdicao.id, { status: "bloqueado" });
                setAberto(null);
              }}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-destructive"
            >
              <Ban className="size-4" /> Bloquear usuário
            </button>

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
