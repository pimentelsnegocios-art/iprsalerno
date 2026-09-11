import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Check, ClipboardCheck, Copy, QrCode, ShieldCheck, Upload } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { StatusBadge, VisualizadorComprovante } from "@/components/ContribuicaoUI";
import { appConfirm } from "@/components/ui/AppDialog";
import { useConfigIgreja } from "@/hooks/useConfigIgreja";
import { usePerfil } from "@/hooks/usePerfil";
import { podeVerCaixaPerfil } from "@/lib/permissoes";
import { formatarValorBRL, valorBRLParaNumero } from "@/lib/moeda";
import {
  acoesPix,
  brlPix,
  mesAtual,
  rotuloMes,
  usePixStore,
  type Contribuicao,
  type TipoContribuicao,
} from "@/lib/pix-store";

export const Route = createFileRoute("/contribuicoes/")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "PIX da Igreja — IPRB Renovada" },
      {
        name: "description",
        content:
          "Chave PIX da Igreja Presbiteriana Renovada, envio de comprovante de dízimos e ofertas e histórico das suas contribuições.",
      },
      { property: "og:title", content: "PIX da Igreja — IPRB Renovada" },
      {
        property: "og:description",
        content: "Contribua com dízimos e ofertas e acompanhe a confirmação da liderança.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Contribuicoes,
});

function Contribuicoes() {
  const { perfil, permissao } = usePerfil();
  const { contribuicoes } = usePixStore();
  const inputRef = useRef<HTMLInputElement>(null);

  const [tipo, setTipo] = useState<TipoContribuicao | "">("");
  const [valor, setValor] = useState("R$ 0,00");
  const [mesRef, setMesRef] = useState(mesAtual());
  const [arquivo, setArquivo] = useState<{
    nome: string;
    url: string;
    tipo: "imagem" | "pdf";
  } | null>(null);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");
  const [copiado, setCopiado] = useState(false);
  const [aberto, setAberto] = useState<Contribuicao | null>(null);

  const { config } = useConfigIgreja();
  const gestorCaixa = podeVerCaixaPerfil(permissao);

  const meus = useMemo(
    () => contribuicoes.filter((c) => c.usuarioId === perfil?.id),
    [contribuicoes, perfil?.id],
  );

  const porMes = useMemo(() => {
    const mapa = new Map<string, Contribuicao[]>();
    for (const c of meus) {
      mapa.set(c.mesRef, [...(mapa.get(c.mesRef) ?? []), c]);
    }
    return [...mapa.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [meus]);

  async function copiarChave() {
    try {
      await navigator.clipboard.writeText(config.pix_chave);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      setErro("Não foi possível copiar a chave.");
    }
  }

  function escolherArquivo(file: File | undefined) {
    if (!file) return;
    const ehPdf = file.type === "application/pdf";
    const ehImagem = file.type.startsWith("image/");
    if (!ehPdf && !ehImagem) {
      setErro("Envie uma imagem ou um arquivo PDF.");
      return;
    }
    const leitor = new FileReader();
    leitor.onload = () => {
      setArquivo({
        nome: file.name,
        url: String(leitor.result),
        tipo: ehPdf ? "pdf" : "imagem",
      });
      setErro("");
    };
    leitor.readAsDataURL(file);
  }

  async function enviar() {
    setSucesso("");
    if (!perfil) {
      setErro("Perfil não carregado.");
      return;
    }
    if (!tipo) {
      setErro("Escolha o tipo de contribuição.");
      return;
    }
    const numero = valorBRLParaNumero(valor);
    if (!Number.isFinite(numero) || numero <= 0) {
      setErro("Informe um valor maior que zero.");
      return;
    }
    if (!arquivo) {
      setErro("Anexe o comprovante.");
      return;
    }
    if (acoesPix.possivelDuplicidade(perfil.id, mesRef, numero)) {
      const ok = await appConfirm(
        "Já existe um envio com o mesmo valor neste mês. Deseja enviar mesmo assim?",
      );
      if (!ok) return;
    }

    acoesPix.enviar({
      usuarioId: perfil.id,
      usuarioNome: perfil.nome,
      tipo,
      valor: numero,
      mesRef,
      comprovanteNome: arquivo.nome,
      comprovanteUrl: arquivo.url,
      comprovanteTipo: arquivo.tipo,
    });

    setTipo("");
    setValor("R$ 0,00");
    setMesRef(mesAtual());
    setArquivo(null);
    if (inputRef.current) inputRef.current.value = "";
    setErro("");
    setSucesso("Comprovante enviado! Aguardando confirmação da liderança.");
  }

  return (
    <AppShell>
      <PageHeader
        title="PIX da Igreja"
        subtitle="Dízimos, ofertas e envio de comprovante"
        back
      />

      <div className="space-y-4 px-5 py-5">
        {/* Dados PIX */}
        <div className="surface-card p-4">
          <p className="text-xs text-soft">Recebedor</p>
          <p className="font-display text-lg leading-tight">{config.nome}</p>
          <p className="mt-1 text-xs text-soft">{config.pix_banco}</p>

          <div className="mt-4 rounded-xl border border-border bg-background/40 p-3">
            <p className="text-xs text-soft">Chave PIX ({config.pix_tipo})</p>
            <p className="break-all font-semibold">{config.pix_chave}</p>
            <button
              type="button"
              onClick={() => void copiarChave()}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              {copiado ? <Check className="size-4" /> : <Copy className="size-4" />}
              {copiado ? "Chave copiada!" : "Copiar chave PIX"}
            </button>
          </div>

          <div className="mt-3 flex items-center gap-3 rounded-xl border border-dashed border-border p-3 text-xs text-soft">
            <QrCode className="size-8 shrink-0 text-primary" />
            <span>
              QR Code ainda não cadastrado. Use a chave acima no aplicativo do seu banco.
            </span>
          </div>

          <p className="mt-3 text-sm text-soft">
            Ao enviar seu dízimo/oferta, envie o comprovante abaixo para registro.
          </p>
        </div>

        {gestorCaixa ? (
          <Link
            to="/contribuicoes/conferencia"
            className="surface-card flex items-center gap-3 p-4"
          >
            <ShieldCheck className="size-5 text-primary" />
            <div>
              <p className="font-semibold">Conferência de comprovantes</p>
              <p className="text-xs text-soft">Confirmar ou rejeitar envios dos membros</p>
            </div>
          </Link>
        ) : null}

        {/* Formulário */}
        <div className="surface-card p-4">
          <h2 className="font-display text-lg">Enviar comprovante</h2>

          <div className="mt-3">
            <p className="mb-1.5 text-xs text-soft">Tipo de contribuição *</p>
            <div className="grid grid-cols-2 gap-2">
              {(["Dízimo", "Oferta"] as TipoContribuicao[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipo(t)}
                  className={`rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors ${
                    tipo === t
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-soft"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-3 block text-xs text-soft">
            Valor *
            <input
              inputMode="numeric"
              value={valor}
              onChange={(e) => setValor(formatarValorBRL(e.target.value))}
              placeholder="R$ 0,00"
              className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm text-foreground"
            />
          </label>

          <label className="mt-3 block text-xs text-soft">
            Mês de referência *
            <input
              type="month"
              value={mesRef}
              onChange={(e) => setMesRef(e.target.value)}
              className="mt-1 w-full rounded-xl border border-border bg-background/40 px-3 py-2.5 text-sm text-foreground"
            />
          </label>

          <div className="mt-3">
            <p className="mb-1.5 text-xs text-soft">Comprovante (imagem ou PDF) *</p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              capture="environment"
              onChange={(e) => escolherArquivo(e.target.files?.[0])}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-soft"
            >
              <Upload className="size-4 text-primary" />
              {arquivo ? arquivo.nome : "Anexar comprovante"}
            </button>
            {arquivo?.tipo === "imagem" ? (
              <img
                src={arquivo.url}
                alt="Pré-visualização do comprovante"
                className="mt-2 max-h-48 w-full rounded-xl object-contain"
              />
            ) : null}
          </div>

          {erro ? <p className="mt-3 text-sm text-destructive">{erro}</p> : null}
          {sucesso ? <p className="mt-3 text-sm text-emerald-500">{sucesso}</p> : null}

          <button
            type="button"
            onClick={() => void enviar()}
            className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            Enviar para conferência
          </button>
        </div>

        {/* Histórico */}
        <div>
          <h2 className="mb-3 font-display text-xl">Minhas contribuições</h2>
          {porMes.length === 0 ? (
            <div className="surface-card p-6 text-center text-sm text-soft">
              <ClipboardCheck className="mx-auto mb-2 size-6 text-primary" />
              Você ainda não enviou comprovantes.
            </div>
          ) : (
            <div className="space-y-4">
              {porMes.map(([mes, itens]) => (
                <div key={mes}>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-soft">
                    {rotuloMes(mes)}
                  </p>
                  <div className="space-y-2">
                    {itens.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setAberto(c)}
                        className="surface-card flex w-full items-center justify-between gap-3 p-4 text-left"
                      >
                        <div>
                          <p className="font-semibold">{c.tipo}</p>
                          <p className="text-xs text-soft">{brlPix(c.valor)}</p>
                          {c.status === "rejeitado" && c.motivo ? (
                            <p className="mt-1 text-xs text-red-500">Motivo: {c.motivo}</p>
                          ) : null}
                        </div>
                        <StatusBadge status={c.status} />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {aberto ? (
        <VisualizadorComprovante item={aberto} onClose={() => setAberto(null)} />
      ) : null}
    </AppShell>
  );
}
