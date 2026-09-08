import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { BookOpen, ExternalLink, Music2, Pencil, Pin, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { BloqueioMinisterio } from "@/components/BloqueioMinisterio";
import { CifraViewer } from "@/components/CifraViewer";
import { RichTextEditor } from "@/components/RichTextEditor";
import { appConfirm } from "@/components/ui/AppDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerfil, type PerfilAtual } from "@/hooks/usePerfil";
import { supabase } from "@/integrations/supabase/client";
import {
  formatarData,
  listarEstudos,
  podeGerirCategoria,
  textoPuro,
  type Estudo,
} from "@/lib/estudos-biblicos";
import { hojeIso, isoParaBR, LIVROS_BIBLIA, ordemDoLivro } from "@/lib/livros-biblia";
import {
  excluirAvisoMin,
  excluirCheckin,
  excluirCifra,
  excluirEnsaio,
  excluirEventoMin,
  excluirLouvor,
  excluirVisita,
  lerProposito,
  listarAgendaMin,
  listarAvisosMin,
  listarCheckins,
  listarCifras,
  listarEnsaios,
  listarRepertorio,
  listarVisitas,
  salvarAvisoMin,
  salvarCheckin,
  salvarCifra,
  salvarEnsaio,
  salvarEventoMin,
  salvarLouvor,
  salvarProposito,
  salvarVisita,
  useLista,
  type AvisoMinDB,
  type CheckinDB,
  type CifraDB,
  type EnsaioDB,
  type EventoMinDB,
  type LouvorDB,
  type VisitaDB,
} from "@/lib/ministerio-db";
import {
  ministeriosConteudo,
  type MinisterioConteudo,
  type SecaoKey,
} from "@/lib/ministerio-data";
import { podeAdministrarMinisterio, podeVerMinisterio, type SlugMinisterio } from "@/lib/permissoes";
import type { MinisterioSlug } from "@/lib/church-data";

export const Route = createFileRoute("/ministerios/$slug/$secao")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Área do Ministério — IPRB Renovada" },
      {
        name: "description",
        content: "Ensaio, oração, repertório, avisos, agenda e mais dentro do ministério.",
      },
      { property: "og:title", content: "Área do Ministério — IPRB Renovada" },
      { property: "og:description", content: "Conteúdo interno do ministério." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SecaoPage,
  notFoundComponent: () => (
    <AppShell>
      <PageHeader title="Seção não encontrada" />
    </AppShell>
  ),
});

function SecaoPage() {
  const { permissao } = usePerfil();
  const { slug, secao } = Route.useParams();
  const conteudo = ministeriosConteudo[slug as MinisterioSlug];
  if (!conteudo) throw notFound();
  const meta = conteudo.secoes.find((s) => s.key === secao);
  if (!meta) throw notFound();

  const temAcesso = podeVerMinisterio(permissao, conteudo.slug as SlugMinisterio);

  return (
    <AppShell theme={conteudo.slug}>
      <PageHeader
        back
        title={`${meta.emoji} ${meta.label}`}
        subtitle={`${conteudo.nome} · ${conteudo.subtitulo}`}
      />
      <div className="px-5 py-5">
        {!temAcesso ? (
          <BloqueioMinisterio slug={conteudo.slug as SlugMinisterio} />
        ) : (
          <Conteudo secao={secao as SecaoKey} c={conteudo} />
        )}
      </div>
    </AppShell>
  );
}

function Conteudo({ secao, c }: { secao: SecaoKey; c: MinisterioConteudo }) {
  if (secao === "ensaio") return <EnsaioView c={c} />;
  if (secao === "oracao") return <OracaoView c={c} />;
  if (secao === "repertorio" || secao === "letras") return <RepertorioView c={c} />;
  if (secao === "avisos") return <AvisosView c={c} />;
  if (secao === "estudo") return <EstudoView c={c} />;
  if (secao === "agenda") return <AgendaView c={c} />;
  if (secao === "visitas") return <VisitasView c={c} />;
  if (secao === "cifras") return <CifrasView c={c} />;
  return null;
}

function AcaoBtn({
  children,
  onClick,
  perigo,
}: {
  children: ReactNode;
  onClick: () => void;
  perigo?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold ${
        perigo ? "text-destructive" : "text-primary"
      }`}
    >
      {children}
    </button>
  );
}

function Campo({
  label,
  valor,
  onChange,
  tipo = "text",
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  tipo?: string;
}) {
  return (
    <label className="block text-xs text-soft">
      {label}
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
      />
    </label>
  );
}

const Vazio = ({ texto }: { texto: string }) => <p className="text-sm text-soft">{texto}</p>;

const Carregando = () => (
  <div className="space-y-2">
    <Skeleton className="h-16 w-full" />
    <Skeleton className="h-16 w-full" />
  </div>
);

function useMinisterio(c: MinisterioConteudo) {
  const { perfil, permissao } = usePerfil();
  const lider = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  return { perfil: perfil as PerfilAtual | null, lider, slug: c.slug as string };
}

/* ---------- Ensaio ---------- */
const ensaioVazio = {
  titulo: "",
  artista: "",
  tom: "",
  data: "",
  horario: "",
  local: "",
  link: "",
  solistas: "",
  partes: "",
  observacoes: "",
};

function EnsaioView({ c }: { c: MinisterioConteudo }) {
  const { perfil, lider, slug } = useMinisterio(c);
  const { lista, recarregar } = useLista<EnsaioDB>(() => listarEnsaios(slug));
  const [aberto, setAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState(ensaioVazio);

  const abrirNovo = () => {
    setForm({ ...ensaioVazio, data: hojeIso() });
    setEditandoId(null);
    setAberto(true);
  };

  const abrirEdicao = (e: EnsaioDB) => {
    setForm({
      titulo: e.titulo,
      artista: e.artista,
      tom: e.tom,
      data: e.data ?? "",
      horario: e.horario,
      local: e.local,
      link: e.link,
      solistas: e.solistas.join(", "),
      partes: e.partes
        .map((p) => `${p.quem} | ${p.texto}${p.marcacao ? ` | ${p.marcacao}` : ""}`)
        .join("\n"),
      observacoes: e.observacoes.join("\n"),
    });
    setEditandoId(e.id);
    setAberto(true);
  };

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.titulo.trim()) return;
    const ok = await salvarEnsaio(editandoId, {
      ministerio_slug: slug,
      titulo: form.titulo.trim(),
      artista: form.artista.trim(),
      tom: form.tom.trim() || "C",
      data: form.data || null,
      horario: form.horario.trim(),
      local: form.local.trim(),
      link: form.link.trim(),
      solistas: form.solistas.split(",").map((s) => s.trim()).filter(Boolean),
      partes: form.partes
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean)
        .map((linha) => {
          const [quem = "Conjunto", texto = "", marcacao] = linha.split("|").map((p) => p.trim());
          return marcacao ? { quem, texto, marcacao } : { quem, texto };
        }),
      observacoes: form.observacoes.split("\n").map((o) => o.trim()).filter(Boolean),
      ...(editandoId
        ? {}
        : { autor_id: perfil?.id ?? null, autor_nome: perfil?.nome ?? "Liderança" }),
    });
    if (!ok) return;
    setAberto(false);
    setEditandoId(null);
    await recarregar();
  };

  return (
    <div className="space-y-4">
      {lider ? (
        aberto ? (
          <form onSubmit={salvar} className="surface-card space-y-2 p-4">
            <h2 className="font-display text-lg">
              {editandoId ? "Editar ensaio" : "Adicionar ensaio"}
            </h2>
            <Campo label="Louvor / título do ensaio" valor={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
            <Campo label="Artista / versão" valor={form.artista} onChange={(v) => setForm({ ...form, artista: v })} />
            <Campo label="Tom" valor={form.tom} onChange={(v) => setForm({ ...form, tom: v })} />
            <Campo label="Data" tipo="date" valor={form.data} onChange={(v) => setForm({ ...form, data: v })} />
            <Campo label="Horário" tipo="time" valor={form.horario} onChange={(v) => setForm({ ...form, horario: v })} />
            <Campo label="Local" valor={form.local} onChange={(v) => setForm({ ...form, local: v })} />
            <Campo label="Referência (link do vídeo/áudio)" valor={form.link} onChange={(v) => setForm({ ...form, link: v })} />
            <Campo label="Solistas / ministros (separados por vírgula)" valor={form.solistas} onChange={(v) => setForm({ ...form, solistas: v })} />
            <label className="block text-xs text-soft">
              Letra com as partes — uma por linha: Quem canta | trecho | marcação (opcional)
              <textarea
                rows={6}
                value={form.partes}
                onChange={(e) => setForm({ ...form, partes: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-transparent p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <label className="block text-xs text-soft">
              Observações de dinâmica (uma por linha)
              <textarea
                rows={3}
                value={form.observacoes}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-transparent p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
              />
            </label>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                Salvar ensaio
              </button>
              <button
                type="button"
                onClick={() => setAberto(false)}
                className="rounded-xl border border-border px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={abrirNovo}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Adicionar ensaio
          </button>
        )
      ) : null}

      {lista === null ? <Carregando /> : null}
      {lista?.length === 0 ? <Vazio texto="Nenhum ensaio cadastrado." /> : null}

      {(lista ?? []).map((e) => (
        <div key={e.id} className="surface-card p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs text-soft">
                {e.data ? isoParaBR(e.data) : "Sem data"}
                {e.horario ? ` · ${e.horario}` : ""}
                {e.local ? ` · ${e.local}` : ""}
              </p>
              <h2 className="font-display text-xl">{e.titulo}</h2>
              <p className="text-sm text-soft">{e.artista}</p>
            </div>
            <span className="rounded-lg bg-primary px-3 py-1.5 text-sm font-bold text-primary-foreground">
              Tom {e.tom}
            </span>
          </div>

          {e.link ? (
            <a
              href={e.link}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
            >
              <ExternalLink className="size-4" /> Referência (vídeo/áudio)
            </a>
          ) : null}

          {e.solistas.length ? (
            <ul className="mt-3 flex flex-wrap gap-2">
              {e.solistas.map((s) => (
                <li key={s} className="rounded-full border border-border px-3 py-1 text-xs">
                  {s}
                </li>
              ))}
            </ul>
          ) : null}

          {e.partes.length ? (
            <div className="mt-3 space-y-3">
              {e.partes.map((p, i) => (
                <div key={i} className="border-l-2 border-primary/60 pl-3">
                  <p className="text-xs font-semibold text-primary">{p.quem}</p>
                  <p className="text-sm">{p.texto}</p>
                  {p.marcacao ? (
                    <p className="mt-0.5 text-[11px] italic text-soft">▸ {p.marcacao}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {e.observacoes.length ? (
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-soft">
              {e.observacoes.map((o) => (
                <li key={o}>{o}</li>
              ))}
            </ul>
          ) : null}

          <p className="mt-3 text-xs text-soft">Por {e.autor_nome || "Liderança"}</p>

          {lider ? (
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <AcaoBtn onClick={() => abrirEdicao(e)}>
                <Pencil className="size-3.5" /> Editar
              </AcaoBtn>
              <AcaoBtn
                perigo
                onClick={async () => {
                  if (!(await appConfirm(`Excluir o ensaio “${e.titulo}”?`))) return;
                  if (await excluirEnsaio(e.id)) await recarregar();
                }}
              >
                <Trash2 className="size-3.5" /> Excluir
              </AcaoBtn>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ---------- Oração ---------- */
function OracaoView({ c }: { c: MinisterioConteudo }) {
  const { perfil, lider, slug } = useMinisterio(c);
  const { lista, recarregar } = useLista<CheckinDB>(() => listarCheckins(slug));
  const [proposito, setProposito] = useState("");
  const [editandoProposito, setEditandoProposito] = useState(false);
  const [texto, setTexto] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const carregarProposito = useCallback(async () => setProposito(await lerProposito(slug)), [slug]);
  useEffect(() => {
    void carregarProposito();
  }, [carregarProposito]);

  const enviar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!texto.trim() || !perfil) return;
    const ok = await salvarCheckin(editandoId, {
      ministerio_slug: slug,
      texto: texto.trim(),
      ...(editandoId ? {} : { autor_id: perfil.id, autor_nome: perfil.nome }),
    });
    if (!ok) return;
    setTexto("");
    setEditandoId(null);
    await recarregar();
  };

  return (
    <div className="space-y-4">
      <div className="surface-card border-primary/40 p-4">
        <p className="text-xs font-semibold text-primary">Propósito da semana</p>
        {editandoProposito ? (
          <>
            <textarea
              rows={3}
              value={proposito}
              onChange={(e) => setProposito(e.target.value)}
              className="mt-2 w-full rounded-xl border border-border bg-transparent p-3 text-sm text-foreground"
            />
            <button
              onClick={async () => {
                if (await salvarProposito(slug, proposito)) setEditandoProposito(false);
              }}
              className="mt-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
            >
              Salvar propósito
            </button>
          </>
        ) : (
          <>
            <p className="mt-1 text-sm">{proposito || "Nenhum propósito registrado ainda."}</p>
            {lider ? (
              <div className="mt-3">
                <AcaoBtn onClick={() => setEditandoProposito(true)}>
                  <Pencil className="size-3.5" /> Editar propósito
                </AcaoBtn>
              </div>
            ) : null}
          </>
        )}
      </div>

      <form className="surface-card p-4" onSubmit={enviar}>
        <h3 className="font-display text-lg">Check-in de oração</h3>
        <p className="text-xs text-soft">
          Identificado como {perfil?.nome ?? "visitante"} — sem anonimato.
        </p>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Compartilhe sua intenção ou pedido…"
          className="mt-3 w-full rounded-xl border border-border bg-transparent p-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
          {editandoId ? "Salvar alteração" : "Registrar"}
        </button>
      </form>

      {lista === null ? <Carregando /> : null}
      {lista?.length === 0 ? <Vazio texto="Nenhum check-in registrado." /> : null}

      <div className="space-y-3">
        {(lista ?? []).map((p) => (
          <div key={p.id} className="surface-card p-4">
            <p className="text-sm">{p.texto}</p>
            <p className="mt-2 text-xs text-soft">
              {p.autor_nome} · {formatarData(p.created_at)}
            </p>
            {lider || p.autor_id === perfil?.id ? (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <AcaoBtn
                  onClick={() => {
                    setEditandoId(p.id);
                    setTexto(p.texto);
                  }}
                >
                  <Pencil className="size-3.5" /> Editar
                </AcaoBtn>
                <AcaoBtn
                  perigo
                  onClick={async () => {
                    if (!(await appConfirm("Excluir este pedido?"))) return;
                    if (await excluirCheckin(p.id)) await recarregar();
                  }}
                >
                  <Trash2 className="size-3.5" /> Excluir
                </AcaoBtn>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Repertório / Letras ---------- */
const ABAS = [
  { id: "rapidos", label: "⚡ Rápidos" },
  { id: "congregacional", label: "📌 Congregacionais" },
  { id: "ceia", label: "✝️ Ceia" },
];

function RepertorioView({ c }: { c: MinisterioConteudo }) {
  const { perfil, lider, slug } = useMinisterio(c);
  const { lista, recarregar } = useLista<LouvorDB>(() => listarRepertorio(slug));
  const [aba, setAba] = useState("congregacional");
  const [aberto, setAberto] = useState<string | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", artista: "", tom: "", link: "", letra: "" });

  const limpar = () => {
    setForm({ titulo: "", artista: "", tom: "", link: "", letra: "" });
    setEditandoId(null);
    setFormAberto(false);
  };

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.titulo.trim()) return;
    const ok = await salvarLouvor(editandoId, {
      ministerio_slug: slug,
      aba,
      titulo: form.titulo.trim(),
      artista: form.artista.trim(),
      tom: form.tom.trim() || "C",
      link: form.link.trim(),
      letra: form.letra.split("\n").filter(Boolean),
      ...(editandoId
        ? {}
        : { autor_id: perfil?.id ?? null, autor_nome: perfil?.nome ?? "Liderança" }),
    });
    if (!ok) return;
    limpar();
    await recarregar();
  };

  const filtrados = (lista ?? []).filter((l) => l.aba === aba);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
              a.id === aba ? "bg-primary text-primary-foreground" : "border border-border text-soft"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {lider ? (
        formAberto ? (
          <form onSubmit={salvar} className="surface-card space-y-2 p-4">
            <h3 className="font-display text-lg">{editandoId ? "Editar louvor" : "Novo louvor"}</h3>
            <Campo label="Título" valor={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
            <Campo label="Artista" valor={form.artista} onChange={(v) => setForm({ ...form, artista: v })} />
            <Campo label="Tom" valor={form.tom} onChange={(v) => setForm({ ...form, tom: v })} />
            <Campo label="Link de referência" valor={form.link} onChange={(v) => setForm({ ...form, link: v })} />
            <label className="block text-xs text-soft">
              Letra (uma linha por verso)
              <textarea
                rows={4}
                value={form.letra}
                onChange={(e) => setForm({ ...form, letra: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                Salvar
              </button>
              <button
                type="button"
                onClick={limpar}
                className="rounded-xl border border-border px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setFormAberto(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Adicionar louvor
          </button>
        )
      ) : null}

      {lista === null ? <Carregando /> : null}
      {lista !== null && filtrados.length === 0 ? (
        <Vazio texto="Nenhum louvor nesta aba." />
      ) : null}

      <div className="space-y-3">
        {filtrados.map((l) => (
          <div key={l.id} className="surface-card p-4">
            <button
              onClick={() => setAberto(aberto === l.id ? null : l.id)}
              className="flex w-full items-center justify-between gap-3 text-left"
            >
              <span>
                <span className="font-display text-lg">{l.titulo}</span>
                <span className="block text-xs text-soft">{l.artista}</span>
              </span>
              <span className="rounded-lg border border-border px-2 py-1 text-xs font-bold text-primary">
                {l.tom}
              </span>
            </button>

            {aberto === l.id ? (
              <div className="mt-3 space-y-3">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">
                  {l.letra.join("\n")}
                </pre>
                {l.link ? (
                  <a
                    href={l.link}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                  >
                    <ExternalLink className="size-4" /> Ouvir referência
                  </a>
                ) : null}
                {lider ? (
                  <div className="flex gap-2 border-t border-border pt-3">
                    <AcaoBtn
                      onClick={() => {
                        setEditandoId(l.id);
                        setFormAberto(true);
                        setForm({
                          titulo: l.titulo,
                          artista: l.artista,
                          tom: l.tom,
                          link: l.link,
                          letra: l.letra.join("\n"),
                        });
                      }}
                    >
                      <Pencil className="size-3.5" /> Editar
                    </AcaoBtn>
                    <AcaoBtn
                      perigo
                      onClick={async () => {
                        if (!(await appConfirm(`Excluir “${l.titulo}”?`))) return;
                        if (await excluirLouvor(l.id)) await recarregar();
                      }}
                    >
                      <Trash2 className="size-3.5" /> Excluir
                    </AcaoBtn>
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Avisos ---------- */
function AvisosView({ c }: { c: MinisterioConteudo }) {
  const { perfil, lider, slug } = useMinisterio(c);
  const { lista, recarregar } = useLista<AvisoMinDB>(() => listarAvisosMin(slug));
  const [form, setForm] = useState({ titulo: "", texto: "" });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.titulo.trim()) return;
    const ok = await salvarAvisoMin(editandoId, {
      ministerio_slug: slug,
      titulo: form.titulo.trim(),
      texto: form.texto.trim(),
      ...(editandoId
        ? {}
        : { autor_id: perfil?.id ?? null, autor_nome: perfil?.nome ?? "Liderança" }),
    });
    if (!ok) return;
    setForm({ titulo: "", texto: "" });
    setEditandoId(null);
    await recarregar();
  };

  return (
    <div className="space-y-3">
      {lider ? (
        <form onSubmit={salvar} className="surface-card space-y-2 p-4">
          <h2 className="font-display text-lg">
            {editandoId ? "Editar aviso" : "Novo aviso do ministério"}
          </h2>
          <Campo label="Título" valor={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
          <label className="block text-xs text-soft">
            Mensagem
            <textarea
              rows={2}
              value={form.texto}
              onChange={(e) => setForm({ ...form, texto: e.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-foreground"
            />
          </label>
          <div className="flex gap-2">
            <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
              {editandoId ? "Salvar" : "Publicar"}
            </button>
            {editandoId ? (
              <button
                type="button"
                onClick={() => {
                  setEditandoId(null);
                  setForm({ titulo: "", texto: "" });
                }}
                className="rounded-xl border border-border px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
            ) : null}
          </div>
        </form>
      ) : null}

      {lista === null ? <Carregando /> : null}
      {lista?.length === 0 ? <Vazio texto="Nenhum aviso publicado." /> : null}

      {(lista ?? []).map((a) => (
        <article key={a.id} className={`surface-card p-4 ${a.fixado ? "border-primary/50" : ""}`}>
          {a.fixado ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Pin className="size-3.5" /> Fixado
            </p>
          ) : null}
          <h2 className="font-display text-lg">{a.titulo}</h2>
          <p className="mt-1 text-sm">{a.texto}</p>
          <p className="mt-2 text-xs text-soft">
            {a.autor_nome} · {formatarData(a.created_at)}
          </p>
          {lider ? (
            <div className="mt-3 flex flex-wrap gap-2 border-t border-border pt-3">
              <AcaoBtn
                onClick={() => {
                  setEditandoId(a.id);
                  setForm({ titulo: a.titulo, texto: a.texto });
                }}
              >
                <Pencil className="size-3.5" /> Editar
              </AcaoBtn>
              <AcaoBtn
                onClick={async () => {
                  if (await salvarAvisoMin(a.id, { fixado: !a.fixado })) await recarregar();
                }}
              >
                <Pin className="size-3.5" /> {a.fixado ? "Desafixar" : "Fixar"}
              </AcaoBtn>
              <AcaoBtn
                perigo
                onClick={async () => {
                  if (!(await appConfirm("Excluir este aviso?"))) return;
                  if (await excluirAvisoMin(a.id)) await recarregar();
                }}
              >
                <Trash2 className="size-3.5" /> Excluir
              </AcaoBtn>
            </div>
          ) : null}
        </article>
      ))}
    </div>
  );
}

/* ---------- Estudo de Jovens (ordem dos livros da Bíblia) ---------- */
function EstudoView({ c }: { c: MinisterioConteudo }) {
  const { perfil, permissao } = usePerfil();
  const navigate = useNavigate();
  const gestor =
    podeGerirCategoria(permissao, "jovens") ||
    podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);

  const [lista, setLista] = useState<Estudo[] | null>(null);
  const [busca, setBusca] = useState("");
  const [criando, setCriando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ titulo: "", subtitulo: "", livro: "", conteudo: "" });

  useEffect(() => {
    void (async () => setLista(await listarEstudos("jovens")))();
  }, []);

  const filtrados = (lista ?? [])
    .filter((e) =>
      [e.titulo, e.subtitulo, e.livro_biblico, textoPuro(e.conteudo_html)]
        .join(" ")
        .toLowerCase()
        .includes(busca.toLowerCase()),
    )
    .sort(
      (a, b) =>
        (a.ordem_livro ?? 999) - (b.ordem_livro ?? 999) ||
        a.titulo.localeCompare(b.titulo, "pt-BR"),
    );

  const salvar = async () => {
    if (!form.titulo.trim() || !perfil) return;
    setSalvando(true);
    const { data, error } = await supabase
      .from("estudos")
      .insert({
        categoria: "jovens",
        titulo: form.titulo.trim(),
        subtitulo: form.subtitulo.trim(),
        livro_biblico: form.livro.trim(),
        ordem_livro: ordemDoLivro(form.livro),
        conteudo_html: form.conteudo,
        autor_id: perfil.id,
        autor_nome: perfil.nome,
      })
      .select("id")
      .maybeSingle();
    setSalvando(false);
    if (error || !data) return;
    setCriando(false);
    await navigate({ to: "/estudo/$id", params: { id: data.id } });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soft" />
        <Input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar por título, livro ou palavra-chave"
          className="h-12 bg-surface pl-9"
        />
      </div>

      {gestor ? (
        <button
          type="button"
          onClick={() => {
            setForm({ titulo: "", subtitulo: "", livro: "", conteudo: "" });
            setCriando(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground active:scale-95"
        >
          <Plus className="size-4" /> Adicionar Estudo
        </button>
      ) : null}

      {lista === null ? (
        <Carregando />
      ) : filtrados.length ? (
        filtrados.map((e) => (
          <Link
            key={e.id}
            to="/estudo/$id"
            params={{ id: e.id }}
            className="surface-card block p-4 active:scale-[0.99]"
          >
            <span className="inline-block rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
              {e.livro_biblico || "Estudo de Jovens"}
            </span>
            <h2 className="mt-2 font-display text-lg leading-snug">{e.titulo}</h2>
            {e.subtitulo ? <p className="mt-0.5 text-sm text-soft">{e.subtitulo}</p> : null}
            <p className="mt-2 text-xs text-soft">
              {e.autor_nome || "Liderança"} · {formatarData(e.created_at)}
            </p>
          </Link>
        ))
      ) : (
        <div className="surface-card flex flex-col items-center gap-2 px-5 py-10 text-center">
          <BookOpen className="size-8 text-primary" />
          <p className="font-display text-lg">
            {busca ? "Nenhum estudo encontrado." : "Nenhum estudo publicado ainda."}
          </p>
          <p className="text-sm text-soft">
            {busca ? "Tente outra palavra-chave." : "A liderança publicará os estudos em breve."}
          </p>
        </div>
      )}

      {criando ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <button type="button" onClick={() => setCriando(false)} className="text-sm text-soft">
              Cancelar
            </button>
            <p className="font-display text-base">Novo estudo</p>
            <button
              type="button"
              disabled={!form.titulo.trim() || salvando}
              onClick={() => void salvar()}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              {salvando ? "Salvando…" : "Salvar"}
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 pb-24">
            <Input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Título do estudo (obrigatório)"
              className="h-12 bg-surface"
            />
            <Input
              value={form.subtitulo}
              onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
              placeholder="Subtítulo (opcional)"
              className="h-12 bg-surface"
            />
            <label className="block text-xs text-soft">
              Livro da Bíblia — define a ordem da lista
              <input
                list="livros-biblia"
                value={form.livro}
                onChange={(e) => setForm({ ...form, livro: e.target.value })}
                placeholder="Ex.: Gênesis"
                className="mt-1 h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground"
              />
              <datalist id="livros-biblia">
                {LIVROS_BIBLIA.map((l) => (
                  <option key={l} value={l} />
                ))}
              </datalist>
            </label>
            <RichTextEditor
              valor={form.conteudo}
              onChange={(html) => setForm((f) => ({ ...f, conteudo: html }))}
              placeholder="Escreva o conteúdo do estudo…"
              minHeight={280}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Agenda do ministério ---------- */
function AgendaView({ c }: { c: MinisterioConteudo }) {
  const { perfil, lider, slug } = useMinisterio(c);
  const { lista, recarregar } = useLista<EventoMinDB>(() => listarAgendaMin(slug));
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", tipo: "Ensaio", data: "", hora: "", presencas: "" });

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.titulo.trim()) return;
    const nomes = form.presencas.split(",").map((n) => n.trim()).filter(Boolean);
    const ok = await salvarEventoMin(editandoId, {
      ministerio_slug: slug,
      titulo: form.titulo.trim(),
      tipo: form.tipo,
      data: form.data || null,
      hora: form.hora,
      ...(nomes.length ? { presencas: nomes.map((nome) => ({ nome, presente: false })) } : {}),
      ...(editandoId
        ? {}
        : { autor_id: perfil?.id ?? null, autor_nome: perfil?.nome ?? "Liderança" }),
    });
    if (!ok) return;
    setForm({ titulo: "", tipo: "Ensaio", data: "", hora: "", presencas: "" });
    setEditandoId(null);
    setFormAberto(false);
    await recarregar();
  };

  const alternarPresenca = async (e: EventoMinDB, nome: string) => {
    const presencas = e.presencas.map((p) =>
      p.nome === nome ? { ...p, presente: !p.presente } : p,
    );
    if (await salvarEventoMin(e.id, { presencas })) await recarregar();
  };

  return (
    <div className="space-y-4">
      {lider ? (
        formAberto ? (
          <form onSubmit={salvar} className="surface-card space-y-2 p-4">
            <h3 className="font-display text-lg">{editandoId ? "Editar evento" : "Novo evento"}</h3>
            <Campo label="Título" valor={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
            <label className="block text-xs text-soft">
              Tipo
              <select
                value={form.tipo}
                onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              >
                {["Ensaio", "Culto", "Evento"].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
            <Campo label="Data" tipo="date" valor={form.data} onChange={(v) => setForm({ ...form, data: v })} />
            <Campo label="Hora" tipo="time" valor={form.hora} onChange={(v) => setForm({ ...form, hora: v })} />
            <Campo
              label="Lista de presença (nomes separados por vírgula)"
              valor={form.presencas}
              onChange={(v) => setForm({ ...form, presencas: v })}
            />
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormAberto(false);
                  setEditandoId(null);
                }}
                className="rounded-xl border border-border px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setFormAberto(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Adicionar evento
          </button>
        )
      ) : null}

      {lista === null ? <Carregando /> : null}
      {lista?.length === 0 ? <Vazio texto="Nenhum evento na agenda do ministério." /> : null}

      {(lista ?? []).map((e) => (
        <div key={e.id} className="surface-card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg">{e.titulo}</h2>
            <span className="text-xs font-semibold text-primary">{e.tipo}</span>
          </div>
          <p className="text-xs text-soft">
            {e.data ? isoParaBR(e.data) : "Sem data"} {e.hora ? `· ${e.hora}` : ""}
          </p>

          {e.louvores.length ? (
            <div className="mt-3 rounded-xl border border-border p-3">
              <p className="text-xs font-semibold text-primary">🎵 Louvores do dia</p>
              <ul className="mt-1 space-y-1 text-sm">
                {e.louvores.map((l) => (
                  <li key={l.titulo} className="flex justify-between gap-2">
                    <span>{l.titulo}</span>
                    <span className="text-xs text-soft">
                      {l.ministro} · {l.tom}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {e.presencas.length ? (
            <>
              <p className="mt-3 text-xs font-semibold text-soft">Lista de presença</p>
              <ul className="mt-1 space-y-1.5">
                {e.presencas.map((p) => (
                  <li key={p.nome} className="flex items-center justify-between gap-2">
                    <span className="text-sm">{p.nome}</span>
                    <button
                      onClick={() => void alternarPresenca(e, p.nome)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ${
                        p.presente
                          ? "bg-primary text-primary-foreground"
                          : "border border-border text-soft"
                      }`}
                    >
                      {p.presente ? "Presente" : "Ausente"}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : null}

          {lider ? (
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <AcaoBtn
                onClick={() => {
                  setEditandoId(e.id);
                  setFormAberto(true);
                  setForm({
                    titulo: e.titulo,
                    tipo: e.tipo,
                    data: e.data ?? "",
                    hora: e.hora,
                    presencas: e.presencas.map((p) => p.nome).join(", "),
                  });
                }}
              >
                <Pencil className="size-3.5" /> Editar
              </AcaoBtn>
              <AcaoBtn
                perigo
                onClick={async () => {
                  if (!(await appConfirm(`Excluir “${e.titulo}”?`))) return;
                  if (await excluirEventoMin(e.id)) await recarregar();
                }}
              >
                <Trash2 className="size-3.5" /> Excluir
              </AcaoBtn>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}

/* ---------- Visitas (só Irmãs) ---------- */
function VisitasView({ c }: { c: MinisterioConteudo }) {
  const { perfil, lider, slug } = useMinisterio(c);
  const { lista, recarregar } = useLista<VisitaDB>(() => listarVisitas(slug));
  const [form, setForm] = useState({ nome: "", endereco: "", data: "", hora: "", irmas: "" });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const agendadas = (lista ?? []).filter((v) => !v.realizada);
  const historico = (lista ?? []).filter((v) => v.realizada);

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.nome.trim() || !form.data) return;
    const ok = await salvarVisita(editandoId, {
      ministerio_slug: slug,
      nome: form.nome.trim(),
      endereco: form.endereco.trim(),
      data: form.data,
      hora: form.hora,
      irmas: form.irmas
        ? form.irmas.split(",").map((s) => s.trim()).filter(Boolean)
        : [perfil?.nome ?? "Irmãs"],
      ...(editandoId
        ? {}
        : { autor_id: perfil?.id ?? null, autor_nome: perfil?.nome ?? "Irmãs" }),
    });
    if (!ok) return;
    setForm({ nome: "", endereco: "", data: "", hora: "", irmas: "" });
    setEditandoId(null);
    await recarregar();
  };

  return (
    <div className="space-y-4">
      <form className="surface-card space-y-2 p-4" onSubmit={salvar}>
        <h2 className="font-display text-lg">{editandoId ? "Editar visita" : "Agendar visita"}</h2>
        <Campo label="Nome da pessoa a visitar" valor={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
        <Campo label="Endereço" valor={form.endereco} onChange={(v) => setForm({ ...form, endereco: v })} />
        <Campo label="Data" tipo="date" valor={form.data} onChange={(v) => setForm({ ...form, data: v })} />
        <Campo label="Horário" tipo="time" valor={form.hora} onChange={(v) => setForm({ ...form, hora: v })} />
        <Campo
          label="Irmãs escaladas (separe por vírgula)"
          valor={form.irmas}
          onChange={(v) => setForm({ ...form, irmas: v })}
        />
        <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
          {editandoId ? "Salvar alteração" : "Agendar"}
        </button>
      </form>

      {lista === null ? <Carregando /> : null}

      <section>
        <h2 className="mb-2 font-display text-lg">Próximas visitas</h2>
        <div className="space-y-3">
          {agendadas.map((v) => (
            <div key={v.id} className="surface-card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold">{v.nome}</h3>
                <span className="text-xs font-semibold text-primary">
                  {v.data ? isoParaBR(v.data) : "Sem data"} · {v.hora || "—"}
                </span>
              </div>
              <p className="text-xs text-soft">{v.endereco}</p>
              <p className="mt-2 text-xs">Irmãs: {v.irmas.join(" e ")}</p>
              <button
                onClick={async () => {
                  if (await salvarVisita(v.id, { realizada: true })) await recarregar();
                }}
                className="mt-3 rounded-xl border border-border px-3 py-1.5 text-xs font-semibold"
              >
                Marcar como realizada
              </button>
              {lider ? (
                <div className="mt-3 flex gap-2 border-t border-border pt-3">
                  <AcaoBtn
                    onClick={() => {
                      setEditandoId(v.id);
                      setForm({
                        nome: v.nome,
                        endereco: v.endereco,
                        data: v.data ?? "",
                        hora: v.hora,
                        irmas: v.irmas.join(", "),
                      });
                    }}
                  >
                    <Pencil className="size-3.5" /> Editar
                  </AcaoBtn>
                  <AcaoBtn
                    perigo
                    onClick={async () => {
                      if (!(await appConfirm(`Excluir a visita a ${v.nome}?`))) return;
                      if (await excluirVisita(v.id)) await recarregar();
                    }}
                  >
                    <Trash2 className="size-3.5" /> Excluir
                  </AcaoBtn>
                </div>
              ) : null}
            </div>
          ))}
          {lista !== null && agendadas.length === 0 ? (
            <Vazio texto="Nenhuma visita agendada." />
          ) : null}
        </div>
      </section>

      <section>
        <h2 className="mb-2 font-display text-lg">Histórico</h2>
        <div className="space-y-2">
          {historico.map((v) => (
            <div key={v.id} className="surface-card p-3 text-sm">
              <p className="font-semibold">{v.nome}</p>
              <p className="text-xs text-soft">
                {v.data ? isoParaBR(v.data) : ""} · {v.irmas.join(" e ")}
              </p>
            </div>
          ))}
          {lista !== null && historico.length === 0 ? (
            <Vazio texto="Ainda sem visitas realizadas." />
          ) : null}
        </div>
      </section>
    </div>
  );
}

/* ---------- Cifras ---------- */
function CifrasView({ c }: { c: MinisterioConteudo }) {
  const { perfil, lider, slug } = useMinisterio(c);
  const { lista, recarregar } = useLista<CifraDB>(() => listarCifras(slug));
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", artista: "", tom: "", corpo: "" });

  const aberta = (lista ?? []).find((x) => x.id === abertaId);

  const salvar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.titulo.trim()) return;
    const ok = await salvarCifra(editandoId, {
      ministerio_slug: slug,
      titulo: form.titulo.trim(),
      artista: form.artista.trim(),
      tom: form.tom.trim() || "C",
      linhas: form.corpo.split("\n").map((linha) => {
        const [acordes, ...resto] = linha.split("|");
        return resto.length
          ? { acordes: (acordes ?? "").trim(), letra: resto.join("|").trim() }
          : { acordes: "", letra: linha };
      }),
      ...(editandoId
        ? {}
        : { autor_id: perfil?.id ?? null, autor_nome: perfil?.nome ?? "Liderança" }),
    });
    if (!ok) return;
    setForm({ titulo: "", artista: "", tom: "", corpo: "" });
    setEditandoId(null);
    setFormAberto(false);
    await recarregar();
  };

  if (aberta) {
    return (
      <div className="space-y-3">
        <button
          onClick={() => setAbertaId(null)}
          className="inline-flex items-center gap-1 text-sm font-semibold text-primary"
        >
          ← Voltar para a lista
        </button>
        <CifraViewer cifra={aberta} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-soft">
        Toque em um louvor para abrir a letra completa com cifras e trocar o tom.
      </p>

      {lider ? (
        formAberto ? (
          <form onSubmit={salvar} className="surface-card space-y-2 p-4">
            <h3 className="font-display text-lg">{editandoId ? "Editar cifra" : "Nova cifra"}</h3>
            <Campo label="Título" valor={form.titulo} onChange={(v) => setForm({ ...form, titulo: v })} />
            <Campo label="Artista" valor={form.artista} onChange={(v) => setForm({ ...form, artista: v })} />
            <Campo label="Tom" valor={form.tom} onChange={(v) => setForm({ ...form, tom: v })} />
            <label className="block text-xs text-soft">
              Uma linha por verso. Use: acordes | letra
              <textarea
                rows={6}
                value={form.corpo}
                onChange={(e) => setForm({ ...form, corpo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm text-foreground"
              />
            </label>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  setFormAberto(false);
                  setEditandoId(null);
                }}
                className="rounded-xl border border-border px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setFormAberto(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Plus className="size-4" /> Adicionar cifra
          </button>
        )
      ) : null}

      {lista === null ? <Carregando /> : null}
      {lista?.length === 0 ? <Vazio texto="Nenhuma cifra cadastrada." /> : null}

      {(lista ?? []).map((cf) => (
        <div key={cf.id} className="surface-card p-4">
          <button
            onClick={() => setAbertaId(cf.id)}
            className="flex w-full items-center justify-between gap-3 text-left transition-transform active:scale-[0.98]"
          >
            <span className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-full border border-primary/60 text-primary">
                <Music2 className="size-5" />
              </span>
              <span>
                <span className="block font-display text-lg leading-tight">{cf.titulo}</span>
                <span className="block text-xs text-soft">{cf.artista}</span>
              </span>
            </span>
            <span className="rounded-lg bg-primary px-2.5 py-1 text-xs font-bold text-primary-foreground">
              {cf.tom}
            </span>
          </button>
          {lider ? (
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <AcaoBtn
                onClick={() => {
                  setEditandoId(cf.id);
                  setFormAberto(true);
                  setForm({
                    titulo: cf.titulo,
                    artista: cf.artista,
                    tom: cf.tom,
                    corpo: cf.linhas
                      .map((l) => (l.acordes ? `${l.acordes} | ${l.letra}` : l.letra))
                      .join("\n"),
                  });
                }}
              >
                <Pencil className="size-3.5" /> Editar
              </AcaoBtn>
              <AcaoBtn
                perigo
                onClick={async () => {
                  if (!(await appConfirm(`Excluir “${cf.titulo}”?`))) return;
                  if (await excluirCifra(cf.id)) await recarregar();
                }}
              >
                <Trash2 className="size-3.5" /> Excluir
              </AcaoBtn>
            </div>
          ) : null}
        </div>
      ))}
    </div>
  );
}
