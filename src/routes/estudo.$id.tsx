import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Bookmark,
  BookOpen,
  ChevronDown,
  EyeOff,
  Flag,
  Heart,
  Lightbulb,
  MessageCircle,
  Pencil,
  Plus,
  Star,
  Trash2,
} from "lucide-react";

import { AppShell, BackButton } from "@/components/AppShell";
import { RichTextEditor, RichTextView } from "@/components/RichTextEditor";
import { appConfirm, appPrompt } from "@/components/ui/AppDialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { usePerfil } from "@/hooks/usePerfil";
import { supabase } from "@/integrations/supabase/client";
import {
  abrirNaBiblia,
  buscarEstudo,
  CATEGORIAS,
  formatarData,
  listarCuriosidades,
  listarPerguntas,
  listarReferencias,
  ordenarPerguntas,
  ORDENS,
  podeGerirCategoria,
  registrarModeracao,
  rotuloReferencia,
  type Curiosidade,
  type Estudo,
  type OrdemPerguntas,
  type Pergunta,
  type Referencia,
  type Resposta,
} from "@/lib/estudos-biblicos";

export const Route = createFileRoute("/estudo/$id")({
  head: () => ({
    meta: [
      { title: "Estudo Bíblico — IPRB Renovada" },
      {
        name: "description",
        content: "Leia o estudo completo, veja curiosidades, referências e participe do mural de dúvidas.",
      },
      { property: "og:title", content: "Estudo Bíblico — IPRB Renovada" },
      { property: "og:description", content: "Estudo bíblico da IPRB Renovada." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: LeituraEstudo,
});

const LIMITE_CURIOSIDADES = 3;

function Avatar({ url, nome }: { url: string | null; nome: string }) {
  return url ? (
    <img src={url} alt="" className="size-9 shrink-0 rounded-full object-cover" />
  ) : (
    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
      {(nome || "?").charAt(0).toUpperCase()}
    </span>
  );
}

function LeituraEstudo() {
  const { id } = Route.useParams();
  const { perfil, permissao } = usePerfil();
  const [estudo, setEstudo] = useState<Estudo | null>(null);
  const gestor = podeGerirCategoria(permissao, estudo?.categoria ?? "geral");
  const meuId = perfil?.id ?? null;

  const [curiosidades, setCuriosidades] = useState<Curiosidade[]>([]);
  const [referencias, setReferencias] = useState<Referencia[]>([]);
  const [perguntas, setPerguntas] = useState<Pergunta[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [verTodasCuriosidades, setVerTodas] = useState(false);
  const [refAberta, setRefAberta] = useState<Referencia | null>(null);
  const [ordem, setOrdem] = useState<OrdemPerguntas>("relevantes");
  const [novaPergunta, setNovaPergunta] = useState("");
  const [respondendo, setRespondendo] = useState<string | null>(null);
  const [textoResposta, setTextoResposta] = useState("");
  const [salvo, setSalvo] = useState(false);
  const [editando, setEditando] = useState(false);
  const [form, setForm] = useState({ titulo: "", subtitulo: "", conteudo: "" });

  const recarregarPerguntas = useCallback(async () => {
    setPerguntas(await listarPerguntas(id, meuId));
  }, [id, meuId]);

  useEffect(() => {
    let ativo = true;
    void (async () => {
      const [e, c, r] = await Promise.all([
        buscarEstudo(id),
        listarCuriosidades(id),
        listarReferencias(id),
      ]);
      const p = await listarPerguntas(id, meuId);
      if (!ativo) return;
      setEstudo(e);
      setCuriosidades(c);
      setReferencias(r);
      setPerguntas(p);
      setCarregando(false);
    })();
    return () => {
      ativo = false;
    };
  }, [id, meuId]);

  useEffect(() => {
    if (!meuId) return;
    void (async () => {
      const { data } = await supabase
        .from("estudo_salvos")
        .select("estudo_id")
        .eq("estudo_id", id)
        .eq("user_id", meuId)
        .maybeSingle();
      setSalvo(!!data);
    })();
  }, [id, meuId]);

  /* ---------------------------- Estudo ---------------------------- */

  const abrirEdicao = () => {
    if (!estudo) return;
    setForm({
      titulo: estudo.titulo,
      subtitulo: estudo.subtitulo,
      conteudo: estudo.conteudo_html,
    });
    setEditando(true);
  };

  const salvarEstudo = async () => {
    if (!estudo || !form.titulo.trim()) return;
    await supabase
      .from("estudos")
      .update({
        titulo: form.titulo.trim(),
        subtitulo: form.subtitulo.trim(),
        conteudo_html: form.conteudo,
      })
      .eq("id", estudo.id);
    setEstudo({
      ...estudo,
      titulo: form.titulo.trim(),
      subtitulo: form.subtitulo.trim(),
      conteudo_html: form.conteudo,
    });
    setEditando(false);
  };

  const excluirEstudo = async () => {
    if (!estudo) return;
    if (!(await appConfirm(`Excluir definitivamente o estudo "${estudo.titulo}"?`))) return;
    await supabase.from("estudos").delete().eq("id", estudo.id);
    window.history.back();
  };

  const alternarSalvo = async () => {
    if (!meuId) return;
    if (salvo) {
      await supabase.from("estudo_salvos").delete().eq("estudo_id", id).eq("user_id", meuId);
      setSalvo(false);
    } else {
      await supabase.from("estudo_salvos").insert({ estudo_id: id, user_id: meuId });
      setSalvo(true);
    }
  };

  /* -------------------------- Curiosidades -------------------------- */

  const novaCuriosidade = async () => {
    const titulo = await appPrompt("Título da curiosidade:", "Você sabia?");
    if (!titulo?.trim()) return;
    const conteudo = await appPrompt("Conteúdo da curiosidade:");
    if (!conteudo?.trim()) return;
    const { data } = await supabase
      .from("estudo_curiosidades")
      .insert({
        estudo_id: id,
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        posicao: curiosidades.length,
      })
      .select("*")
      .maybeSingle();
    if (data) setCuriosidades((l) => [...l, data as Curiosidade]);
  };

  const editarCuriosidade = async (c: Curiosidade) => {
    const titulo = await appPrompt("Título da curiosidade:", c.titulo);
    if (!titulo?.trim()) return;
    const conteudo = await appPrompt("Conteúdo da curiosidade:", c.conteudo);
    if (!conteudo?.trim()) return;
    await supabase
      .from("estudo_curiosidades")
      .update({ titulo: titulo.trim(), conteudo: conteudo.trim() })
      .eq("id", c.id);
    setCuriosidades((l) =>
      l.map((x) => (x.id === c.id ? { ...x, titulo: titulo.trim(), conteudo: conteudo.trim() } : x)),
    );
  };

  const excluirCuriosidade = async (c: Curiosidade) => {
    if (!(await appConfirm(`Excluir a curiosidade "${c.titulo}"?`))) return;
    await supabase.from("estudo_curiosidades").delete().eq("id", c.id);
    setCuriosidades((l) => l.filter((x) => x.id !== c.id));
  };

  const moverCuriosidade = async (indice: number, direcao: -1 | 1) => {
    const destino = indice + direcao;
    if (destino < 0 || destino >= curiosidades.length) return;
    const nova = [...curiosidades];
    const a = nova[indice];
    const b = nova[destino];
    if (!a || !b) return;
    nova[indice] = b;
    nova[destino] = a;
    setCuriosidades(nova.map((c, i) => ({ ...c, posicao: i })));
    await Promise.all(
      nova.map((c, i) => supabase.from("estudo_curiosidades").update({ posicao: i }).eq("id", c.id)),
    );
  };

  /* --------------------------- Referências --------------------------- */

  const novaReferencia = async () => {
    const livro = await appPrompt("Livro (ex.: João):");
    if (!livro?.trim()) return;
    const capitulo = await appPrompt("Capítulo:", "1");
    const inicio = await appPrompt("Versículo inicial:", "1");
    const fim = await appPrompt("Versículo final (opcional):", "");
    const descricao = await appPrompt("Descrição (opcional):", "");
    const { data } = await supabase
      .from("estudo_referencias")
      .insert({
        estudo_id: id,
        livro: livro.trim(),
        capitulo: Number(capitulo) || 1,
        versiculo_inicio: Number(inicio) || 1,
        versiculo_fim: fim && Number(fim) ? Number(fim) : null,
        descricao: (descricao ?? "").trim(),
        posicao: referencias.length,
      })
      .select("*")
      .maybeSingle();
    if (data) setReferencias((l) => [...l, data as Referencia]);
  };

  const editarReferencia = async (r: Referencia) => {
    const livro = await appPrompt("Livro:", r.livro);
    if (!livro?.trim()) return;
    const capitulo = await appPrompt("Capítulo:", String(r.capitulo));
    const inicio = await appPrompt("Versículo inicial:", String(r.versiculo_inicio));
    const fim = await appPrompt("Versículo final (opcional):", r.versiculo_fim ? String(r.versiculo_fim) : "");
    const descricao = await appPrompt("Descrição (opcional):", r.descricao);
    const patch = {
      livro: livro.trim(),
      capitulo: Number(capitulo) || 1,
      versiculo_inicio: Number(inicio) || 1,
      versiculo_fim: fim && Number(fim) ? Number(fim) : null,
      descricao: (descricao ?? "").trim(),
    };
    await supabase.from("estudo_referencias").update(patch).eq("id", r.id);
    setReferencias((l) => l.map((x) => (x.id === r.id ? { ...x, ...patch } : x)));
  };

  const excluirReferencia = async (r: Referencia) => {
    if (!(await appConfirm(`Excluir a referência ${rotuloReferencia(r)}?`))) return;
    await supabase.from("estudo_referencias").delete().eq("id", r.id);
    setReferencias((l) => l.filter((x) => x.id !== r.id));
  };

  /* ------------------------ Perguntas e respostas ------------------------ */

  const publicarPergunta = async () => {
    if (!perfil || !novaPergunta.trim()) return;
    await supabase.from("estudo_perguntas").insert({
      estudo_id: id,
      autor_id: perfil.id,
      autor_nome: perfil.nome,
      conteudo: novaPergunta.trim(),
    });
    setNovaPergunta("");
    await recarregarPerguntas();
  };

  const publicarResposta = async (perguntaId: string) => {
    if (!perfil || !textoResposta.trim()) return;
    await supabase.from("estudo_respostas").insert({
      pergunta_id: perguntaId,
      autor_id: perfil.id,
      autor_nome: perfil.nome,
      conteudo: textoResposta.trim(),
    });
    setTextoResposta("");
    await recarregarPerguntas();
  };

  const curtirPergunta = async (p: Pergunta) => {
    if (!meuId) return;
    if (p.euCurti) {
      await supabase
        .from("estudo_pergunta_curtidas")
        .delete()
        .eq("pergunta_id", p.id)
        .eq("user_id", meuId);
    } else {
      await supabase.from("estudo_pergunta_curtidas").insert({ pergunta_id: p.id, user_id: meuId });
    }
    setPerguntas((l) =>
      l.map((x) =>
        x.id === p.id ? { ...x, euCurti: !x.euCurti, curtidas: x.curtidas + (x.euCurti ? -1 : 1) } : x,
      ),
    );
  };

  const curtirResposta = async (perguntaId: string, r: Resposta) => {
    if (!meuId) return;
    if (r.euCurti) {
      await supabase
        .from("estudo_resposta_curtidas")
        .delete()
        .eq("resposta_id", r.id)
        .eq("user_id", meuId);
    } else {
      await supabase.from("estudo_resposta_curtidas").insert({ resposta_id: r.id, user_id: meuId });
    }
    setPerguntas((l) =>
      l.map((p) =>
        p.id !== perguntaId
          ? p
          : {
              ...p,
              respostas: p.respostas.map((x) =>
                x.id === r.id ? { ...x, euCurti: !x.euCurti, curtidas: x.curtidas + (x.euCurti ? -1 : 1) } : x,
              ),
            },
      ),
    );
  };

  const editarPergunta = async (p: Pergunta) => {
    const texto = await appPrompt("Editar sua pergunta:", p.conteudo);
    if (!texto?.trim()) return;
    await supabase.from("estudo_perguntas").update({ conteudo: texto.trim() }).eq("id", p.id);
    await recarregarPerguntas();
  };

  const excluirPergunta = async (p: Pergunta) => {
    if (!(await appConfirm("Excluir esta pergunta e suas respostas?"))) return;
    await supabase.from("estudo_perguntas").delete().eq("id", p.id);
    if (gestor && perfil && p.autor_id !== perfil.id) {
      await registrarModeracao({
        moderadorId: perfil.id,
        moderadorNome: perfil.nome,
        acao: "remover",
        alvoTipo: "pergunta",
        alvoId: p.id,
        detalhe: p.conteudo.slice(0, 200),
      });
    }
    await recarregarPerguntas();
  };

  const ocultarPergunta = async (p: Pergunta) => {
    if (!perfil) return;
    const novo = p.status === "visivel" ? "oculto" : "visivel";
    await supabase.from("estudo_perguntas").update({ status: novo }).eq("id", p.id);
    await registrarModeracao({
      moderadorId: perfil.id,
      moderadorNome: perfil.nome,
      acao: novo === "oculto" ? "ocultar" : "reexibir",
      alvoTipo: "pergunta",
      alvoId: p.id,
    });
    await recarregarPerguntas();
  };

  const editarResposta = async (r: Resposta) => {
    const texto = await appPrompt("Editar sua resposta:", r.conteudo);
    if (!texto?.trim()) return;
    await supabase.from("estudo_respostas").update({ conteudo: texto.trim() }).eq("id", r.id);
    await recarregarPerguntas();
  };

  const excluirResposta = async (r: Resposta) => {
    if (!(await appConfirm("Excluir esta resposta?"))) return;
    await supabase.from("estudo_respostas").delete().eq("id", r.id);
    if (gestor && perfil && r.autor_id !== perfil.id) {
      await registrarModeracao({
        moderadorId: perfil.id,
        moderadorNome: perfil.nome,
        acao: "remover",
        alvoTipo: "resposta",
        alvoId: r.id,
        detalhe: r.conteudo.slice(0, 200),
      });
    }
    await recarregarPerguntas();
  };

  const ocultarResposta = async (r: Resposta) => {
    if (!perfil) return;
    const novo = r.status === "visivel" ? "oculto" : "visivel";
    await supabase.from("estudo_respostas").update({ status: novo }).eq("id", r.id);
    await registrarModeracao({
      moderadorId: perfil.id,
      moderadorNome: perfil.nome,
      acao: novo === "oculto" ? "ocultar" : "reexibir",
      alvoTipo: "resposta",
      alvoId: r.id,
    });
    await recarregarPerguntas();
  };

  const marcarOficial = async (r: Resposta) => {
    if (!perfil) return;
    await supabase.from("estudo_respostas").update({ oficial: !r.oficial }).eq("id", r.id);
    await registrarModeracao({
      moderadorId: perfil.id,
      moderadorNome: perfil.nome,
      acao: r.oficial ? "remover_oficial" : "marcar_oficial",
      alvoTipo: "resposta",
      alvoId: r.id,
    });
    await recarregarPerguntas();
  };

  const marcarAjudou = async (p: Pergunta, r: Resposta) => {
    await Promise.all(
      p.respostas.map((x) =>
        supabase.from("estudo_respostas").update({ ajudou: x.id === r.id ? !r.ajudou : false }).eq("id", x.id),
      ),
    );
    await recarregarPerguntas();
  };

  const denunciar = async (tipo: "pergunta" | "resposta", alvoId: string) => {
    if (!perfil) return;
    const motivo = await appPrompt("Descreva o problema para a liderança:");
    if (!motivo?.trim()) return;
    await supabase.from("estudo_denuncias").insert({
      alvo_tipo: tipo,
      alvo_id: alvoId,
      autor_id: perfil.id,
      motivo: motivo.trim(),
    });
    await appConfirm("Denúncia enviada à liderança. Obrigado!");
  };

  /* ------------------------------ Render ------------------------------ */

  if (carregando) {
    return (
      <AppShell>
        <div className="space-y-4 px-5 pb-10" style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}>
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-8 w-4/5" />
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </AppShell>
    );
  }

  if (!estudo) {
    return (
      <AppShell>
        <div className="px-5 py-16 text-center" style={{ paddingTop: "calc(4rem + env(safe-area-inset-top))" }}>
          <BackButton className="mb-6" />
          <BookOpen className="mx-auto size-8 text-primary" />
          <p className="mt-2 font-display text-lg">Estudo não encontrado.</p>
          <p className="text-sm text-soft">Ele pode ter sido removido pela liderança.</p>
        </div>
      </AppShell>
    );
  }

  const visiveis = verTodasCuriosidades ? curiosidades : curiosidades.slice(0, LIMITE_CURIOSIDADES);
  const listaPerguntas = ordenarPerguntas(perguntas, ordem);
  const tema = estudo.categoria === "jovens" ? { theme: "jovens" as const } : {};

  return (
    <AppShell {...tema}>
      <header className="header-gradient px-5 pb-6" style={{ paddingTop: "calc(2rem + env(safe-area-inset-top))" }}>
        <div className="flex items-center justify-between">
          <BackButton />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => void alternarSalvo()}
              aria-label={salvo ? "Remover dos salvos" : "Salvar estudo"}
              className="rounded-xl border border-border bg-popover/70 p-2.5 text-primary"
            >
              <Bookmark className={`size-4 ${salvo ? "fill-current" : ""}`} />
            </button>
            {gestor ? (
              <>
                <button
                  type="button"
                  onClick={abrirEdicao}
                  aria-label="Editar estudo"
                  className="rounded-xl border border-border bg-popover/70 p-2.5 text-primary"
                >
                  <Pencil className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void excluirEstudo()}
                  aria-label="Excluir estudo"
                  className="rounded-xl border border-border bg-popover/70 p-2.5 text-destructive"
                >
                  <Trash2 className="size-4" />
                </button>
              </>
            ) : null}
          </div>
        </div>
        <span className="mt-4 inline-block rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
          {CATEGORIAS.find((c) => c.slug === estudo.categoria)?.label}
        </span>
        <h1 className="mt-2 font-display text-3xl leading-tight">{estudo.titulo}</h1>
        {estudo.subtitulo ? <p className="mt-1 text-sm text-soft">{estudo.subtitulo}</p> : null}
        <p className="mt-2 text-xs text-soft">
          {estudo.autor_nome || "Liderança"} · {formatarData(estudo.created_at)}
        </p>
      </header>

      <article className="px-5 py-5">
        {estudo.conteudo_html.trim() ? (
          <RichTextView html={estudo.conteudo_html} />
        ) : (
          <p className="text-sm text-soft">Este estudo ainda não tem conteúdo publicado.</p>
        )}
      </article>

      {/* Curiosidades */}
      <section className="px-5 pb-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <Lightbulb className="size-5 text-primary" /> Curiosidades
          </h2>
          {gestor ? (
            <button
              type="button"
              onClick={() => void novaCuriosidade()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
            >
              <Plus className="size-3.5" /> Adicionar
            </button>
          ) : null}
        </div>

        {curiosidades.length ? (
          <div className="space-y-3">
            {visiveis.map((c, i) => (
              <div key={c.id} className="surface-card p-4">
                <h3 className="flex items-start gap-2 font-semibold">
                  <Lightbulb className="mt-0.5 size-4 shrink-0 text-primary" /> {c.titulo}
                </h3>
                <p className="mt-1.5 whitespace-pre-wrap text-sm text-soft">{c.conteudo}</p>
                {gestor ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => void editarCuriosidade(c)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-primary"
                    >
                      <Pencil className="size-3.5" /> Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => void excluirCuriosidade(c)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-destructive"
                    >
                      <Trash2 className="size-3.5" /> Excluir
                    </button>
                    <button
                      type="button"
                      aria-label="Mover para cima"
                      onClick={() => void moverCuriosidade(i, -1)}
                      className="rounded-lg bg-secondary px-3 py-2 text-primary"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Mover para baixo"
                      onClick={() => void moverCuriosidade(i, 1)}
                      className="rounded-lg bg-secondary px-3 py-2 text-primary"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                ) : null}
              </div>
            ))}
            {curiosidades.length > LIMITE_CURIOSIDADES ? (
              <button
                type="button"
                onClick={() => setVerTodas((v) => !v)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-border py-3 text-sm font-semibold text-primary"
              >
                <ChevronDown className={`size-4 transition-transform ${verTodasCuriosidades ? "rotate-180" : ""}`} />
                {verTodasCuriosidades
                  ? "Ver menos"
                  : `Ver mais curiosidades (${curiosidades.length - LIMITE_CURIOSIDADES})`}
              </button>
            ) : null}
          </div>
        ) : (
          <p className="text-sm text-soft">Nenhuma curiosidade cadastrada neste estudo.</p>
        )}
      </section>

      {/* Referências */}
      <section className="px-5 pb-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-display text-xl">
            <BookOpen className="size-5 text-primary" /> Referências
          </h2>
          {gestor ? (
            <button
              type="button"
              onClick={() => void novaReferencia()}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-bold text-primary-foreground"
            >
              <Plus className="size-3.5" /> Adicionar
            </button>
          ) : null}
        </div>

        {referencias.length ? (
          <ul className="space-y-2">
            {referencias.map((r) => (
              <li key={r.id} className="surface-card flex items-center justify-between gap-3 p-4">
                <button type="button" onClick={() => setRefAberta(r)} className="min-w-0 flex-1 text-left">
                  <p className="font-semibold text-primary">{rotuloReferencia(r)}</p>
                  {r.descricao ? <p className="mt-0.5 text-sm text-soft">{r.descricao}</p> : null}
                </button>
                {gestor ? (
                  <span className="flex gap-1.5">
                    <button
                      type="button"
                      aria-label="Editar referência"
                      onClick={() => void editarReferencia(r)}
                      className="rounded-lg bg-secondary p-2.5 text-primary"
                    >
                      <Pencil className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      aria-label="Excluir referência"
                      onClick={() => void excluirReferencia(r)}
                      className="rounded-lg bg-secondary p-2.5 text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-soft">Nenhuma referência cadastrada neste estudo.</p>
        )}
      </section>

      {/* Perguntas e respostas */}
      <section className="px-5 pb-8">
        <h2 className="mb-3 flex items-center gap-2 font-display text-xl">
          <MessageCircle className="size-5 text-primary" /> Perguntas e respostas
        </h2>

        <div className="surface-card p-4">
          <p className="text-sm font-medium">Tem uma dúvida sobre este estudo?</p>
          <Textarea
            value={novaPergunta}
            onChange={(e) => setNovaPergunta(e.target.value)}
            placeholder="Escreva sua pergunta ou reflexão…"
            className="mt-2 min-h-24 bg-background"
          />
          <button
            type="button"
            disabled={!novaPergunta.trim()}
            onClick={() => void publicarPergunta()}
            className="mt-3 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
          >
            Publicar pergunta
          </button>
          <p className="mt-2 text-center text-[11px] text-soft">
            Sua pergunta aparece com seu nome. Não há anonimato.
          </p>
        </div>

        {perguntas.length ? (
          <>
            <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
              {ORDENS.map((o) => (
                <button
                  key={o.valor}
                  type="button"
                  onClick={() => setOrdem(o.valor)}
                  className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold ${
                    ordem === o.valor
                      ? "border-primary bg-primary/15 text-primary"
                      : "border-border text-soft"
                  }`}
                >
                  {o.label}
                </button>
              ))}
            </div>

            <div className="mt-3 space-y-3">
              {listaPerguntas.map((p) => {
                const meuPost = p.autor_id === meuId;
                return (
                  <article key={p.id} className="surface-card p-4">
                    <div className="flex items-start gap-3">
                      <Avatar url={p.fotoUrl} nome={p.autor_nome} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold">{p.autor_nome}</p>
                        <p className="text-[11px] text-soft">{formatarData(p.created_at)}</p>
                      </div>
                      {p.status !== "visivel" ? (
                        <span className="rounded-full bg-secondary px-2 py-1 text-[10px] font-bold text-soft">
                          OCULTA
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 whitespace-pre-wrap text-sm">{p.conteudo}</p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => void curtirPergunta(p)}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold ${
                          p.euCurti ? "bg-primary/15 text-primary" : "bg-secondary text-soft"
                        }`}
                      >
                        <Heart className={`size-3.5 ${p.euCurti ? "fill-current" : ""}`} /> {p.curtidas}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRespondendo(respondendo === p.id ? null : p.id);
                          setTextoResposta("");
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-soft"
                      >
                        <MessageCircle className="size-3.5" /> {p.respostas.length} responder
                      </button>
                      {meuPost ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void editarPergunta(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-primary"
                          >
                            <Pencil className="size-3.5" /> Editar
                          </button>
                          <button
                            type="button"
                            onClick={() => void excluirPergunta(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-destructive"
                          >
                            <Trash2 className="size-3.5" /> Excluir
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void denunciar("pergunta", p.id)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-soft"
                        >
                          <Flag className="size-3.5" /> Denunciar
                        </button>
                      )}
                      {gestor ? (
                        <>
                          <button
                            type="button"
                            onClick={() => void ocultarPergunta(p)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-soft"
                          >
                            <EyeOff className="size-3.5" /> {p.status === "visivel" ? "Ocultar" : "Reexibir"}
                          </button>
                          {!meuPost ? (
                            <button
                              type="button"
                              onClick={() => void excluirPergunta(p)}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-destructive"
                            >
                              <Trash2 className="size-3.5" /> Remover
                            </button>
                          ) : null}
                        </>
                      ) : null}
                    </div>

                    {p.respostas.length ? (
                      <div className="mt-3 space-y-3 border-t border-border pt-3">
                        {p.respostas.map((r) => (
                          <div key={r.id} className="rounded-xl bg-secondary/60 p-3">
                            <div className="flex items-start gap-2.5">
                              <Avatar url={r.fotoUrl} nome={r.autor_nome} />
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-semibold">{r.autor_nome}</p>
                                <p className="text-[11px] text-soft">{formatarData(r.created_at)}</p>
                              </div>
                            </div>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {r.oficial ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-primary/50 px-2 py-0.5 text-[10px] font-bold text-primary">
                                  <BadgeCheck className="size-3" /> Resposta oficial
                                </span>
                              ) : null}
                              {r.ajudou ? (
                                <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-bold text-soft">
                                  <Star className="size-3" /> Ajudou o autor
                                </span>
                              ) : null}
                              {r.status !== "visivel" ? (
                                <span className="rounded-full bg-background px-2 py-0.5 text-[10px] font-bold text-soft">
                                  OCULTA
                                </span>
                              ) : null}
                            </div>
                            <p className="mt-2 whitespace-pre-wrap text-sm">{r.conteudo}</p>
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => void curtirResposta(p.id, r)}
                                className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold ${
                                  r.euCurti ? "bg-primary/15 text-primary" : "bg-background text-soft"
                                }`}
                              >
                                <Heart className={`size-3.5 ${r.euCurti ? "fill-current" : ""}`} /> {r.curtidas}
                              </button>
                              {meuPost ? (
                                <button
                                  type="button"
                                  onClick={() => void marcarAjudou(p, r)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-semibold text-primary"
                                >
                                  <Star className={`size-3.5 ${r.ajudou ? "fill-current" : ""}`} />
                                  {r.ajudou ? "Ajudou" : "Me ajudou"}
                                </button>
                              ) : null}
                              {r.autor_id === meuId ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => void editarResposta(r)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-semibold text-primary"
                                  >
                                    <Pencil className="size-3.5" /> Editar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void excluirResposta(r)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-semibold text-destructive"
                                  >
                                    <Trash2 className="size-3.5" /> Excluir
                                  </button>
                                </>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => void denunciar("resposta", r.id)}
                                  className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-semibold text-soft"
                                >
                                  <Flag className="size-3.5" /> Denunciar
                                </button>
                              )}
                              {gestor ? (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => void marcarOficial(r)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-semibold text-primary"
                                  >
                                    <BadgeCheck className="size-3.5" />
                                    {r.oficial ? "Remover oficial" : "Marcar oficial"}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => void ocultarResposta(r)}
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-semibold text-soft"
                                  >
                                    <EyeOff className="size-3.5" />
                                    {r.status === "visivel" ? "Ocultar" : "Reexibir"}
                                  </button>
                                  {r.autor_id !== meuId ? (
                                    <button
                                      type="button"
                                      onClick={() => void excluirResposta(r)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-background px-2.5 py-1.5 text-xs font-semibold text-destructive"
                                    >
                                      <Trash2 className="size-3.5" /> Remover
                                    </button>
                                  ) : null}
                                </>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {respondendo === p.id ? (
                      <div className="mt-3 border-t border-border pt-3">
                        <Textarea
                          value={textoResposta}
                          onChange={(e) => setTextoResposta(e.target.value)}
                          placeholder="Escreva sua resposta…"
                          className="min-h-20 bg-background"
                        />
                        <button
                          type="button"
                          disabled={!textoResposta.trim()}
                          onClick={() => void publicarResposta(p.id)}
                          className="mt-2 w-full rounded-xl bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-40"
                        >
                          Publicar resposta
                        </button>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          </>
        ) : (
          <div className="mt-4 flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-border px-5 py-8 text-center">
            <MessageCircle className="size-7 text-primary" />
            <p className="font-display text-base">Seja o primeiro a participar.</p>
            <p className="text-sm text-soft">Tem alguma dúvida ou reflexão sobre este estudo?</p>
          </div>
        )}
      </section>

      {/* Modal de referência */}
      {refAberta ? (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/60"
          onClick={() => setRefAberta(null)}
          role="presentation"
        >
          <div
            className="w-full rounded-t-2xl border-t border-border bg-popover p-5"
            style={{ paddingBottom: "calc(1.25rem + env(safe-area-inset-bottom))" }}
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Referência bíblica"
          >
            <p className="font-display text-2xl text-primary">{rotuloReferencia(refAberta)}</p>
            <p className="mt-1 text-sm text-soft">
              {refAberta.livro} · capítulo {refAberta.capitulo} · versículo{" "}
              {refAberta.versiculo_inicio}
              {refAberta.versiculo_fim ? ` a ${refAberta.versiculo_fim}` : ""}
            </p>
            {refAberta.descricao ? <p className="mt-3 text-sm">{refAberta.descricao}</p> : null}
            <p className="mt-3 rounded-lg bg-secondary px-3 py-2 text-xs text-soft">
              O texto bíblico completo ainda não está dentro do app. Toque abaixo para ler a passagem.
            </p>
            <button
              type="button"
              onClick={() => abrirNaBiblia(refAberta)}
              className="mt-4 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-primary-foreground"
            >
              Abrir na Bíblia
            </button>
            <button
              type="button"
              onClick={() => setRefAberta(null)}
              className="mt-2 w-full rounded-xl border border-border py-3 text-sm font-semibold text-soft"
            >
              Fechar
            </button>
          </div>
        </div>
      ) : null}

      {/* Edição do estudo */}
      {editando ? (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <button type="button" onClick={() => setEditando(false)} className="text-sm text-soft">
              Cancelar
            </button>
            <p className="font-display text-base">Editar estudo</p>
            <button
              type="button"
              disabled={!form.titulo.trim()}
              onClick={() => void salvarEstudo()}
              className="rounded-lg bg-primary px-3 py-2 text-sm font-bold text-primary-foreground disabled:opacity-40"
            >
              Salvar
            </button>
          </div>
          <div className="flex-1 space-y-3 overflow-y-auto p-4 pb-24">
            <Input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
              placeholder="Título do estudo"
              className="h-12 bg-surface"
            />
            <Input
              value={form.subtitulo}
              onChange={(e) => setForm({ ...form, subtitulo: e.target.value })}
              placeholder="Subtítulo (opcional)"
              className="h-12 bg-surface"
            />
            <RichTextEditor
              valor={form.conteudo}
              onChange={(html) => setForm((f) => ({ ...f, conteudo: html }))}
              placeholder="Conteúdo do estudo…"
              minHeight={280}
            />
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
