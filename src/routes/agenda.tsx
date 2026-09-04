import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/AppShell";
import { cultos } from "@/lib/church-data";

export const Route = createFileRoute("/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda de Cultos — IPR" },
      {
        name: "description",
        content: "Cultos de quinta, sábado e domingo com pregador, dirigente e tema.",
      },
      { property: "og:title", content: "Agenda de Cultos — IPR" },
      { property: "og:description", content: "Programação completa de cultos e eventos." },
    ],
  }),
  component: Agenda,
});

function Agenda() {
  return (
    <AppShell>
      <PageHeader title="Agenda" subtitle="Cultos e eventos da igreja" />
      <div className="space-y-3 px-5 py-5">
        {cultos.map((c) => (
          <Link
            key={c.slug}
            to="/culto/$dia"
            params={{ dia: c.slug }}
            className="surface-card block p-4"
          >
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
        ))}
      </div>
    </AppShell>
  );
}
