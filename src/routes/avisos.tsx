import { createFileRoute } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/AppShell";
import { avisos } from "@/lib/church-data";

export const Route = createFileRoute("/avisos")({
  head: () => ({
    meta: [
      { title: "Avisos da Igreja — IPR" },
      { name: "description", content: "Comunicados oficiais da Igreja Presbiteriana Renovada." },
      { property: "og:title", content: "Avisos da Igreja — IPR" },
      { property: "og:description", content: "Comunicados oficiais da igreja." },
    ],
  }),
  component: Avisos,
});

function Avisos() {
  return (
    <AppShell>
      <PageHeader title="Avisos da Igreja" subtitle="Comunicados oficiais da liderança" />
      <div className="space-y-3 px-5 py-5">
        {avisos.map((a) => (
          <article key={a.id} className="surface-card p-4">
            <h2 className="font-display text-lg text-primary">{a.titulo}</h2>
            <p className="mt-1 text-sm">{a.texto}</p>
            <p className="mt-3 text-xs text-soft">
              Publicado por {a.autor} · {a.data}
            </p>
          </article>
        ))}
      </div>
    </AppShell>
  );
}
