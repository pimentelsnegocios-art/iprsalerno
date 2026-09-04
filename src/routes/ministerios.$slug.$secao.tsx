import { createFileRoute, notFound } from "@tanstack/react-router";
import { CalendarPlus, ExternalLink, Music2, Pin } from "lucide-react";
import { useState } from "react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { CifraViewer } from "@/components/CifraViewer";
import { usuarioAtual } from "@/lib/church-data";
import { usePerfil } from "@/hooks/usePerfil";
import {
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

/* ---------- Ensaio ---------- */
function EnsaioView({ c }: { c: MinisterioConteudo }) {
  const e = c.ensaio;
  return (
    <div className="space-y-4">
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
        <a
          href={e.link}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary"
        >
          <ExternalLink className="size-4" /> Referência (vídeo/áudio)
        </a>
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
  const [lista, setLista] = useState(c.oracao.checkins);
  const [texto, setTexto] = useState("");

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
          setLista((l) => [
            { autor: usuarioAtual.nome, texto: texto.trim(), quando: "agora" },
            ...l,
          ]);
          setTexto("");
        }}
      >
        <h3 className="font-display text-lg">Check-in de oração</h3>
        <p className="text-xs text-soft">Identificado como {usuarioAtual.nome} — sem anonimato.</p>
        <textarea
          value={texto}
          onChange={(ev) => setTexto(ev.target.value)}
          rows={3}
          placeholder="Compartilhe sua intenção ou pedido…"
          className="mt-3 w-full rounded-xl border border-border bg-transparent p-3 text-sm outline-none focus:ring-2 focus:ring-ring"
        />
        <button className="mt-3 w-full rounded-xl bg-primary py-2.5 text-sm font-semibold text-primary-foreground">
          Registrar
        </button>
      </form>

      <div className="space-y-3">
        {lista.map((p, i) => (
          <div key={i} className="surface-card p-4">
            <p className="text-sm">{p.texto}</p>
            <p className="mt-2 text-xs text-soft">
              {p.autor} · {p.quando}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Repertório / Letras ---------- */
function RepertorioView({ c }: { c: MinisterioConteudo }) {
  const [aba, setAba] = useState(c.abas[0]?.id ?? "");
  const [aberto, setAberto] = useState<string | null>(null);
  const [avisoAcao, setAvisoAcao] = useState<string | null>(null);
  const atual = c.abas.find((a) => a.id === aba) ?? c.abas[0];
  const ehLouvor = c.slug === "louvor";

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {c.abas.map((a) => (
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
  const { permissao } = usePerfil();
  const podePublicar = podeAdministrarMinisterio(permissao, c.slug as SlugMinisterio);
  return (
    <div className="space-y-3">
      {podePublicar ? (
        <p className="rounded-xl border border-primary/50 p-3 text-xs text-primary">
          Você pode publicar e fixar avisos deste ministério.
        </p>
      ) : null}
      {c.avisos.map((a) => (
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
        </article>
      ))}
    </div>
  );
}

/* ---------- Estudo mensal (só Jovens) ---------- */
function EstudoView({ c }: { c: MinisterioConteudo }) {
  const meses = c.estudo ?? [];
  const [sel, setSel] = useState(meses[meses.length - 1]?.id);
  const [pergunta, setPergunta] = useState("");
  const [mural, setMural] = useState(meses.find((m) => m.id === sel)?.mural ?? []);
  const mes = meses.find((m) => m.id === sel);
  const podeEditar = podeEditarEstudo(usuarioAtual.cargo);

  if (!mes) return <p className="text-sm text-soft">Nenhum estudo publicado ainda.</p>;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto">
        {meses.map((m) => (
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

      <div className="surface-card p-4">
        <h2 className="font-display text-xl">📝 Resumo — {mes.livro}</h2>
        <p className="mt-2 text-sm">{mes.resumo}</p>
      </div>

      <div className="surface-card p-4">
        <h2 className="font-display text-xl">💡 Curiosidades</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-soft">
          {mes.curiosidades.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </div>

      <div className="surface-card p-4">
        <h2 className="font-display text-xl">💬 Mural de dúvidas</h2>
        <form
          className="mt-3"
          onSubmit={(ev) => {
            ev.preventDefault();
            if (!pergunta.trim()) return;
            setMural((m) => [
              { autor: usuarioAtual.nome, papel: usuarioAtual.cargo, texto: pergunta.trim() },
              ...m,
            ]);
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
            Perguntar como {usuarioAtual.nome}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Agenda ---------- */
function AgendaView({ c }: { c: MinisterioConteudo }) {
  const [eventos, setEventos] = useState(c.agenda ?? []);
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
        </div>
      ))}
    </div>
  );
}

/* ---------- Visitas (só Irmãs) ---------- */
function VisitasView({ c }: { c: MinisterioConteudo }) {
  const [visitas, setVisitas] = useState(c.visitas ?? []);
  const [form, setForm] = useState({ nome: "", endereco: "", data: "", hora: "", irmas: "" });

  const agendadas = visitas.filter((v) => !v.realizada);
  const historico = visitas.filter((v) => v.realizada);

  return (
    <div className="space-y-4">
      <form
        className="surface-card space-y-2 p-4"
        onSubmit={(ev) => {
          ev.preventDefault();
          if (!form.nome.trim() || !form.data) return;
          setVisitas((v) => [
            ...v,
            {
              id: `v${Date.now()}`,
              nome: form.nome,
              endereco: form.endereco,
              data: form.data,
              hora: form.hora || "—",
              irmas: form.irmas ? form.irmas.split(",").map((s) => s.trim()) : [usuarioAtual.nome],
              realizada: false,
            },
          ]);
          setForm({ nome: "", endereco: "", data: "", hora: "", irmas: "" });
        }}
      >
        <h2 className="font-display text-lg">Agendar visita</h2>
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
  const cifras = c.cifras ?? [];
  const [abertaId, setAbertaId] = useState<string | null>(null);
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
      {cifras.map((cf) => (
        <button
          key={cf.id}
          onClick={() => setAbertaId(cf.id)}
          className="surface-card flex w-full items-center justify-between gap-3 p-4 text-left transition-transform active:scale-[0.98]"
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
      ))}
      {cifras.length === 0 ? <p className="text-sm text-soft">Nenhuma cifra cadastrada.</p> : null}
    </div>
  );
}
