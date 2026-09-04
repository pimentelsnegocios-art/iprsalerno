import { createFileRoute, Link } from "@tanstack/react-router";

import { AppShell, PageHeader } from "@/components/AppShell";
import { ministerios } from "@/lib/church-data";

export const Route = createFileRoute("/ministerios/")({
  head: () => ({
    meta: [
      { title: "Ministérios — IPR" },
      {
        name: "description",
        content: "Ministérios de Louvor, Jovens e Irmãs da Igreja Presbiteriana Renovada.",
      },
      { property: "og:title", content: "Ministérios — IPR" },
      { property: "og:description", content: "Conheça os ministérios e seus líderes." },
    ],
  }),
  component: Ministerios,
});

function Ministerios() {
  return (
    <AppShell>
      <PageHeader title="Ministérios" subtitle="Cada ministério com tema próprio" />
      <div className="space-y-3 px-5 py-5">
        {ministerios.map((m) => (
          <Link
            key={m.slug}
            to="/ministerios/$slug"
            params={{ slug: m.slug }}
            className="surface-card flex items-center gap-4 p-4"
          >
            <span className="text-3xl">{m.emoji}</span>
            <div>
              <h2 className="font-display text-lg">{m.nome}</h2>
              <p className="text-xs text-soft">Líder: {m.lider}</p>
            </div>
          </Link>
        ))}
      </div>
    </AppShell>
  );
}
