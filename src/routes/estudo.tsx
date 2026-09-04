import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { estudos, ehLideranca, usuarioAtual } from "@/lib/church-data";

export const Route = createFileRoute("/estudo")({
  head: () => ({
    meta: [
      { title: "Estudos Bíblicos — IPR" },
      {
        name: "description",
        content: "Estudos bíblicos por livro, tema e palavra-chave, com curiosidades e mural.",
      },
      { property: "og:title", content: "Estudos Bíblicos — IPR" },
      { property: "og:description", content: "Materiais de estudo publicados pela liderança." },
    ],
  }),
  component: Estudos,
});

function Estudos() {
  const [busca, setBusca] = useState("");
  const [aberto, setAberto] = useState<string | null>(null);
  const q = busca.toLowerCase();

  const lista = estudos.filter((e) =>
    [e.titulo, e.livro, e.tema, e.resumo, e.curiosidade].join(" ").toLowerCase().includes(q),
  );

  return (
    <AppShell>
      <PageHeader title="Estudo" subtitle="Estudos bíblicos e materiais da igreja" />
      <div className="px-5 py-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soft" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por livro, tema ou palavra-chave"
            className="bg-surface pl-9"
          />
        </div>

        {ehLideranca(usuarioAtual.cargo) ? (
          <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-soft">
            Você é liderança e pode publicar novos estudos. O autor fica sempre visível.
          </p>
        ) : (
          <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-soft">
            Apenas a liderança pode publicar estudos.
          </p>
        )}

        <div className="mt-4 space-y-3">
          {lista.map((e) => (
            <article key={e.id} className="surface-card p-4">
              <button
                onClick={() => setAberto(aberto === e.id ? null : e.id)}
                className="w-full text-left"
              >
                <h2 className="font-display text-lg text-primary">{e.titulo}</h2>
                <p className="text-xs text-soft">
                  {e.livro} · {e.tema} · por {e.autor}
                </p>
                <p className="mt-2 text-sm">{e.resumo}</p>
              </button>

              {aberto === e.id ? (
                <div className="mt-4 space-y-3 border-t border-border pt-3 text-sm">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                      Curiosidade
                    </h3>
                    <p className="mt-1">{e.curiosidade}</p>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                      Referências
                    </h3>
                    <ul className="mt-1 list-inside list-disc text-soft">
                      {e.referencias.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wide text-primary">
                      Mural do estudo
                    </h3>
                    {e.mural.length ? (
                      e.mural.map((m, i) => (
                        <p key={i} className="mt-1">
                          <span className="font-semibold">{m.autor}:</span> {m.texto}
                        </p>
                      ))
                    ) : (
                      <p className="mt-1 text-soft">Nenhum comentário ainda.</p>
                    )}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
