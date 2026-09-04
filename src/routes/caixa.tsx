import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowDownCircle, ArrowUpCircle, Lock } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  brl,
  categoriasEntrada,
  categoriasSaida,
  lancamentos as iniciais,
  podeVerCaixa,
  usuarioAtual,
  type Lancamento,
  type TipoLancamento,
} from "@/lib/church-data";

export const Route = createFileRoute("/caixa")({
  head: () => ({
    meta: [
      { title: "Livro Caixa — IPR" },
      {
        name: "description",
        content: "Entradas, saídas, saldo em tempo real e histórico com responsável.",
      },
      { property: "og:title", content: "Livro Caixa — IPR" },
      { property: "og:description", content: "Tesouraria da Igreja Presbiteriana Renovada." },
    ],
  }),
  component: Caixa,
});

function Caixa() {
  const [itens, setItens] = useState<Lancamento[]>(iniciais);
  const [tipo, setTipo] = useState<TipoLancamento>("entrada");
  const [categoria, setCategoria] = useState("Dízimo");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");

  const { entradas, saidas, saldo } = useMemo(() => {
    const e = itens.filter((i) => i.tipo === "entrada").reduce((s, i) => s + i.valor, 0);
    const s = itens.filter((i) => i.tipo === "saida").reduce((a, i) => a + i.valor, 0);
    return { entradas: e, saidas: s, saldo: e - s };
  }, [itens]);

  if (!podeVerCaixa(usuarioAtual.cargo)) {
    return (
      <AppShell>
        <PageHeader title="Livro Caixa" back="/mais" />
        <div className="surface-card mx-5 mt-5 p-5 text-center">
          <Lock className="mx-auto size-8 text-primary" />
          <p className="mt-3 text-sm">
            Acesso restrito ao Auxiliar de Caixa, Pastor, Presbítero e Fundador.
          </p>
        </div>
      </AppShell>
    );
  }

  const categorias = tipo === "entrada" ? categoriasEntrada : categoriasSaida;

  const lancar = () => {
    const v = Number(valor.replace(",", "."));
    if (!v || !descricao.trim()) return;
    setItens([
      {
        id: crypto.randomUUID(),
        tipo,
        categoria,
        descricao: descricao.trim(),
        valor: v,
        data: "Hoje",
        responsavel: usuarioAtual.nome,
      },
      ...itens,
    ]);
    setDescricao("");
    setValor("");
  };

  return (
    <AppShell>
      <PageHeader title="Livro Caixa" subtitle="Saldo em tempo real" back="/mais" />
      <div className="px-5 py-5">
        <div className="surface-card p-4 text-center">
          <p className="text-xs text-soft">Saldo atual</p>
          <p className="font-display text-3xl text-primary">{brl(saldo)}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-soft">Entradas</p>
              <p className="font-semibold">{brl(entradas)}</p>
            </div>
            <div>
              <p className="text-xs text-soft">Saídas</p>
              <p className="font-semibold">{brl(saidas)}</p>
            </div>
          </div>
        </div>

        <div className="surface-card mt-4 p-4">
          <h2 className="font-display text-lg">Novo lançamento</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["entrada", "saida"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTipo(t);
                  setCategoria(t === "entrada" ? "Dízimo" : "Gastos");
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  tipo === t ? "bg-primary text-primary-foreground" : "bg-secondary text-soft"
                }`}
              >
                {t === "entrada" ? "Entrada" : "Saída"}
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {categorias.map((c) => (
              <button
                key={c}
                onClick={() => setCategoria(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  categoria === c
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-soft"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder={
              categoria === "Gastos" ? "Tipo do gasto (luz, água, internet...)" : "Descrição"
            }
            className="mt-3 bg-background"
          />
          <Input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            inputMode="decimal"
            placeholder="Valor (R$)"
            className="mt-2 bg-background"
          />
          <Button onClick={lancar} className="mt-3 w-full">
            Registrar como {usuarioAtual.nome}
          </Button>
        </div>

        <h2 className="mt-6 font-display text-lg">Histórico</h2>
        <div className="mt-3 space-y-2">
          {itens.map((i) => (
            <div key={i.id} className="surface-card flex items-center gap-3 p-3">
              {i.tipo === "entrada" ? (
                <ArrowUpCircle className="size-5 text-primary" />
              ) : (
                <ArrowDownCircle className="size-5 text-destructive" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{i.descricao}</p>
                <p className="text-[11px] text-soft">
                  {i.categoria} · {i.data} · {i.responsavel}
                </p>
              </div>
              <span
                className={`text-sm font-semibold ${
                  i.tipo === "entrada" ? "text-primary" : "text-destructive"
                }`}
              >
                {i.tipo === "entrada" ? "+" : "-"}
                {brl(i.valor)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
