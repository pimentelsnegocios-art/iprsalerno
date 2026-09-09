import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { BookOpen, Plus, Search } from "lucide-react";

import { AppShell, PageHeader } from "@/components/AppShell";
import { RichTextEditor } from "@/components/RichTextEditor";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { usePerfil } from "@/hooks/usePerfil";
import { supabase } from "@/integrations/supabase/client";
import {
  CATEGORIAS,
  formatarData,
  listarEstudos,
  podeGerirEstudos,
  textoPuro,
  type CategoriaEstudo,
  type Estudo,
} from "@/lib/estudos-biblicos";
import { brParaIso, hojeIso, isoParaBR, mascaraData } from "@/lib/livros-biblia";

export const Route = createFileRoute("/estudo/")({
  head: () => ({
    meta: [
      { title: "Estudos Gerais — IPRB Renovada" },
      {
        name: "description",
        content:
          "Estudos bíblicos para toda a igreja, com curiosidades, referências e mural de dúvidas da comunidade.",
      },
      { property: "og:title", content: "Estudos Gerais — IPRB Renovada" },
      {
        property: "og:description",
        content: "Leia, estude e participe das discussões bíblicas da igreja.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EstudosBiblicos,
});

function EstudosBiblicos() {
  const { perfil, permissao } = usePerfil();
  const navigate = useNavigate();
  const [aba] = useState<CategoriaEstudo>("geral");
  const [cache, setCache] = useState<Partial<Record<CategoriaEstudo, Estudo[]>>>({});
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");
  const [criando, setCriando] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ titulo: "", subtitulo: "", conteudo: "", data: hojeIso() });

  const gestor = podeGerirEstudos(permissao);
  const lista = cache[aba];

  const carregar = useCallback(
    async (cat: CategoriaEstudo) => {
      if (!cache[cat]) setCarregando(true);
      const dados = await listarEstudos(cat);
      setCache((c) => ({ ...c, [cat]: dados }));
      setCarregando(false);
    },
    [cache],
  );

  useEffect(() => {
    void carregar(aba);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aba]);

  const filtrados = (lista ?? []).filter((e) =>
    [e.titulo, e.subtitulo, textoPuro(e.conteudo_html)].join(" ").toLowerCase().includes(busca.toLowerCase()),
  );

  const abrirCriacao = () => {
    setForm({ titulo: "", subtitulo: "", conteudo: "", data: hojeIso() });
    setCriando(true);
  };

  const salvar = async () => {
    if (!form.titulo.trim() || !perfil) return;
    setSalvando(true);
    const { data, error } = await supabase
      .from("estudos")
      .insert({
        categoria: aba,
        titulo: form.titulo.trim(),
        subtitulo: form.subtitulo.trim(),
        conteudo_html: form.conteudo,
        data_estudo: form.data || hojeIso(),
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
    <AppShell>
      <PageHeader title="Estudos Gerais" subtitle="Conteúdo bíblico para toda a igreja" />

      <div className="px-5 pt-4">


        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-soft" />
          <Input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar por título, tema ou palavra-chave"
            className="h-12 bg-surface pl-9"
          />
        </div>

        {gestor ? (
          <button
            type="button"
            onClick={abrirCriacao}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 text-sm font-bold text-primary-foreground active:scale-95"
          >
            <Plus className="size-4" /> Adicionar Estudo
          </button>
        ) : null}
      </div>

      <div className="space-y-3 px-5 py-5">
        {carregando ? (
          [0, 1, 2].map((i) => (
            <div key={i} className="surface-card space-y-2.5 p-4">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : filtrados.length ? (
          filtrados.map((e) => (
            <Link
              key={e.id}
              to="/estudo/$id"
              params={{ id: e.id }}
              className="surface-card block p-4 active:scale-[0.99]"
            >
              <span className="inline-block rounded-full bg-primary/15 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-primary">
                {CATEGORIAS.find((c) => c.slug === e.categoria)?.label}
              </span>
              <h2 className="mt-2 font-display text-lg leading-snug">{e.titulo}</h2>
              {e.subtitulo ? <p className="mt-0.5 text-sm text-soft">{e.subtitulo}</p> : null}
              <p className="mt-2 text-xs text-soft">
                {e.autor_nome || "Liderança"} ·{" "}
                {e.data_estudo ? isoParaBR(e.data_estudo) : formatarData(e.created_at)}
              </p>
            </Link>
          ))
        ) : (
          <div className="surface-card flex flex-col items-center gap-2 px-5 py-10 text-center">
            <BookOpen className="size-8 text-primary" />
            <p className="font-display text-lg">
              {busca ? "Nenhum estudo encontrado." : "Nenhum estudo disponível ainda."}
            </p>
            <p className="text-sm text-soft">
              {busca
                ? "Tente outra palavra-chave."
                : "Novos estudos bíblicos serão publicados em breve."}
            </p>
            {gestor && !busca ? (
              <button
                type="button"
                onClick={abrirCriacao}
                className="mt-2 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground"
              >
                <Plus className="size-4" /> Criar primeiro estudo
              </button>
            ) : null}
          </div>
        )}
      </div>

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
            <p className="text-xs text-soft">
              Categoria: {CATEGORIAS.find((c) => c.slug === aba)?.label}
            </p>
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
            <div className="grid grid-cols-2 gap-2">
              <label className="block text-xs text-soft">
                Data do estudo
                <input
                  type="date"
                  value={form.data}
                  onChange={(e) => setForm({ ...form, data: e.target.value })}
                  className="mt-1 h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground"
                />
              </label>
              <label className="block text-xs text-soft">
                Ou digite DD/MM/AAAA
                <input
                  inputMode="numeric"
                  placeholder="DD/MM/AAAA"
                  value={form.data ? isoParaBR(form.data) : ""}
                  onChange={(e) => {
                    const br = mascaraData(e.target.value);
                    setForm({ ...form, data: (br.length === 10 ? brParaIso(br) : "") ?? "" });
                  }}
                  className="mt-1 h-12 w-full rounded-xl border border-border bg-surface px-3 text-sm text-foreground"
                />
              </label>
            </div>
            <RichTextEditor
              valor={form.conteudo}
              onChange={(html) => setForm((f) => ({ ...f, conteudo: html }))}
              placeholder="Escreva o conteúdo do estudo…"
              minHeight={280}
            />
          </div>
        </div>
      ) : null}
    </AppShell>
  );
}
