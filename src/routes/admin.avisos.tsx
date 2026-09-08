import { appConfirm, appPrompt } from "@/components/ui/AppDialog";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Lock, Pencil, Plus, Trash2, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { acoes, hojeBR, useAppStore, type Aviso } from "@/lib/app-store";
import { usePerfil } from "@/hooks/usePerfil";
import { ehAdmin } from "@/lib/permissoes";

export const Route = createFileRoute("/admin/avisos")({
  head: () => ({
    meta: [
      { title: "Gestão de Avisos — IPR" },
      {
        name: "description",
        content: "Criar, editar e excluir avisos da Igreja Presbiteriana Renovada.",
      },
      { property: "og:title", content: "Gestão de Avisos — IPR" },
      { property: "og:description", content: "Painel de avisos da liderança." },
    ],
  }),
  component: AdminAvisos,
});

const vazio = { titulo: "", texto: "", data: "", fixadoHome: false };

function AdminAvisos() {
  const { avisos } = useAppStore();
  const [aberto, setAberto] = useState(false);
  const [editando, setEditando] = useState<Aviso | null>(null);
  const [form, setForm] = useState(vazio);

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
    setForm({ ...vazio, data: new Date().toISOString().slice(0, 10) });
    setAberto(true);
  };

  const abrirEdicao = (a: Aviso) => {
    setEditando(a);
    setForm({ titulo: a.titulo, texto: a.texto, data: "", fixadoHome: a.fixadoHome });
    setAberto(true);
  };

  const salvar = () => {
    if (!form.titulo.trim()) return;
    const data = form.data
      ? new Date(`${form.data}T12:00:00`).toLocaleDateString("pt-BR")
      : hojeBR();
    if (editando) {
      acoes.atualizarAviso(editando.id, {
        titulo: form.titulo,
        texto: form.texto,
        fixadoHome: form.fixadoHome,
        ...(form.data ? { data } : {}),
      });
    } else {
      acoes.criarAviso({
        titulo: form.titulo,
        texto: form.texto,
        data,
        autor: meuNome,
        fixadoHome: form.fixadoHome,
      });
    }
    setAberto(false);
  };

  const excluir = async (a: Aviso) => {
    if (await appConfirm(`Excluir o aviso "${a.titulo}"?`)) acoes.excluirAviso(a.id);
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

        {avisos.map((a) => (
          <article key={a.id} className="surface-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-lg text-primary">{a.titulo}</h2>
                <p className="mt-1 text-sm">{a.texto}</p>
                <p className="mt-2 text-xs text-soft">
                  {a.autor} · {a.data}
                  {a.fixadoHome ? " · fixado na Home" : ""}
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
                  onClick={() => excluir(a)}
                  className="rounded-lg bg-secondary p-2 text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            </div>
          </article>
        ))}
        {avisos.length === 0 ? <p className="text-sm text-soft">Nenhum aviso cadastrado.</p> : null}
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
                value={form.texto}
                onChange={(e) => setForm({ ...form, texto: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm font-normal normal-case tracking-normal text-foreground"
              />
            </label>

            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-soft">
              Data do evento
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
                checked={form.fixadoHome}
                onChange={(e) => setForm({ ...form, fixadoHome: e.target.checked })}
                className="size-4 accent-current text-primary"
              />
              Fixar na Home?
            </label>

            <div className="mt-5 flex gap-2">
              <button
                onClick={salvar}
                className="flex-1 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Salvar
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
