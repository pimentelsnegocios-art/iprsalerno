import { createFileRoute, notFound } from "@tanstack/react-router";
import { Lock } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { ministerios, usuarioAtual, ehLideranca } from "@/lib/church-data";

export const Route = createFileRoute("/ministerios/$slug")({
  head: () => ({
    meta: [
      { title: "Ministério — IPR" },
      { name: "description", content: "Área interna do ministério com tema e botões próprios." },
      { property: "og:title", content: "Ministério — IPR" },
      { property: "og:description", content: "Área interna do ministério." },
    ],
  }),
  component: MinisterioPage,
  notFoundComponent: () => (
    <AppShell>
      <PageHeader title="Ministério não encontrado" back="/ministerios" />
    </AppShell>
  ),
});

function MinisterioPage() {
  const { slug } = Route.useParams();
  const min = ministerios.find((m) => m.slug === slug);
  if (!min) throw notFound();

  const temAcesso =
    ehLideranca(usuarioAtual.cargo) || usuarioAtual.ministerio === min.slug;

  return (
    <AppShell theme={min.slug}>
      <PageHeader
        title={`${min.emoji} ${min.nome}`}
        subtitle={`Líder: ${min.lider}`}
        back="/ministerios"
      />
      <div className="px-5 py-5">
        {temAcesso ? (
          <>
            <p className="text-sm text-soft">{min.descricao}</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {min.botoes.map((b) => (
                <button
                  key={b}
                  className="surface-card px-3 py-5 text-sm font-semibold transition-transform active:scale-95"
                >
                  {b}
                </button>
              ))}
            </div>
          </>
        ) : (
          <div className="surface-card p-5 text-center">
            <Lock className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-sm">
              A paz do Senhor! Caso queira descobrir o que tem aqui, que tal participar?
              Procure um líder.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
