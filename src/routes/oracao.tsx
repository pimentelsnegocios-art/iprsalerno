import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { HandHeart } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  categoriasOracao,
  pedidosOracao as iniciais,
  usuarioAtual,
  type PedidoOracao,
} from "@/lib/church-data";

export const Route = createFileRoute("/oracao")({
  head: () => ({
    meta: [
      { title: "Pedidos de Oração — IPR" },
      {
        name: "description",
        content: "Pedidos de oração identificados da igreja, por categoria, válidos por 7 dias.",
      },
      { property: "og:title", content: "Pedidos de Oração — IPR" },
      { property: "og:description", content: "Interceda pelos irmãos da igreja." },
    ],
  }),
  component: Oracao,
});

function Oracao() {
  const [pedidos, setPedidos] = useState<PedidoOracao[]>(iniciais);
  const [texto, setTexto] = useState("");
  const [categoria, setCategoria] = useState<(typeof categoriasOracao)[number]>("Saúde");
  const [filtro, setFiltro] = useState<string>("Todos");

  const enviar = () => {
    if (!texto.trim()) return;
    setPedidos([
      {
        id: crypto.randomUUID(),
        autor: usuarioAtual.nome,
        categoria,
        texto: texto.trim(),
        criadoEm: "Hoje",
        expiraEm: "em 7 dias",
        orando: 0,
      },
      ...pedidos,
    ]);
    setTexto("");
  };

  const lista =
    filtro === "Todos" ? pedidos : pedidos.filter((p) => p.categoria === filtro);

  return (
    <AppShell>
      <PageHeader
        title="Oração"
        subtitle="Sem anonimato — todo pedido é identificado e expira em 7 dias"
      />

      <div className="px-5 py-5">
        <div className="surface-card p-4">
          <p className="text-xs text-soft">
            Publicando como <span className="font-semibold text-primary">{usuarioAtual.nome}</span>
          </p>
          <Textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Escreva seu pedido de oração..."
            className="mt-3 bg-background"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            {categoriasOracao.map((c) => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  categoria === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-soft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <Button onClick={enviar} className="mt-4 w-full">
            Enviar pedido
          </Button>
        </div>

        <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {["Todos", ...categoriasOracao].map((c) => (
            <button
              key={c}
              onClick={() => setFiltro(c)}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium ${
                filtro === c ? "bg-primary text-primary-foreground" : "bg-secondary text-soft"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="mt-4 space-y-3">
          {lista.map((p) => (
            <article key={p.id} className="surface-card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{p.autor}</p>
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px]">
                  {p.categoria}
                </span>
              </div>
              <p className="mt-2 text-sm">{p.texto}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-soft">
                  {p.criadoEm} · expira {p.expiraEm}
                </span>
                <button
                  onClick={() =>
                    setPedidos((prev) =>
                      prev.map((x) => (x.id === p.id ? { ...x, orando: x.orando + 1 } : x)),
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                >
                  <HandHeart className="size-3.5" /> Estou orando ({p.orando})
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
