import { appConfirm, appPrompt } from "@/components/ui/AppDialog";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { AppShell, PageHeader } from "@/components/AppShell";
import { usePerfil } from "@/hooks/usePerfil";
import { carregarCultos, salvarCultos } from "@/lib/agenda-cultos";
import { cultos as cultosIniciais, type Culto } from "@/lib/church-data";
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

function Agenda() {
  const { permissao } = usePerfil();
  const gestor = podeGerirAgenda(permissao);
  const [itens, setItensState] = useState<Culto[]>(cultosIniciais);
  const [editando, setEditando] = useState<string | null>(null);

  useEffect(() => {
    setItensState(carregarCultos());
  }, []);

  const setItens = (fn: (atual: Culto[]) => Culto[]) =>
    setItensState((atual) => {
      const proximo = fn(atual);
      salvarCultos(proximo);
      return proximo;
    });

  const atualizar = (slug: string, campos: Partial<Culto>) =>
    setItens((atual) => atual.map((c) => (c.slug === slug ? { ...c, ...campos } : c)));

  return (
    <AppShell>
      <PageHeader title="Agenda" subtitle="Cultos e eventos da igreja" />
      <div className="space-y-3 px-5 py-5">
        {itens.map((c) => (
          <div key={c.slug} className="surface-card p-4">
            <Link to="/culto/$dia" params={{ dia: c.slug }} className="block">
              <div className="flex items-baseline justify-between">
                <h2 className="font-display text-lg">{c.dia}</h2>
                <span className="font-semibold text-primary">{c.horario}</span>
              </div>
              <p className="mt-1 text-sm text-soft">
                {c.data} · {c.tema}
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
                  onClick={() => setEditando(editando === c.slug ? null : c.slug)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-primary"
                >
                  <Pencil className="size-3.5" /> Editar
                </button>
                <button
                  onClick={async () => {
                    if (!await appConfirm(`Excluir o culto de ${c.dia}?`)) return;
                    setItens((atual) => atual.filter((x) => x.slug !== c.slug));
                    toast.success("Culto removido da agenda.");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-destructive"
                >
                  <Trash2 className="size-3.5" /> Excluir
                </button>
              </div>
            ) : null}

            {gestor && editando === c.slug ? (
              <div className="mt-3 space-y-2">
                {(
                  [
                    ["tema", "Tema"],
                    ["horario", "Horário"],
                    ["pregador", "Pregador"],
                    ["dirigente", "Dirigente"],
                  ] as const
                ).map(([campo, rotulo]) => (
                  <label key={campo} className="block text-xs text-soft">
                    {rotulo}
                    <input
                      value={c[campo]}
                      onChange={(e) => atualizar(c.slug, { [campo]: e.target.value })}
                      className="mt-1 w-full rounded-lg border border-border bg-secondary px-3 py-2 text-sm text-foreground"
                    />
                  </label>
                ))}
                <button
                  onClick={async () => {
                    setEditando(null);
                    toast.success("Culto atualizado.");
                  }}
                  className="w-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                >
                  Salvar
                </button>
              </div>
            ) : null}
          </div>
        ))}
        {itens.length === 0 ? (
          <p className="text-sm text-soft">Nenhum culto na agenda.</p>
        ) : null}
      </div>
    </AppShell>
  );
}
