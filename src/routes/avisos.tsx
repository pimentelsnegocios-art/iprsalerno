import { createFileRoute, Link } from "@tanstack/react-router";
import { Pin, Settings2 } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { useAppStore } from "@/lib/app-store";
import { ehLideranca, usuarioAtual } from "@/lib/church-data";

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
  const { avisos } = useAppStore();
  const admin = ehLideranca(usuarioAtual.cargo);

  return (
    <AppShell>
      <PageHeader title="Avisos da Igreja" subtitle="Comunicados oficiais da liderança" />
      <div className="space-y-3 px-5 py-5">
        {admin ? (
          <Link
            to="/admin/avisos"
            className="surface-card flex items-center gap-2 px-4 py-3 text-sm font-semibold text-primary"
          >
            <Settings2 className="size-4" /> Gerenciar avisos
          </Link>
        ) : null}

        {avisos.map((a) => (
          <article key={a.id} className="surface-card p-4">
            <div className="flex items-start justify-between gap-2">
              <h2 className="font-display text-lg text-primary">{a.titulo}</h2>
              {a.fixadoHome ? <Pin className="mt-1 size-4 shrink-0 text-primary" /> : null}
            </div>
            <p className="mt-1 text-sm">{a.texto}</p>
            <p className="mt-3 text-xs text-soft">
              Publicado por {a.autor} · {a.data}
            </p>
          </article>
        ))}
        {avisos.length === 0 ? (
          <p className="text-sm text-soft">Nenhum aviso publicado.</p>
        ) : null}
      </div>
    </AppShell>
  );
}
