import { createFileRoute, notFound } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/AppShell";
import { useCultos } from "@/lib/agenda-cultos";

export const Route = createFileRoute("/culto/$dia")({
  head: () => ({
    meta: [
      { title: "Culto — IPR" },
      { name: "description", content: "Detalhes do culto: tema, pregador, dirigente e louvores do dia." },
      { property: "og:title", content: "Culto — IPR" },
      { property: "og:description", content: "Tema, pregador, dirigente e louvores do dia." },
    ],
  }),
  component: CultoPage,
  notFoundComponent: () => (
    <AppShell>
      <PageHeader title="Culto não encontrado" />
    </AppShell>
  ),
});

function CultoPage() {
  const { dia } = Route.useParams();
  const cultos = useCultos();
  const culto = cultos.find((c) => c.slug === dia);
  if (!culto) throw notFound();

  return (
    <AppShell>
      <PageHeader
        title={`Culto de ${culto.dia}`}
        subtitle={`${culto.data} · ${culto.horario}`}
      />
      <div className="space-y-4 px-5 py-5">
        <div className="surface-card p-4">
          <h2 className="font-display text-lg text-primary">{culto.tema}</h2>
          <dl className="mt-3 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-soft">Pregador</dt>
              <dd className="font-medium">{culto.pregador}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-soft">Dirigente</dt>
              <dd className="font-medium">{culto.dirigente}</dd>
            </div>
          </dl>
        </div>

        {culto.louvores.length > 0 ? (
          <div className="surface-card p-4">
            <h3 className="font-display text-lg">Louvores do dia</h3>
            <p className="text-xs text-soft">Repertório exclusivo de {culto.dia}</p>
            <ol className="mt-3 divide-y divide-border">
              {culto.louvores.map((l, i) => (
                <li key={l.titulo} className="flex items-center gap-3 py-3">
                  <span className="w-5 text-sm font-bold text-primary">{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{l.titulo}</p>
                    <p className="text-xs text-soft">{l.artista}</p>
                  </div>
                  <span className="rounded-md bg-secondary px-2 py-1 text-xs font-semibold">
                    Tom {l.tom}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <p className="text-sm text-soft">
            Culto de oração e doutrina — sem lista de louvores do dia.
          </p>
        )}
      </div>
    </AppShell>
  );
}
