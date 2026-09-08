import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Pencil, Plus, Trash2, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { appConfirm } from "@/components/ui/AppDialog";
import { usePerfil } from "@/hooks/usePerfil";
import {
  dataAvisoBR,
  excluirAviso,
  salvarAviso,
  useAvisos,
  type AvisoIgreja,
} from "@/lib/avisos-db";
import { hojeIso } from "@/lib/livros-biblia";
import { ehAdmin } from "@/lib/permissoes";

export const Route = createFileRoute("/admin/avisos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Gestão de Avisos — IPRB Renovada" },
      {
        name: "description",
        content: "Criar, editar e excluir avisos da Igreja Presbiteriana Renovada.",
      },
      { property: "og:title", content: "Gestão de Avisos — IPRB Renovada" },
      { property: "og:description", content: "Painel de avisos da liderança." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminAvisos,
});

const vazio = { titulo: "", descricao: "", data: hojeIso(), fixado_home: false };

function AdminAvisos() {
  const { avisos, carregando, recarregar } = useAvisos();
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<AvisoIgreja | null>(null);
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);

  const { perfil, permissao } = usePerfil();
  const admin = ehAdmin(permissao);
  const meuNome = perfil?.nome ?? "Liderança";

  if (!admin) {
    return (
      <AppShell>
        <PageHeader title="Gestão de Avisos" />
        <div className="surface-card mx-5 mt-5 p-5 text-center">
          <Lock className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-sm">
            Somente Pastor, Presbítero, Admin e Fundador podem publicar avisos.
          </p>
        </div>
      </AppShell>
    );
  }

  const abrirNovo = () => {
    setEditando(null);
    setForm({ ...vazio, data: hojeIso() });
    setAberto(true);
  };

  const abrirEdicao = (a: AvisoIgreja) => {
    setEditando(a);
    setForm({
      titulo: a.titulo,
      descricao: a.descricao,
      data: a.data_publicacao,
      fixado_home: a.fixado_home,
    });
    setAberto(true);
  };

  const salvar = async () => {
    if (!form.titulo.trim()) return;
    setSalvando(true);
    const ok = await salvarAviso(editando?.id ?? null, {
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim(),
      data_publicacao: form.data || hojeIso(),
      fixado_home: form.fixado_home,
      ...(editando ? {} : { autor: meuNome, tipo: "geral" }),
    });
    setSalvando(false);
    if (!ok) return;
    setAberto(false);
    await recarregar();
  };

  const excluir = async (a: AvisoIgreja) => {
    if (!(await appConfirm(`Excluir o aviso "${a.titulo}"?`))) return;
    if (await excluirAviso(a.id)) await recarregar();
  };

  return (
    <AppShell>
      <PageHeader title="Gestão de Avisos" subtitle="Publique comunicados oficiais" />
      <div className="space-y-3 px-5 py-5">
        <button
          onClick={abrirNovo}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Novo Aviso
        </button>

        {carregando ? <p className="text-sm text-soft">Carregando…</p> : null}

        {avisos.map((a) => (
          <article key={a.id} className="surface-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg text-primary">{a.titulo}</h2>
                <p className="mt-1 text-sm">{a.descricao}</p>
                <p className="mt-2 text-xs text-soft">
                  {a.autor} · {dataAvisoBR(a)}
                  {a.fixado_home ? " · fixado na Home" : ""}
                </p>
              </div>
              <div className="flex shrink-0 gap-1.5">
                <button
                  aria-label={`Editar ${a.titulo}`}
                  onClick={() => abrirEdicao(a)}
                  className="rounded-lg bg-secondary p-2 text-primary"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  aria-label={`Excluir ${a.titulo}`}
                  onClick={() => void excluir(a)}
                  className="rounded-lg bg-secondary p-2 text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
        {!carregando && avisos.length === 0 ? (
          <p className="text-sm text-soft">Nenhum aviso cadastrado.</p>
        ) : null}
      </div>

      {aberto ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-5">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-popover p-5 sm:rounded-2xl">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl">{editando ? "Editar aviso" : "Novo aviso"}</h2>
              <button aria-label="Fechar" onClick={() => setAberto(false)}>
                <X className="size-5 text-soft" />
              </button>
            </div>

            <label className="mt-4 block text-xs font-semibold uppercase tracking-wide text-soft">
              Título
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground"
              />
            </label>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-soft">
              Descrição
              <textarea
                rows={4}
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground"
              />
            </label>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-soft">
              Data do aviso
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-normal text-foreground"
              />
            </label>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-soft">
              Autor
              <input
                readOnly
                value={editando ? editando.autor : meuNome}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-normal normal-case tracking-normal text-soft"
              />
            </label>

            <label className="mt-4 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.fixado_home}
                onChange={(e) => setForm({ ...form, fixado_home: e.target.checked })}
                className="size-4 accent-current text-primary"
              />
              Fixar na Home?
            </label>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => void salvar()}
                disabled={salvando}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {salvando ? "Salvando…" : "Salvar"}
              </button>
              <button
                onClick={() => setAberto(false)}
                className="rounded-lg bg-secondary px-4 py-2.5 text-sm font-semibold text-soft"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
