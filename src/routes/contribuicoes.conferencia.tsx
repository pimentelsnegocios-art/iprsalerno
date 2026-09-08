import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Check, ShieldAlert, X } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { usePerfil } from "@/hooks/usePerfil";
import { podeVerCaixaPerfil } from "@/lib/permissoes";
import { acoesPix, brlPix, rotuloMes, usePixStore, type Contribuicao } from "@/lib/pix-store";
import { StatusBadge, VisualizadorComprovante } from "@/components/ContribuicaoUI";
import { appPrompt } from "@/components/ui/AppDialog";

export const Route = createFileRoute("/contribuicoes/conferencia")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Conferência de contribuições — IPRB Renovada" },
      {
        name: "description",
        content:
          "Liderança confere comprovantes de dízimos e ofertas enviados pelos membros da igreja.",
      },
      { property: "og:title", content: "Conferência de contribuições — IPRB Renovada" },
      {
        property: "og:description",
        content: "Confirme ou rejeite comprovantes enviados pelos membros.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Conferencia,
});

type Filtro = "pendente" | "confirmado" | "rejeitado";

function Conferencia() {
  const { perfil, permissao, carregando } = usePerfil();
  const { contribuicoes } = usePixStore();
  const [filtro, setFiltro] = useState<Filtro>("pendente");
  const [aberto, setAberto] = useState<Contribuicao | null>(null);

  const autorizado = podeVerCaixaPerfil(permissao);

  const lista = useMemo(
    () => contribuicoes.filter((c) => c.status === filtro),
    [contribuicoes, filtro],
  );

  if (carregando) {
    return (
      <AppShell>
        <PageHeader title="Conferência" back />
      </AppShell>
    );
  }

  if (!autorizado) {
    return (
      <AppShell>
        <PageHeader title="Conferência" back />
        <div className="surface-card mx-5 my-6 p-6 text-center text-sm text-soft">
          <ShieldAlert className="mx-auto mb-2 size-6 text-primary" />
          Esta área é exclusiva da liderança e da tesouraria da igreja.
        </div>
      </AppShell>
    );
  }

  function confirmar(c: Contribuicao) {
    acoesPix.confirmar(c.id, perfil?.nome ?? "Liderança");
  }

  async function rejeitar(c: Contribuicao) {
    const motivo = (await appPrompt("Motivo da rejeição (opcional):")) ?? "";
    acoesPix.rejeitar(c.id, perfil?.nome ?? "Liderança", motivo.trim() || "Não informado");
  }

  return (
    <AppShell>
      <PageHeader
        title="Conferência de contribuições"
        subtitle="Comprovantes enviados pelos membros"
        back
      />

      <div className="px-5 py-5">
        <div className="mb-4 grid grid-cols-3 gap-2">
          {(["pendente", "confirmado", "rejeitado"] as Filtro[]).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFiltro(f)}
              className={`rounded-xl border px-2 py-2 text-xs font-semibold capitalize transition-colors ${
                filtro === f
                  ? "border-primary bg-primary/15 text-primary"
                  : "border-border text-soft"
              }`}
            >
              {f === "pendente" ? "Aguardando" : f}
            </button>
          ))}
        </div>

        {lista.length === 0 ? (
          <div className="surface-card p-6 text-center text-sm text-soft">
            Nenhum comprovante nesta situação.
          </div>
        ) : (
          <div className="space-y-3">
            {lista.map((c) => (
              <div key={c.id} className="surface-card p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{c.usuarioNome}</p>
                    <p className="text-xs text-soft">
                      {c.tipo} · {rotuloMes(c.mesRef)}
                    </p>
                    <p className="mt-1 font-display text-lg text-primary">{brlPix(c.valor)}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>

                <button
                  type="button"
                  onClick={() => setAberto(c)}
                  className="mt-3 w-full rounded-xl border border-border px-3 py-2 text-xs font-semibold text-soft"
                >
                  Ver comprovante
                </button>

                {c.status === "pendente" ? (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => confirmar(c)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2.5 text-xs font-semibold text-white"
                    >
                      <Check className="size-4" /> Confirmar
                    </button>
                    <button
                      type="button"
                      onClick={() => void rejeitar(c)}
                      className="flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-3 py-2.5 text-xs font-semibold text-white"
                    >
                      <X className="size-4" /> Rejeitar
                    </button>
                  </div>
                ) : (
                  <p className="mt-2 text-xs text-soft">
                    {c.status === "confirmado" ? "Confirmado" : "Rejeitado"} por{" "}
                    {c.revisadoPor ?? "liderança"}
                    {c.motivo ? ` · ${c.motivo}` : ""}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {aberto ? (
        <VisualizadorComprovante item={aberto} onClose={() => setAberto(null)} />
      ) : null}
    </AppShell>
  );
}
