import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  CalendarDays,
  FileDown,
  Lock,
  LockKeyhole,
  Paperclip,
  Search,
  X,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell, PageHeader } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  brl,
  categoriasEntrada,
  categoriasSaida,
  formatarData,
  lancamentos as iniciais,
  podeVerCaixa,
  usuarioAtual,
  type FormaPagamento,
  type Lancamento,
  type TipoLancamento,
} from "@/lib/church-data";

export const Route = createFileRoute("/caixa")({
  head: () => ({
    meta: [
      { title: "Livro Caixa — IPR" },
      {
        name: "description",
        content:
          "Módulo financeiro da igreja: saldo em tempo real, gráfico de 30 dias, filtros, comprovantes, exportação em PDF e fechamento de mês.",
      },
      { property: "og:title", content: "Livro Caixa — IPR" },
      {
        property: "og:description",
        content: "Tesouraria da Igreja Presbiteriana Renovada, estilo app de banco.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Caixa,
});

const formas: FormaPagamento[] = ["Dinheiro", "Pix", "Cartão"];
const hojeISO = () => new Date().toISOString().slice(0, 10);
const mesDe = (iso: string) => iso.slice(0, 7);
const rotuloMes = (m: string) => {
  const [a, mm] = m.split("-");
  const nomes = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  return `${nomes[Number(mm) - 1]}/${a}`;
};

function Caixa() {
  const [itens, setItens] = useState<Lancamento[]>(iniciais);
  const [mesesFechados, setMesesFechados] = useState<string[]>([]);
  const [montado, setMontado] = useState(false);
  useEffect(() => setMontado(true), []);

  // formulário
  const [tipo, setTipo] = useState<TipoLancamento>("entrada");
  const [categoria, setCategoria] = useState("Dízimo");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [data, setData] = useState(hojeISO());
  const [forma, setForma] = useState<FormaPagamento>("Pix");
  const [observacao, setObservacao] = useState("");
  const [comprovante, setComprovante] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // filtros
  const [fMes, setFMes] = useState("todos");
  const [fCategoria, setFCategoria] = useState("todas");
  const [fResponsavel, setFResponsavel] = useState("todos");
  const [busca, setBusca] = useState("");

  const { entradas, saidas, saldo } = useMemo(() => {
    const e = itens.filter((i) => i.tipo === "entrada").reduce((s, i) => s + i.valor, 0);
    const s = itens.filter((i) => i.tipo === "saida").reduce((a, i) => a + i.valor, 0);
    return { entradas: e, saidas: s, saldo: e - s };
  }, [itens]);

  const serie = useMemo(() => {
    const dias: { dia: string; entradas: number; saidas: number }[] = [];
    const base = new Date();
    for (let k = 29; k >= 0; k--) {
      const d = new Date(base);
      d.setDate(d.getDate() - k);
      const iso = d.toISOString().slice(0, 10);
      const doDia = itens.filter((i) => i.dataISO === iso);
      dias.push({
        dia: iso.slice(8, 10) + "/" + iso.slice(5, 7),
        entradas: doDia.filter((i) => i.tipo === "entrada").reduce((s, i) => s + i.valor, 0),
        saidas: doDia.filter((i) => i.tipo === "saida").reduce((s, i) => s + i.valor, 0),
      });
    }
    return dias;
  }, [itens]);

  const meses = useMemo(
    () => Array.from(new Set(itens.map((i) => mesDe(i.dataISO)))).sort().reverse(),
    [itens],
  );
  const responsaveis = useMemo(
    () => Array.from(new Set(itens.map((i) => i.responsavel))).sort(),
    [itens],
  );
  const todasCategorias = useMemo(
    () => Array.from(new Set([...categoriasEntrada, ...categoriasSaida])),
    [],
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens
      .filter((i) => (fMes === "todos" ? true : mesDe(i.dataISO) === fMes))
      .filter((i) => (fCategoria === "todas" ? true : i.categoria === fCategoria))
      .filter((i) => (fResponsavel === "todos" ? true : i.responsavel === fResponsavel))
      .filter((i) =>
        q
          ? [i.descricao, i.categoria, i.responsavel, i.observacao ?? ""]
              .join(" ")
              .toLowerCase()
              .includes(q)
          : true,
      )
      .sort((a, b) => b.dataISO.localeCompare(a.dataISO));
  }, [itens, fMes, fCategoria, fResponsavel, busca]);

  const totalFiltrado = useMemo(() => {
    const e = filtrados.filter((i) => i.tipo === "entrada").reduce((s, i) => s + i.valor, 0);
    const s = filtrados.filter((i) => i.tipo === "saida").reduce((a, i) => a + i.valor, 0);
    return { e, s, saldo: e - s };
  }, [filtrados]);

  if (!podeVerCaixa(usuarioAtual.cargo)) {
    return (
      <AppShell>
        <PageHeader title="Livro Caixa" />
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
  const mesDoLancamento = mesDe(data);
  const mesTravado = mesesFechados.includes(mesDoLancamento);

  const anexar = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setComprovante(String(reader.result));
    reader.readAsDataURL(file);
  };

  const lancar = () => {
    const v = Number(valor.replace(/\./g, "").replace(",", "."));
    if (!v || !descricao.trim() || mesTravado) return;
    setItens([
      {
        id: crypto.randomUUID(),
        tipo,
        categoria,
        descricao: descricao.trim(),
        valor: v,
        data: formatarData(data),
        dataISO: data,
        responsavel: usuarioAtual.nome,
        forma,
        observacao: observacao.trim() || undefined,
        comprovante,
      },
      ...itens,
    ]);
    setDescricao("");
    setValor("");
    setObservacao("");
    setComprovante(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const mesRelatorio = fMes === "todos" ? mesDe(hojeISO()) : fMes;

  const exportarPDF = () => {
    const linhas = itens
      .filter((i) => mesDe(i.dataISO) === mesRelatorio)
      .sort((a, b) => a.dataISO.localeCompare(b.dataISO));
    const e = linhas.filter((i) => i.tipo === "entrada").reduce((s, i) => s + i.valor, 0);
    const s = linhas.filter((i) => i.tipo === "saida").reduce((a, i) => a + i.valor, 0);
    const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<title>Livro Caixa — ${rotuloMes(mesRelatorio)}</title>
<style>
body{font-family:Georgia,serif;color:#111;padding:32px}
h1{font-size:20px;margin:0}p.sub{color:#555;margin:4px 0 20px}
table{width:100%;border-collapse:collapse;font-size:12px}
th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}
th{background:#0A2463;color:#fff}
td.v{text-align:right;white-space:nowrap}
.tot{margin-top:20px;font-size:14px}
</style></head><body>
<h1>Igreja Presbiteriana Renovada — Livro Caixa</h1>
<p class="sub">Relatório de ${rotuloMes(mesRelatorio)} · emitido por ${usuarioAtual.nome}</p>
<table><thead><tr><th>Data</th><th>Descrição</th><th>Categoria</th><th>Forma</th><th>Lançado por</th><th>Valor</th></tr></thead><tbody>
${linhas
  .map(
    (i) =>
      `<tr><td>${i.data}</td><td>${i.descricao}${i.observacao ? ` — <i>${i.observacao}</i>` : ""}</td><td>${i.categoria}</td><td>${i.forma}</td><td>${i.responsavel}</td><td class="v">${i.tipo === "entrada" ? "+" : "-"} ${brl(i.valor)}</td></tr>`,
  )
  .join("")}
</tbody></table>
<div class="tot"><b>Entradas:</b> ${brl(e)} &nbsp;·&nbsp; <b>Saídas:</b> ${brl(s)} &nbsp;·&nbsp; <b>Saldo do mês:</b> ${brl(e - s)}</div>
</body></html>`;
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const alternarFechamento = () => {
    setMesesFechados((m) =>
      m.includes(mesRelatorio) ? m.filter((x) => x !== mesRelatorio) : [...m, mesRelatorio],
    );
  };

  return (
    <AppShell>
      <PageHeader title="Livro Caixa" subtitle="Saldo em tempo real" />
      <div className="px-5 py-5">
        {/* Saldo + gráfico */}
        <div className="surface-card p-4">
          <p className="text-center text-xs text-soft">Saldo atual</p>
          <p className="text-center font-display text-3xl text-primary">{brl(saldo)}</p>
          <div className="mt-3 grid grid-cols-2 gap-3 text-center text-sm">
            <div>
              <p className="text-xs text-soft">Entradas</p>
              <p className="font-semibold text-emerald-500">{brl(entradas)}</p>
            </div>
            <div>
              <p className="text-xs text-soft">Saídas</p>
              <p className="font-semibold text-red-500">{brl(saidas)}</p>
            </div>
          </div>

          <p className="mt-4 text-xs text-soft">Últimos 30 dias</p>
          <div className="mt-1 h-40">
            {montado ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={serie} margin={{ top: 6, right: 6, left: -18, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.12} />
                  <XAxis dataKey="dia" tick={{ fontSize: 9 }} interval={6} stroke="currentColor" />
                  <YAxis tick={{ fontSize: 9 }} stroke="currentColor" />
                  <Tooltip
                    formatter={(v: number | string) => brl(Number(v))}
                    contentStyle={{
                      background: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: 12,
                      fontSize: 12,
                      color: "var(--card-foreground)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="entradas"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="saidas"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : null}
          </div>
          <div className="flex justify-center gap-4 text-[11px] text-soft">
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-emerald-500" /> Entradas
            </span>
            <span className="flex items-center gap-1">
              <span className="size-2 rounded-full bg-red-500" /> Saídas
            </span>
          </div>
        </div>

        {/* Ações do mês */}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={exportarPDF} className="gap-2">
            <FileDown className="size-4" /> Exportar PDF
          </Button>
          <Button
            variant={mesesFechados.includes(mesRelatorio) ? "default" : "secondary"}
            onClick={alternarFechamento}
            className="gap-2"
          >
            <LockKeyhole className="size-4" />
            {mesesFechados.includes(mesRelatorio) ? "Reabrir mês" : "Fechar mês"}
          </Button>
        </div>
        <p className="mt-1 text-center text-[11px] text-soft">
          Mês de referência: {rotuloMes(mesRelatorio)}
          {mesesFechados.includes(mesRelatorio) ? " · fechado (lançamentos travados)" : ""}
        </p>

        {/* Novo lançamento */}
        <div className="surface-card mt-4 p-4">
          <h2 className="font-display text-lg">Novo lançamento</h2>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {(["entrada", "saida"] as const).map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTipo(t);
                  setCategoria(t === "entrada" ? "Dízimo" : "Conta Luz");
                }}
                className={`rounded-lg px-3 py-2 text-sm font-semibold ${
                  tipo === t ? "bg-primary text-primary-foreground" : "bg-secondary text-soft"
                }`}
              >
                {t === "entrada" ? "Entrada" : "Saída"}
              </button>
            ))}
          </div>

          <label className="mt-3 block text-xs text-soft" htmlFor="data-lancamento">
            Data
          </label>
          <div className="relative">
            <CalendarDays className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soft" />
            <Input
              id="data-lancamento"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="bg-background pl-9"
            />
          </div>

          <p className="mt-3 text-xs text-soft">Categoria</p>
          <div className="mt-1 flex flex-wrap gap-2">
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

          <p className="mt-3 text-xs text-soft">Forma</p>
          <div className="mt-1 grid grid-cols-3 gap-2">
            {formas.map((f) => (
              <button
                key={f}
                onClick={() => setForma(f)}
                className={`rounded-lg px-2 py-2 text-xs font-semibold ${
                  forma === f ? "bg-primary text-primary-foreground" : "bg-secondary text-soft"
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          <Input
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
            placeholder="Descrição do lançamento"
            className="mt-3 bg-background"
          />
          <Input
            value={valor}
            onChange={(e) => setValor(e.target.value)}
            inputMode="decimal"
            placeholder="Valor (R$)"
            className="mt-2 bg-background"
          />
          <Textarea
            value={observacao}
            onChange={(e) => setObservacao(e.target.value)}
            placeholder="Observação (opcional)"
            rows={2}
            className="mt-2 bg-background"
          />

          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => anexar(e.target.files?.[0])}
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-2 flex w-full items-center gap-2 rounded-lg border border-dashed border-border px-3 py-3 text-sm text-soft"
          >
            <Paperclip className="size-4" />
            {comprovante ? "Trocar foto do comprovante" : "Anexar foto do comprovante"}
          </button>
          {comprovante ? (
            <div className="relative mt-2 w-fit">
              <img
                src={comprovante}
                alt="Pré-visualização do comprovante anexado"
                width={120}
                height={120}
                loading="lazy"
                className="h-24 w-24 rounded-lg object-cover"
              />
              <button
                onClick={() => setComprovante(null)}
                aria-label="Remover comprovante"
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ) : null}

          <Button onClick={lancar} disabled={mesTravado} className="mt-3 w-full">
            Registrar como {usuarioAtual.nome}
          </Button>
          {mesTravado ? (
            <p className="mt-2 text-center text-[11px] text-destructive">
              {rotuloMes(mesDoLancamento)} está fechado. Reabra o mês para lançar.
            </p>
          ) : null}
        </div>

        {/* Histórico */}
        <h2 className="mt-6 font-display text-lg">Histórico</h2>

        <div className="relative mt-3">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soft" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por descrição, categoria ou pessoa"
            className="bg-background pl-9"
          />
        </div>

        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          <select
            value={fMes}
            onChange={(e) => setFMes(e.target.value)}
            aria-label="Filtrar por mês"
            className="rounded-lg border border-border bg-background px-2 py-2"
          >
            <option value="todos">Todo período</option>
            {meses.map((m) => (
              <option key={m} value={m}>
                {rotuloMes(m)}
              </option>
            ))}
          </select>
          <select
            value={fCategoria}
            onChange={(e) => setFCategoria(e.target.value)}
            aria-label="Filtrar por categoria"
            className="rounded-lg border border-border bg-background px-2 py-2"
          >
            <option value="todas">Categorias</option>
            {todasCategorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={fResponsavel}
            onChange={(e) => setFResponsavel(e.target.value)}
            aria-label="Filtrar por quem lançou"
            className="rounded-lg border border-border bg-background px-2 py-2"
          >
            <option value="todos">Quem lançou</option>
            {responsaveis.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        <div className="surface-card mt-3 grid grid-cols-3 gap-2 p-3 text-center text-xs">
          <div>
            <p className="text-soft">Entradas</p>
            <p className="font-semibold text-emerald-500">{brl(totalFiltrado.e)}</p>
          </div>
          <div>
            <p className="text-soft">Saídas</p>
            <p className="font-semibold text-red-500">{brl(totalFiltrado.s)}</p>
          </div>
          <div>
            <p className="text-soft">Saldo</p>
            <p className="font-semibold text-primary">{brl(totalFiltrado.saldo)}</p>
          </div>
        </div>

        <div className="mt-3 space-y-2">
          {filtrados.map((i) => (
            <div key={i.id} className="surface-card flex items-center gap-3 p-3">
              <span
                className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                  i.tipo === "entrada"
                    ? "bg-emerald-500/15 text-emerald-500"
                    : "bg-red-500/15 text-red-500"
                }`}
              >
                {i.tipo === "entrada" ? (
                  <ArrowUpCircle className="size-5" />
                ) : (
                  <ArrowDownCircle className="size-5" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{i.descricao}</p>
                <p className="text-[11px] text-soft">
                  {i.categoria} · {i.forma} · {i.data}
                </p>
                <p className="text-[11px] text-soft">Lançado por {i.responsavel}</p>
                {i.observacao ? (
                  <p className="mt-1 text-[11px] italic text-soft">{i.observacao}</p>
                ) : null}
                {i.comprovante ? (
                  <a
                    href={i.comprovante}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-primary"
                  >
                    <Paperclip className="size-3" /> Comprovante
                  </a>
                ) : null}
              </div>
              <span
                className={`shrink-0 text-sm font-semibold ${
                  i.tipo === "entrada" ? "text-emerald-500" : "text-red-500"
                }`}
              >
                {i.tipo === "entrada" ? "+" : "-"}
                {brl(i.valor)}
              </span>
            </div>
          ))}
          {filtrados.length === 0 ? (
            <p className="py-6 text-center text-sm text-soft">
              Nenhum lançamento para os filtros escolhidos.
            </p>
          ) : null}
        </div>
      </div>
    </AppShell>
  );
}
