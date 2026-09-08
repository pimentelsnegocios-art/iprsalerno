import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { appConfirm } from "@/components/ui/AppDialog";
import { usePerfil } from "@/hooks/usePerfil";
import {
  dataCultoBR,
  excluirCulto,
  salvarCulto,
  useCultos,
  type Culto,
  type LouvorCulto,
} from "@/lib/agenda-cultos";
import { podeGerirAgenda } from "@/lib/permissoes";

export const Route = createFileRoute("/agenda")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Agenda de Cultos — IPRB Renovada" },
      {
        name: "description",
        content: "Cultos de quinta, sábado e domingo com pregador, dirigente e tema.",
      },
      { property: "og:title", content: "Agenda de Cultos — IPRB Renovada" },
      { property: "og:description", content: "Programação completa de cultos e eventos." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Agenda,
});

const vazio = {
  dia: "",
  data: "",
  horario: "",
  tema: "",
  pregador: "",
  dirigente: "",
  louvores: "",
};

const paraTexto = (l: LouvorCulto[]) =>
  l.map((x) => [x.titulo, x.artista, x.tom].join(" | ")).join("\n");

const paraLista = (texto: string): LouvorCulto[] =>
  texto
    .split("\n")
    .map((linha) => linha.trim())
    .filter(Boolean)
    .map((linha) => {
      const [titulo = "", artista = "", tom = ""] = linha.split("|").map((p) => p.trim());
      return { titulo, artista, tom: tom || "C" };
    });

function Agenda() {
  const { perfil, permissao } = usePerfil();
  const gestor = podeGerirAgenda(permissao);
  const { cultos, carregando, recarregar } = useCultos();
  const [editando, setEditando] = useState<string | null>(null);
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState(vazio);
  const [salvando, setSalvando] = useState(false);

  const abrirNovo = () => {
    setForm(vazio);
    setEditando(null);
    setAberto(true);
  };

  const abrirEdicao = (c: Culto) => {
    setForm({
      dia: c.dia,
      data: c.data ?? "",
      horario: c.horario,
      tema: c.tema,
      pregador: c.pregador,
      dirigente: c.dirigente,
      louvores: paraTexto(c.louvores),
    });
    setEditando(c.id);
    setAberto(true);
  };

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.dia.trim() || !form.data) return;
    setSalvando(true);
    const ok = await salvarCulto(editando, {
      titulo: form.dia.trim(),
      dia: form.dia.trim(),
      slug: form.dia.trim().toLowerCase().replace(/\s+/g, "-"),
      data: form.data,
      horario: form.horario.trim(),
      tipo: "Culto",
      descricao: form.tema.trim(),
      tema: form.tema.trim(),
      pregador: form.pregador.trim(),
      dirigente: form.dirigente.trim(),
      louvores: paraLista(form.louvores),
      ...(editando ? {} : { created_by: perfil?.id ?? null }),
    });
    setSalvando(false);
    if (!ok) return;
    setAberto(false);
    setEditando(null);
    await recarregar();
  };

  return (
    <AppShell>
      <PageHeader title="Agenda" subtitle="Cultos e eventos da igreja" />
      <div className="space-y-3 px-5 py-5">
        {gestor ? (
          <button
            onClick={abrirNovo}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Adicionar culto
          </button>
        ) : null}

        {gestor && aberto ? (
          <form onSubmit={salvar} className="surface-card space-y-2 p-4">
            <h2 className="font-display text-lg">{editando ? "Editar culto" : "Novo culto"}</h2>
            {(
              [
                ["dia", "Dia (ex.: Domingo)", "text"],
                ["data", "Data", "date"],
                ["horario", "Horário (ex.: 18h00)", "text"],
                ["tema", "Tema", "text"],
                ["pregador", "Pregador", "text"],
                ["dirigente", "Dirigente", "text"],
              ] as const
            ).map(([campo, label, tipo]) => (
              <label key={campo} className="block text-xs text-soft">
                {label}
                <input
                  type={tipo}
                  value={form[campo]}
                  onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                />
              </label>
            ))}
            <label className="block text-xs text-soft">
              Louvores do dia — uma por linha: Título | Artista | Tom
              <textarea
                rows={4}
                value={form.louvores}
                onChange={(e) => setForm({ ...form, louvores: e.target.value })}
                className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
              />
            </label>
            <div className="flex gap-2">
              <button
                disabled={salvando}
                className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground disabled:opacity-50"
              >
                {salvando ? "Salvando…" : "Salvar"}
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-xl border border-border px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : null}

        {carregando ? <p className="text-sm text-soft">Carregando…</p> : null}

        {cultos.map((c) => (
          <div key={c.id} className="surface-card p-4">
            <Link to="/culto/$dia" params={{ dia: c.id }} className="block">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg">{c.dia}</h2>
                <span className="font-semibold text-primary">{c.horario}</span>
              </div>
              <p className="mt-1 text-sm text-soft">
                {dataCultoBR(c)} · {c.tema}
              </p>
              <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <dt className="text-soft">Pregador</dt>
                  <dd className="font-medium">{c.pregador}</dd>
                </div>
                <div>
                  <dt className="text-soft">Dirigente</dt>
                  <dd className="font-medium">{c.dirigente}</dd>
                </div>
              </dl>
              {c.louvores.length > 0 ? (
                <p className="mt-3 text-xs font-semibold text-primary">
                  {c.louvores.length} louvores do dia · ver culto
                </p>
              ) : null}
            </Link>

            {gestor ? (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <button
                  onClick={() => abrirEdicao(c)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  <Pencil className="size-3.5" /> Editar
                </button>
                <button
                  onClick={async () => {
                    if (!(await appConfirm(`Excluir o culto de ${c.dia}?`))) return;
                    if (await excluirCulto(c.id)) await recarregar();
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-destructive"
                >
                  <Trash2 className="size-3.5" /> Excluir
                </button>
              </div>
            ) : null}
          </div>
        ))}

        {!carregando && cultos.length === 0 ? (
          <p className="text-sm text-soft">Nenhum culto na agenda.</p>
        ) : null}
      </div>
    </AppShell>
  );
}
