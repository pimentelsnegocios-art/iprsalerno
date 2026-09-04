import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Lock, Pin } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { ministerios, usuarioAtual, ehLideranca } from "@/lib/church-data";
import { ministeriosConteudo } from "@/lib/ministerio-data";

export const Route = createFileRoute("/ministerios/$slug")({
  head: () => ({
    meta: [
      { title: "Ministério — IPR" },
      { name: "description", content: "Área interna do ministério com tema, avisos e botões próprios." },
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
  const conteudo = ministeriosConteudo[min.slug];

  const temAcesso = ehLideranca(usuarioAtual.cargo) || usuarioAtual.ministerio === min.slug;
  const fixado = conteudo.avisos.find((a) => a.fixado) ?? conteudo.avisos[0];

  return (
    <AppShell theme={min.slug}>
      <PageHeader
        title={`${conteudo.emoji} ${conteudo.nome}`}
        subtitle={`${conteudo.subtitulo} · Líder: ${conteudo.lider}`}
        back="/ministerios"
      />
      <div className="space-y-4 px-5 py-5">
        <blockquote className="surface-card p-4 text-sm italic">
          {conteudo.frase ? (
            <p className="mb-2 not-italic font-display text-base text-primary">{conteudo.frase}</p>
          ) : null}
          {conteudo.versiculo}
        </blockquote>

        {temAcesso ? (
          <>
            {fixado ? (
              <div className="surface-card border-primary/40 p-4">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Pin className="size-3.5" /> Aviso em destaque
                </p>
                <p className="mt-1 font-display text-lg">{fixado.titulo}</p>
                <p className="mt-1 text-sm">{fixado.texto}</p>
                <p className="mt-2 text-xs text-soft">
                  {fixado.autor} · {fixado.data}
                </p>
              </div>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              {conteudo.secoes.map((s) => (
                <Link
                  key={s.key}
                  to="/ministerios/$slug/$secao"
                  params={{ slug: min.slug, secao: s.key }}
                  className="surface-card p-4 transition-transform active:scale-95"
                >
                  <span className="text-2xl">{s.emoji}</span>
                  <p className="mt-2 font-semibold">
                    {s.label} {s.restrito ? <Lock className="inline size-3.5 text-primary" /> : null}
                  </p>
                  <p className="mt-0.5 text-[11px] text-soft">{s.descricao}</p>
                </Link>
              ))}
            </div>
          </>
        ) : (
          <div className="surface-card p-5 text-center">
            <Lock className="mx-auto size-8 text-primary" />
            <p className="mt-3 text-sm">
              A paz do Senhor! Caso queira descobrir o que tem aqui, que tal participar? Procure um
              líder.
            </p>
          </div>
        )}
      </div>
    </AppShell>
  );
}
