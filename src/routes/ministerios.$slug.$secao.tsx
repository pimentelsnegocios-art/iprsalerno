import { createFileRoute, notFound } from "@tanstack/react-router";
import { CalendarPlus, ExternalLink, Music2, Pencil, Pin, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";


import { AppShell, PageHeader } from "@/components/AppShell";
import { CifraViewer } from "@/components/CifraViewer";
import { usuarioAtual } from "@/lib/church-data";
import { supabase } from "@/integrations/supabase/client";
import { usePerfil } from "@/hooks/usePerfil";
import {
  ehSuperAdmin,
  podeAdministrarMinisterio,
  podeVerMinisterio,
  type SlugMinisterio,
} from "@/lib/permissoes";
import { BloqueioMinisterio } from "@/components/BloqueioMinisterio";
import {
  ministeriosConteudo,
  podeEditarEstudo,
  type MinisterioConteudo,
  type SecaoKey,
} from "@/lib/ministerio-data";
import type { MinisterioSlug } from "@/lib/church-data";

export const Route = createFileRoute("/ministerios/$slug/$secao")({
  head: () => ({
    meta: [
      { title: "Área do Ministério — IPR" },
      {
        name: "description",
        content: "Ensaio, oração, repertório, avisos, agenda e mais dentro do ministério.",
      },
      { property: "og:title", content: "Área do Ministério — IPR" },
      { property: "og:description", content: "Conteúdo interno do ministério." },
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


/* ---------- Ensaio ---------- */
interface EnsaioEdit {
  titulo: string;
  artista: string;
  tom: string;
  link: string;
  solistas: string;
  partes: string;
  observacoes: string;
}

function EnsaioView({ c }: { c: MinisterioConteudo }) {
  const { perfil, permissao } = usePerfil();
  const nome = perfil?.nome ?? "Liderança";
  const lider = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  const [e, setE] = useState(c.ensaio);
  const [autor, setAutor] = useState<string | null>(null);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState<EnsaioEdit>({
    titulo: e.titulo,
    artista: e.artista,
    tom: e.tom,
    link: e.link,
    solistas: e.solistas.join(", "),
    partes: e.partes
      .map((p) => `${p.quem} | ${p.texto}${p.marcacao ? ` | ${p.marcacao}` : ""}`)
      .join("\n"),
    observacoes: (e.observacoes ?? []).join("\n"),
  });

  const salvar = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.titulo.trim()) return;
    setE({
      titulo: form.titulo.trim(),
      artista: form.artista.trim(),
      tom: form.tom.trim() || "C",
      link: form.link.trim(),
      solistas: form.solistas
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      partes: form.partes
        .split("\n")
        .map((linha) => linha.trim())
        .filter(Boolean)
        .map((linha) => {
          const [quem = "Conjunto", texto = "", marcacao] = linha.split("|").map((p) => p.trim());
          return marcacao ? { quem, texto, marcacao } : { quem, texto };
        }),
      observacoes: form.observacoes
        .split("\n")
        .map((o) => o.trim())
        .filter(Boolean),
    });
    setAutor(nome);
    setEditando(false);
  };

  if (editando) {
    return (
      <form onSubmit={salvar} className="surface-card space-y-3 p-4">
        <h2 className="font-display text-lg">Editar ensaio da semana</h2>
        <p className="text-xs text-soft">Será salvo como alteração de {nome}.</p>
        {(
          [
            ["titulo", "Louvor da semana"],
            ["artista", "Artista / versão"],
            ["tom", "Tom"],
            ["link", "Referência (link do vídeo/áudio)"],
          ] as const
        ).map(([campo, label]) => (
          <input
            key={campo}
            value={form[campo]}
            onChange={(ev) => setForm({ ...form, [campo]: ev.target.value })}
            placeholder={label}
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        ))}
        <input
          value={form.solistas}
          onChange={(ev) => setForm({ ...form, solistas: ev.target.value })}
          placeholder="Solistas / ministros (separados por vírgula)"
          className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div>
          <label className="text-xs font-semibold text-soft">
            Letra com as partes — uma por linha: Quem canta | trecho | marcação (opcional)
          </label>
          <textarea
            value={form.partes}
            onChange={(ev) => setForm({ ...form, partes: ev.target.value })}
            rows={7}
            className="mt-1 w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <textarea
          value={form.observacoes}
          onChange={(ev) => setForm({ ...form, observacoes: ev.target.value })}
          rows={3}
          placeholder="Observações de dinâmica (uma por linha)"
          className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <div className="flex gap-2">
          <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            Salvar ensaio
          </button>
          <button
            type="button"
            onClick={() => setEditando(false)}
            className="rounded-xl border border-border px-4 text-sm font-semibold"
          >
            Cancelar
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-4">
      {lider ? (
        <button
          onClick={() => setEditando(true)}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Pencil className="size-4" /> Editar ensaio
        </button>
      ) : null}
      {autor ? (
        <p className="rounded-xl border border-primary/50 p-3 text-xs text-primary">
          Última atualização por {autor}.
        </p>
      ) : null}
      <div className="surface-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-soft">Louvor da semana</p>
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
      </div>

      <div className="surface-card p-4">
        <h3 className="font-display text-lg">Solistas / ministros</h3>
        <ul className="mt-2 flex flex-wrap gap-2">
          {e.solistas.map((s) => (
            <li key={s} className="rounded-full border border-border px-3 py-1 text-xs">
              {s}
            </li>
          ))}
        </ul>
      </div>

      <div className="surface-card p-4">
        <h3 className="font-display text-lg">Letra com as partes</h3>
        <div className="mt-3 space-y-3">
          {e.partes.map((p, i) => (
            <div key={i} className="border-l-2 border-primary/60 pl-3">
              <p className="text-xs font-semibold text-primary">{p.quem}</p>
              <p className="text-sm">{p.texto}</p>
              {p.marcacao ? <p className="mt-0.5 text-[11px] italic text-soft">▸ {p.marcacao}</p> : null}
            </div>
          ))}
        </div>
      </div>

      {e.observacoes?.length ? (
        <div className="surface-card p-4">
          <h3 className="font-display text-lg">Observações de dinâmica</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-soft">
            {e.observacoes.map((o) => (
              <li key={o}>{o}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

/* ---------- Oração ---------- */
function OracaoView({ c }: { c: MinisterioConteudo }) {
  const { perfil, permissao } = usePerfil();
  const nome = perfil?.nome ?? usuarioAtual.nome;
  const lider = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  const [lista, setLista] = useState(c.oracao.checkins);
  const [texto, setTexto] = useState("");
  const [editando, setEditando] = useState<number | null>(null);

  return (
    <div className="space-y-4">
      <div className="surface-card border-primary/40 p-4">
        <p className="text-xs font-semibold text-primary">Propósito da semana</p>
        <p className="mt-1 text-sm">{c.oracao.proposito}</p>
      </div>

      <form
        className="surface-card p-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!texto.trim()) return;
          if (editando !== null) {
            setLista((l) => l.map((p, i) => (i === editando ? { ...p, texto: texto.trim() } : p)));
            setEditando(null);
          } else {
            setLista((l) => [{ autor: nome, texto: texto.trim(), quando: "agora" }, ...l]);
          }
          setTexto("");
        }}
      >
        <h3 className="font-display text-lg">Check-in de oração</h3>
        <p className="text-xs text-soft">Identificado como {nome} — sem anonimato.</p>
        <textarea
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          rows={3}
          placeholder="Compartilhe sua intenção ou pedido…"
          className="mt-3 w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
          {editando !== null ? "Salvar alteração" : "Registrar"}
        </button>
      </form>

      <div className="space-y-3">
        {lista.map((p, i) => (
          <div key={i} className="surface-card p-4">
            <p className="text-sm">{p.texto}</p>
            <p className="mt-2 text-xs text-soft">
              {p.autor} · {p.quando}
            </p>
            {lider || p.autor === nome ? (
              <div className="mt-3 flex gap-2 border-t border-border pt-3">
                <AcaoBtn
                  onClick={() => {
                    setEditando(i);
                    setTexto(p.texto);
                  }}
                >
                  <Pencil className="size-3.5" /> Editar
                </AcaoBtn>
                <AcaoBtn
                  perigo
                  onClick={() => {
                    if (window.confirm("Excluir este pedido?"))
                      setLista((l) => l.filter((_, idx) => idx !== i));
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
function RepertorioView({ c }: { c: MinisterioConteudo }) {
  const { permissao } = usePerfil();
  const lider = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  const [abas, setAbas] = useState(c.abas);
  const [aba, setAba] = useState(c.abas[0]?.id ?? "");
  const [aberto, setAberto] = useState<string | null>(null);
  const [avisoAcao, setAvisoAcao] = useState<string | null>(null);
  const [form, setForm] = useState({ titulo: "", artista: "", tom: "", link: "", letra: "" });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const atual = abas.find((a) => a.id === aba) ?? abas[0];
  const ehLouvor = c.slug === "louvor";

  const limpar = () => {
    setForm({ titulo: "", artista: "", tom: "", link: "", letra: "" });
    setEditandoId(null);
    setFormAberto(false);
  };

  const salvar = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.titulo.trim() || !atual) return;
    const dados = {
      titulo: form.titulo.trim(),
      artista: form.artista.trim(),
      tom: form.tom.trim() || "C",
      link: form.link.trim(),
      letra: form.letra.split("\n").filter(Boolean),
    };
    setAbas((all) =>
      all.map((a) =>
        a.id !== atual.id
          ? a
          : {
              ...a,
              louvores: editandoId
                ? a.louvores.map((l) => (l.id === editandoId ? { ...l, ...dados } : l))
                : [...a.louvores, { id: `l${Date.now()}`, ...dados }],
            },
      ),
    );
    limpar();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {abas.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
              a.id === aba
                ? "bg-primary text-primary-foreground"
                : "border border-border text-soft"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      {avisoAcao ? (
        <p className="rounded-xl border border-primary/50 p-3 text-xs text-primary">{avisoAcao}</p>
      ) : null}

      {lider ? (
        formAberto ? (
          <form onSubmit={salvar} className="surface-card space-y-2 p-4">
            <h3 className="font-display text-lg">{editandoId ? "Editar louvor" : "Novo louvor"}</h3>
            {(
              [
                ["titulo", "Título"],
                ["artista", "Artista"],
                ["tom", "Tom"],
                ["link", "Link de referência"],
              ] as const
            ).map(([campo, label]) => (
              <input
                key={campo}
                value={form[campo]}
                onChange={(ev) => setForm({ ...form, [campo]: ev.target.value })}
                placeholder={label}
                className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            ))}
            <textarea
              value={form.letra}
              onChange={(ev) => setForm({ ...form, letra: ev.target.value })}
              rows={4}
              placeholder="Letra (uma linha por verso)"
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
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

      <div className="space-y-3">
        {(atual?.louvores ?? []).map((l) => (

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
                <a
                  href={l.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
                >
                  <ExternalLink className="size-4" /> Ouvir referência
                </a>
                {ehLouvor ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setAvisoAcao(`“${l.titulo}” adicionado automaticamente aos Ensaios.`)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
                    >
                      <Music2 className="size-3.5" /> Enviar para Ensaios
                    </button>
                    <button
                      onClick={() => setAvisoAcao(`“${l.titulo}” registrado na Agenda — culto de sábado.`)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
                    >
                      <CalendarPlus className="size-3.5" /> Registrar sábado
                    </button>
                    <button
                      onClick={() => setAvisoAcao(`“${l.titulo}” registrado na Agenda — culto de domingo.`)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3 py-2 text-xs font-semibold"
                    >
                      <CalendarPlus className="size-3.5" /> Registrar domingo
                    </button>
                  </div>
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
                      onClick={() => {
                        if (!window.confirm(`Excluir “${l.titulo}”?`)) return;
                        setAbas((all) =>
                          all.map((a) =>
                            a.id !== atual?.id
                              ? a
                              : { ...a, louvores: a.louvores.filter((x) => x.id !== l.id) },
                          ),
                        );
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
  const { perfil, permissao } = usePerfil();
  const podePublicar = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  const autor = perfil?.nome ?? "Liderança";
  const [lista, setLista] = useState(c.avisos);
  const [form, setForm] = useState({ titulo: "", texto: "" });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const salvar = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!form.titulo.trim() || !form.texto.trim()) return;
    if (editandoId) {
      setLista((l) =>
        l.map((a) => (a.id === editandoId ? { ...a, titulo: form.titulo, texto: form.texto } : a)),
      );
    } else {
      setLista((l) => [
        {
          id: `a${Date.now()}`,
          titulo: form.titulo.trim(),
          texto: form.texto.trim(),
          autor,
          data: new Date().toLocaleDateString("pt-BR"),
          fixado: false,
        },
        ...l,
      ]);
    }
    setForm({ titulo: "", texto: "" });
    setEditandoId(null);
  };

  return (
    <div className="space-y-3">
      {podePublicar ? (
        <form onSubmit={salvar} className="surface-card space-y-2 p-4">
          <h2 className="font-display text-lg">
            {editandoId ? "Editar aviso" : "Novo aviso do ministério"}
          </h2>
          <input
            value={form.titulo}
            onChange={(ev) => setForm({ ...form, titulo: ev.target.value })}
            placeholder="Título"
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <textarea
            value={form.texto}
            onChange={(ev) => setForm({ ...form, texto: ev.target.value })}
            rows={2}
            placeholder="Mensagem"
            className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
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
      {lista.map((a) => (
        <article key={a.id} className={`surface-card p-4 ${a.fixado ? "border-primary/50" : ""}`}>
          {a.fixado ? (
            <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
              <Pin className="size-3.5" /> Fixado
            </p>
          ) : null}
          <h2 className="font-display text-lg">{a.titulo}</h2>
          <p className="mt-1 text-sm">{a.texto}</p>
          <p className="mt-2 text-xs text-soft">
            {a.autor} · {a.data}
          </p>
          {podePublicar ? (
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
                onClick={() =>
                  setLista((l) => l.map((x) => (x.id === a.id ? { ...x, fixado: !x.fixado } : x)))
                }
              >
                <Pin className="size-3.5" /> {a.fixado ? "Desafixar" : "Fixar"}
              </AcaoBtn>
              <AcaoBtn
                perigo
                onClick={() => {
                  if (window.confirm("Excluir este aviso?"))
                    setLista((l) => l.filter((x) => x.id !== a.id));
                }}
              >
                <Trash2 className="size-3.5" /> Excluir
              </AcaoBtn>
            </div>
          ) : null}
        </article>
      ))}
      {lista.length === 0 ? <p className="text-sm text-soft">Nenhum aviso publicado.</p> : null}
    </div>
  );
}


/* ---------- Estudo mensal (só Jovens) ---------- */
function EstudoView({ c }: { c: MinisterioConteudo }) {
  const { perfil, permissao } = usePerfil();
  const nome = perfil?.nome ?? usuarioAtual.nome;
  const cargo = perfil?.cargo ?? "Membro";
  const mesesBase = c.estudo ?? [];
  const [mesesState, setMesesState] = useState(mesesBase);
  const [sel, setSel] = useState(mesesBase[mesesBase.length - 1]?.id);
  const [pergunta, setPergunta] = useState("");
  const [mural, setMural] = useState(mesesBase.find((m) => m.id === sel)?.mural ?? []);
  const [editandoMes, setEditandoMes] = useState<{ id: string; resumo: string; curiosidades: string } | null>(null);
  const mes = mesesState.find((m) => m.id === sel);
  const podeEditar =
    podeEditarEstudo(cargo) || podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);

  const podeGerir =
    ehSuperAdmin(permissao) || podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  const [estudosDb, setEstudosDb] = useState<
    { id: string; mes: string; titulo: string; conteudo: string; autor_nome: string }[]
  >([]);
  const carregarEstudos = () => {
    void (async () => {
      const { data } = await (supabase.from as (t: string) => ReturnType<typeof supabase.from>)(
        "estudos_mensais",
      )
        .select("id,mes,titulo,conteudo,autor_nome")
        .eq("ministerio_slug", c.slug)
        .order("created_at", { ascending: false });
      setEstudosDb((data as typeof estudosDb | null) ?? []);
    })();
  };
  useEffect(carregarEstudos, [c.slug]);

  const novoEstudo = async () => {
    const mesTxt = window.prompt("Mês do estudo (ex.: Setembro/2026):");
    if (!mesTxt?.trim()) return;
    const titulo = window.prompt("Título do estudo:");
    if (!titulo?.trim()) return;
    const conteudo = window.prompt("Conteúdo do estudo:");
    if (!conteudo?.trim()) return;
    await (supabase.from as (t: string) => ReturnType<typeof supabase.from>)(
      "estudos_mensais",
    ).insert({
      ministerio_slug: c.slug,
      mes: mesTxt.trim(),
      titulo: titulo.trim(),
      conteudo: conteudo.trim(),
      autor_id: perfil?.id ?? null,
      autor_nome: nome,
    } as never);
    carregarEstudos();
  };

  const editarEstudo = async (x: (typeof estudosDb)[number]) => {
    const mesTxt = window.prompt("Mês do estudo:", x.mes);
    if (!mesTxt?.trim()) return;
    const titulo = window.prompt("Título do estudo:", x.titulo);
    if (!titulo?.trim()) return;
    const conteudo = window.prompt("Conteúdo do estudo:", x.conteudo);
    if (!conteudo?.trim()) return;
    await (supabase.from as (t: string) => ReturnType<typeof supabase.from>)("estudos_mensais")
      .update({ mes: mesTxt.trim(), titulo: titulo.trim(), conteudo: conteudo.trim() } as never)
      .eq("id", x.id);
    carregarEstudos();
  };

  const excluirEstudo = async (x: (typeof estudosDb)[number]) => {
    if (!window.confirm(`Excluir o estudo "${x.titulo}"?`)) return;
    await (supabase.from as (t: string) => ReturnType<typeof supabase.from>)("estudos_mensais")
      .delete()
      .eq("id", x.id);
    carregarEstudos();
  };

  return (
    <div className="space-y-4">
      {podeGerir ? (
        <button
          type="button"
          onClick={() => void novoEstudo()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          <Plus className="size-4" /> Novo
        </button>
      ) : null}

      {estudosDb.map((x) => (
        <article key={x.id} className="surface-card p-4">
          <p className="text-xs font-semibold text-primary">📅 {x.mes}</p>
          <h2 className="mt-1 font-display text-lg">{x.titulo}</h2>
          <p className="mt-2 text-sm">{x.conteudo}</p>
          <p className="mt-2 text-xs text-soft">Por {x.autor_nome}</p>
          {podeGerir ? (
            <div className="mt-3 flex gap-2">
              <AcaoBtn onClick={() => void editarEstudo(x)}>
                <Pencil className="size-3.5" /> Editar
              </AcaoBtn>
              <AcaoBtn perigo onClick={() => void excluirEstudo(x)}>
                <Trash2 className="size-3.5" /> Excluir
              </AcaoBtn>
            </div>
          ) : null}
        </article>
      ))}
      <div className="flex gap-2 overflow-x-auto">
        {mesesState.map((m) => (
          <button
            key={m.id}
            onClick={() => {
              setSel(m.id);
              setMural(m.mural);
            }}
            className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-semibold ${
              m.id === sel ? "bg-primary text-primary-foreground" : "border border-border text-soft"
            }`}
          >
            📅 {m.mes} — {m.livro}
          </button>
        ))}
      </div>

      <p className="rounded-xl border border-primary/50 p-3 text-xs text-primary">
        {podeEditar
          ? "Você é liderança: pode criar e editar o estudo e responder o mural."
          : "🔒 Somente Pastor, Presbítero, Admin e Fundador criam ou editam o estudo. Você pode ler e perguntar."}
      </p>

      {mes ? (
        <>
          <div className="surface-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="font-display text-xl">📝 Resumo — {mes.livro}</h2>
                <p className="mt-2 text-sm">{mes.resumo}</p>
              </div>
              {podeGerir ? (
                <div className="flex shrink-0 gap-2">
                  <AcaoBtn
                    onClick={() =>
                      setEditandoMes({
                        id: mes.id,
                        resumo: mes.resumo,
                        curiosidades: mes.curiosidades.join("\n"),
                      })
                    }
                  >
                    <Pencil className="size-3.5" /> Editar
                  </AcaoBtn>
                  <AcaoBtn
                    perigo
                    onClick={() => {
                      if (window.confirm(`Excluir o estudo de ${mes.mes}?`)) {
                        const restante = mesesState.filter((m) => m.id !== mes.id);
                        setMesesState(restante);
                        setSel(restante[restante.length - 1]?.id);
                      }
                    }}
                  >
                    <Trash2 className="size-3.5" /> Excluir
                  </AcaoBtn>
                </div>
              ) : null}
            </div>
          </div>

          <div className="surface-card p-4">
            <h2 className="font-display text-xl">💡 Curiosidades</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-soft">
              {mes.curiosidades.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </div>
        </>
      ) : null}

      {editandoMes ? (
        <form
          onSubmit={(ev) => {
            ev.preventDefault();
            setMesesState((ms) =>
              ms.map((m) =>
                m.id === editandoMes.id
                  ? {
                      ...m,
                      resumo: editandoMes.resumo.trim(),
                      curiosidades: editandoMes.curiosidades
                        .split("\n")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    }
                  : m,
              ),
            );
            setEditandoMes(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
        >
          <div className="w-full max-w-md space-y-3 rounded-2xl bg-background p-4 shadow-xl">
            <h2 className="font-display text-lg">Editar resumo do estudo</h2>
            <div>
              <label className="text-xs font-semibold text-soft">Resumo</label>
              <textarea
                value={editandoMes.resumo}
                onChange={(ev) => setEditandoMes({ ...editandoMes, resumo: ev.target.value })}
                rows={4}
                className="mt-1 w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-soft">Curiosidades (uma por linha)</label>
              <textarea
                value={editandoMes.curiosidades}
                onChange={(ev) => setEditandoMes({ ...editandoMes, curiosidades: ev.target.value })}
                rows={4}
                className="mt-1 w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex gap-2">
              <button className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
                Salvar
              </button>
              <button
                type="button"
                onClick={() => setEditandoMes(null)}
                className="rounded-xl border border-border px-4 text-sm font-semibold"
              >
                Cancelar
              </button>
            </div>
          </div>
        </form>
      ) : null}

      <div className="surface-card p-4">
        <h2 className="font-display text-xl">💬 Mural de dúvidas</h2>
        <form
          className="mt-3"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!pergunta.trim()) return;
            setMural((m) => [{ autor: nome, papel: cargo, texto: pergunta.trim() }, ...m]);
            setPergunta("");
          }}
        >
          <textarea
            value={pergunta}
            onChange={(ev) => setPergunta(ev.target.value)}
            rows={2}
            placeholder="Sua pergunta sobre o livro…"
            className="w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
          <button className="mt-2 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
            Perguntar como {nome}
          </button>
        </form>

        <div className="mt-4 space-y-3">
          {mural.map((q, i) => (
            <div key={i} className="rounded-xl border border-border p-3">
              <p className="text-xs font-semibold text-primary">
                {q.autor} · {q.papel}
              </p>
              <p className="mt-1 text-sm">{q.texto}</p>
              {q.resposta ? (
                <div className="mt-2 border-l-2 border-primary/60 pl-3">
                  <p className="text-xs font-semibold">{q.resposta.autor} respondeu</p>
                  <p className="text-sm">{q.resposta.texto}</p>
                </div>
              ) : null}
              <div className="mt-2 flex gap-2">
                {podeEditar ? (
                  <AcaoBtn
                    onClick={() => {
                      const texto = window.prompt("Resposta da liderança:", q.resposta?.texto ?? "");
                      if (!texto?.trim()) return;
                      setMural((m) =>
                        m.map((x, idx) =>
                          idx === i ? { ...x, resposta: { autor: nome, texto: texto.trim() } } : x,
                        ),
                      );
                    }}
                  >
                    <Pencil className="size-3.5" /> Responder
                  </AcaoBtn>
                ) : null}
                {podeEditar || q.autor === nome ? (
                  <AcaoBtn
                    perigo
                    onClick={() => {
                      if (window.confirm("Excluir esta pergunta?"))
                        setMural((m) => m.filter((_, idx) => idx !== i));
                    }}
                  >
                    <Trash2 className="size-3.5" /> Excluir
                  </AcaoBtn>
                ) : null}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

/* ---------- Agenda ---------- */
function AgendaView({ c }: { c: MinisterioConteudo }) {
  const { permissao } = usePerfil();
  const lider = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  const [eventos, setEventos] = useState(c.agenda ?? []);
  const [form, setForm] = useState<{ titulo: string; tipo: "Culto" | "Ensaio" | "Evento"; data: string; hora: string }>({ titulo: "", tipo: "Ensaio", data: "", hora: "" });
  const [formAberto, setFormAberto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const toggle = (idEvento: string, nome: string) =>
    setEventos((evs) =>
      evs.map((e) =>
        e.id === idEvento
          ? {
              ...e,
              presencas: e.presencas.map((p) =>
                p.nome === nome ? { ...p, presente: !p.presente } : p,
              ),
            }
          : e,
      ),
    );

  const nomes = Array.from(new Set(eventos.flatMap((e) => e.presencas.map((p) => p.nome))));
  const pendentes = nomes.filter((n) => {
    const faltas = eventos.map((e) => e.presencas.find((p) => p.nome === n)?.presente);
    for (let i = 0; i < faltas.length - 1; i++) {
      if (faltas[i] === false && faltas[i + 1] === false) return true;
    }
    return false;
  });

  return (
    <div className="space-y-4">
      {c.slug === "jovens" ? (
        <div className="surface-card border-primary/50 p-4">
          <p className="text-xs font-semibold text-primary">⚠️ Regra de frequência</p>
          <p className="mt-1 text-sm">2 faltas seguidas = pendente / pontuado.</p>
          <p className="mt-2 text-xs text-soft">
            {pendentes.length ? `Pendentes: ${pendentes.join(", ")}` : "Nenhum pendente este mês."}
          </p>
        </div>
      ) : null}

      {lider ? (
        formAberto ? (
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!form.titulo.trim()) return;
              if (editandoId) {
                setEventos((evs) =>
                  evs.map((e) => (e.id === editandoId ? { ...e, ...form } : e)),
                );
              } else {
                setEventos((evs) => [
                  ...evs,
                  { id: `ev${Date.now()}`, ...form, presencas: [], louvoresDoDia: [] },
                ]);
              }
              setForm({ titulo: "", tipo: "Ensaio", data: "", hora: "" });
              setEditandoId(null);
              setFormAberto(false);
            }}
            className="surface-card space-y-2 p-4"
          >
            <h3 className="font-display text-lg">{editandoId ? "Editar evento" : "Novo evento"}</h3>
            {(
              [
                ["titulo", "Título"],
                ["tipo", "Tipo"],
                ["data", "Data"],
                ["hora", "Hora"],
              ] as const
            ).map(([campo, label]) => (
              <input
                key={campo}
                value={form[campo]}
                onChange={(ev) => setForm({ ...form, [campo]: ev.target.value as never })}
                placeholder={label}
                className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            ))}
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

      {eventos.map((e) => (

        <div key={e.id} className="surface-card p-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-lg">{e.titulo}</h2>
            <span className="text-xs font-semibold text-primary">{e.tipo}</span>
          </div>
          <p className="text-xs text-soft">
            {e.data} · {e.hora}
          </p>

          {e.louvoresDoDia?.length ? (
            <div className="mt-3 rounded-xl border border-border p-3">
              <p className="text-xs font-semibold text-primary">🎵 Louvores do dia</p>
              <ul className="mt-1 space-y-1 text-sm">
                {e.louvoresDoDia.map((l) => (
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

          <p className="mt-3 text-xs font-semibold text-soft">Lista de presença</p>
          <ul className="mt-1 space-y-1.5">
            {e.presencas.map((p) => (
              <li key={p.nome} className="flex items-center justify-between gap-2">
                <span className="text-sm">{p.nome}</span>
                <button
                  onClick={() => toggle(e.id, p.nome)}
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
          {lider ? (
            <div className="mt-3 flex gap-2 border-t border-border pt-3">
              <AcaoBtn
                onClick={() => {
                  setEditandoId(e.id);
                  setFormAberto(true);
                  setForm({ titulo: e.titulo, tipo: e.tipo, data: e.data, hora: e.hora });
                }}
              >
                <Pencil className="size-3.5" /> Editar
              </AcaoBtn>
              <AcaoBtn
                perigo
                onClick={() => {
                  if (window.confirm(`Excluir “${e.titulo}”?`))
                    setEventos((evs) => evs.filter((x) => x.id !== e.id));
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
  const { perfil, permissao } = usePerfil();
  const nome = perfil?.nome ?? usuarioAtual.nome;
  const lider = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  const [visitas, setVisitas] = useState(c.visitas ?? []);
  const [form, setForm] = useState({ nome: "", endereco: "", data: "", hora: "", irmas: "" });
  const [editandoId, setEditandoId] = useState<string | null>(null);

  const agendadas = visitas.filter((v) => !v.realizada);
  const historico = visitas.filter((v) => v.realizada);

  return (
    <div className="space-y-4">
      <form
        className="surface-card space-y-2 p-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!form.nome.trim() || !form.data) return;
          const dados = {
            nome: form.nome,
            endereco: form.endereco,
            data: form.data,
            hora: form.hora || "—",
            irmas: form.irmas ? form.irmas.split(",").map((s) => s.trim()) : [nome],
          };
          if (editandoId) {
            setVisitas((v) => v.map((x) => (x.id === editandoId ? { ...x, ...dados } : x)));
            setEditandoId(null);
          } else {
            setVisitas((v) => [...v, { id: `v${Date.now()}`, ...dados, realizada: false }]);
          }
          setForm({ nome: "", endereco: "", data: "", hora: "", irmas: "" });
        }}
      >
        <h2 className="font-display text-lg">
          {editandoId ? "Editar visita" : "Agendar visita"}
        </h2>

        {(
          [
            ["nome", "Nome da pessoa a visitar", "text"],
            ["endereco", "Endereço", "text"],
            ["data", "Data", "date"],
            ["hora", "Horário", "time"],
            ["irmas", "Irmãs escaladas (separe por vírgula)", "text"],
          ] as const
        ).map(([campo, label, tipo]) => (
          <label key={campo} className="block">
            <span className="text-xs text-soft">{label}</span>
            <input
              type={tipo}
              value={form[campo]}
              onChange={(ev) => setForm({ ...form, [campo]: ev.target.value })}
              className="mt-1 w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
            />
          </label>
        ))}
        <button className="w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
          Agendar
        </button>
      </form>

      <section>
        <h2 className="mb-2 font-display text-lg">Próximas visitas</h2>
        <div className="space-y-3">
          {agendadas.map((v) => (
            <div key={v.id} className="surface-card p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-semibold">{v.nome}</h3>
                <span className="text-xs font-semibold text-primary">
                  {v.data} · {v.hora}
                </span>
              </div>
              <p className="text-xs text-soft">{v.endereco}</p>
              <p className="mt-2 text-xs">Irmãs: {v.irmas.join(" e ")}</p>
              <button
                onClick={() =>
                  setVisitas((all) =>
                    all.map((x) => (x.id === v.id ? { ...x, realizada: true } : x)),
                  )
                }
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
                        data: v.data,
                        hora: v.hora,
                        irmas: v.irmas.join(", "),
                      });
                    }}
                  >
                    <Pencil className="size-3.5" /> Editar
                  </AcaoBtn>
                  <AcaoBtn
                    perigo
                    onClick={() => {
                      if (window.confirm(`Excluir a visita a ${v.nome}?`))
                        setVisitas((all) => all.filter((x) => x.id !== v.id));
                    }}
                  >
                    <Trash2 className="size-3.5" /> Excluir
                  </AcaoBtn>
                </div>
              ) : null}
            </div>

          ))}
          {agendadas.length === 0 ? (
            <p className="text-sm text-soft">Nenhuma visita agendada.</p>
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
                {v.data} · {v.irmas.join(" e ")}
              </p>
            </div>
          ))}
          {historico.length === 0 ? (
            <p className="text-sm text-soft">Ainda sem visitas realizadas.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

/* ---------- Cifras (só Louvor) ---------- */
function CifrasView({ c }: { c: MinisterioConteudo }) {
  const { permissao } = usePerfil();
  const lider = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  const [cifras, setCifras] = useState(c.cifras ?? []);
  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [form, setForm] = useState({ titulo: "", artista: "", tom: "", corpo: "" });
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const aberta = cifras.find((x) => x.id === abertaId);

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
          <form
            onSubmit={(ev) => {
              ev.preventDefault();
              if (!form.titulo.trim()) return;
              const dados = {
                titulo: form.titulo.trim(),
                artista: form.artista.trim(),
                tom: form.tom.trim() || "C",
                linhas: form.corpo.split("\n").map((linha) => {
                  const [acordes, ...resto] = linha.split("|");
                  return resto.length
                    ? { acordes: (acordes ?? "").trim(), letra: resto.join("|").trim() }
                    : { acordes: "", letra: linha };
                }),
              };
              if (editandoId) {
                setCifras((all) =>
                  all.map((x) => (x.id === editandoId ? { ...x, ...dados } : x)),
                );
                setEditandoId(null);
              } else {
                setCifras((all) => [...all, { id: `cf${Date.now()}`, ...dados }]);
              }
              setForm({ titulo: "", artista: "", tom: "", corpo: "" });
              setFormAberto(false);
            }}
            className="surface-card space-y-2 p-4"
          >
            <h3 className="font-display text-lg">{editandoId ? "Editar cifra" : "Nova cifra"}</h3>
            {(
              [
                ["titulo", "Título"],
                ["artista", "Artista"],
                ["tom", "Tom"],
              ] as const
            ).map(([campo, label]) => (
              <input
                key={campo}
                value={form[campo]}
                onChange={(ev) => setForm({ ...form, [campo]: ev.target.value })}
                placeholder={label}
                className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              />
            ))}
            <textarea
              value={form.corpo}
              onChange={(ev) => setForm({ ...form, corpo: ev.target.value })}
              rows={5}
              placeholder="Uma linha por verso. Use: acordes | letra"
              className="w-full rounded-xl border border-border bg-transparent px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
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
            <Plus className="size-4" /> Adicionar cifra
          </button>
        )
      ) : null}

      {cifras.map((cf) => (
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
                    corpo: cf.linhas.map((l) => (l.acordes ? `${l.acordes} | ${l.letra}` : l.letra)).join("\n"),
                  });
                }}
              >
                <Pencil className="size-3.5" /> Editar
              </AcaoBtn>
              <AcaoBtn
                perigo
                onClick={() => {
                  if (window.confirm(`Excluir “${cf.titulo}”?`))
                    setCifras((all) => all.filter((x) => x.id !== cf.id));
                }}
              >
                <Trash2 className="size-3.5" /> Excluir
              </AcaoBtn>
            </div>
          ) : null}
        </div>
      ))}
      {cifras.length === 0 ? <p className="text-sm text-soft">Nenhuma cifra cadastrada.</p> : null}

    </div>
  );
}
