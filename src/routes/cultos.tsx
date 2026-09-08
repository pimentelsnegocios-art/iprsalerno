import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/AppShell";
import { useCultos } from "@/lib/agenda-cultos";

export const Route = createFileRoute("/cultos")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Cultos — IPRB Renovada" },
      {
        name: "description",
        content: "Lista dos cultos ativos da agenda da Igreja Presbiteriana Renovada.",
      },
      { property: "og:title", content: "Cultos — IPRB Renovada" },
      { property: "og:description", content: "Cultos ativos da agenda da igreja." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Cultos,
});

function Cultos() {
  const cultos = useCultos();

  return (
    <AppShell>
      <PageHeader title="Cultos" subtitle="Programação da semana" />
      <div className="space-y-3 px-5 py-5">
        {cultos.length === 0 ? (
          <p className="text-sm text-soft">Nenhum culto agendado no momento.</p>
        ) : null}
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
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
