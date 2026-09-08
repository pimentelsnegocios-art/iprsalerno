import { supabase } from "@/integrations/supabase/client";
import {
  ehSuperAdmin,
  podeAdministrarMinisterio,
  type PerfilPermissao,
} from "@/lib/permissoes";

export type CategoriaEstudo = "geral" | "jovens";

/** "geral" abre pelo botão Estudo; "jovens" vive dentro do Ministério de Jovens. */
export const CATEGORIAS: { slug: CategoriaEstudo; label: string; descricao: string }[] = [
  {
    slug: "geral",
    label: "Estudos Gerais",
    descricao: "Conteúdo bíblico para toda a igreja",
  },
  {
    slug: "jovens",
    label: "Estudo de Jovens",
    descricao: "Conteúdo bíblico do Ministério de Jovens",
  },
];

/** Somente Pastor, Presbítero e Fundador criam/editam/moderam conteúdo. */
export const podeGerirEstudos = (p: PerfilPermissao) => ehSuperAdmin(p);

/** Nos estudos de Jovens, a liderança do ministério também gere o conteúdo. */
export const podeGerirCategoria = (p: PerfilPermissao, categoria: CategoriaEstudo) =>
  ehSuperAdmin(p) || (categoria === "jovens" && podeAdministrarMinisterio(p, "jovens"));

export interface Estudo {
  id: string;
  categoria: CategoriaEstudo;
  titulo: string;
  subtitulo: string;
  conteudo_html: string;
  autor_id: string | null;
  autor_nome: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Curiosidade {
  id: string;
  estudo_id: string;
  titulo: string;
  conteudo: string;
  posicao: number;
}

export interface Referencia {
  id: string;
  estudo_id: string;
  livro: string;
  capitulo: number;
  versiculo_inicio: number;
  versiculo_fim: number | null;
  descricao: string;
  posicao: number;
}

export interface Resposta {
  id: string;
  pergunta_id: string;
  autor_id: string;
  autor_nome: string;
  conteudo: string;
  oficial: boolean;
  ajudou: boolean;
  status: string;
  created_at: string;
  curtidas: number;
  euCurti: boolean;
  fotoUrl: string | null;
}

export interface Pergunta {
  id: string;
  estudo_id: string;
  autor_id: string;
  autor_nome: string;
  conteudo: string;
  status: string;
  created_at: string;
  curtidas: number;
  euCurti: boolean;
  fotoUrl: string | null;
  respostas: Resposta[];
}

export type OrdemPerguntas = "relevantes" | "recentes" | "respondidas" | "curtidas";

export const ORDENS: { valor: OrdemPerguntas; label: string }[] = [
  { valor: "relevantes", label: "🔥 Mais relevantes" },
  { valor: "recentes", label: "🆕 Mais recentes" },
  { valor: "respondidas", label: "💬 Mais respondidas" },
  { valor: "curtidas", label: "❤️ Mais curtidas" },
];

export function ordenarPerguntas(lista: Pergunta[], ordem: OrdemPerguntas): Pergunta[] {
  const copia = [...lista];
  const tempo = (p: Pergunta) => new Date(p.created_at).getTime();
  switch (ordem) {
    case "recentes":
      return copia.sort((a, b) => tempo(b) - tempo(a));
    case "respondidas":
      return copia.sort((a, b) => b.respostas.length - a.respostas.length || tempo(b) - tempo(a));
    case "curtidas":
      return copia.sort((a, b) => b.curtidas - a.curtidas || tempo(b) - tempo(a));
    default: {
      const dias = (p: Pergunta) => (Date.now() - tempo(p)) / 86_400_000;
      const score = (p: Pergunta) =>
        p.curtidas * 2 + p.respostas.length * 3 + Math.max(0, 10 - dias(p));
      return copia.sort((a, b) => score(b) - score(a) || tempo(b) - tempo(a));
    }
  }
}

/* ------------------------------ Rich text ------------------------------ */

export const CORES_TEXTO = [
  { nome: "Padrão", valor: "" },
  { nome: "Vermelho", valor: "#E23D3D" },
  { nome: "Preto", valor: "#111111" },
  { nome: "Branco", valor: "#FFFFFF" },
  { nome: "Azul", valor: "#2F6FE4" },
] as const;

const TAGS_OK = new Set([
  "P", "BR", "DIV", "SPAN", "B", "STRONG", "I", "EM", "U", "UL", "OL", "LI", "H2", "H3", "BLOCKQUOTE", "FONT",
]);
const CORES_OK = new Set(CORES_TEXTO.map((c) => c.valor.toLowerCase()).filter(Boolean));

function corSegura(valor: string): string | null {
  const v = valor.trim().toLowerCase();
  if (CORES_OK.has(v)) return v;
  const rgb = v.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (rgb) {
    const hex =
      "#" +
      [rgb[1], rgb[2], rgb[3]]
        .map((n) => Number(n).toString(16).padStart(2, "0"))
        .join("");
    if (CORES_OK.has(hex)) return hex;
  }
  return null;
}

/** Remove tudo que não for formatação permitida (negrito, itálico, sublinhado, cores da paleta). */
export function sanitizarHtml(html: string): string {
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, "");
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, "text/html");
  const raiz = doc.body.firstElementChild as HTMLElement;

  const limpar = (no: Element) => {
    [...no.children].forEach((filho) => {
      limpar(filho);
      if (!TAGS_OK.has(filho.tagName)) {
        filho.replaceWith(...Array.from(filho.childNodes));
        return;
      }
      const cor =
        corSegura((filho as HTMLElement).style?.color ?? "") ??
        corSegura(filho.getAttribute("color") ?? "");
      [...filho.attributes].forEach((a) => filho.removeAttribute(a.name));
      if (cor) (filho as HTMLElement).style.color = cor;
    });
  };
  limpar(raiz);
  return raiz.innerHTML;
}

export const textoPuro = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();

/* ------------------------------ Bíblia ------------------------------ */

export function rotuloReferencia(r: Referencia) {
  const fim = r.versiculo_fim && r.versiculo_fim > r.versiculo_inicio ? `-${r.versiculo_fim}` : "";
  return `${r.livro} ${r.capitulo}:${r.versiculo_inicio}${fim}`;
}

/**
 * Ponto único de integração com um futuro módulo de Bíblia interno.
 * Hoje abre a passagem numa Bíblia online; quando o módulo existir,
 * basta trocar a navegação aqui.
 */
export function abrirNaBiblia(r: Referencia) {
  const url = `https://www.bible.com/pt/search/bible?query=${encodeURIComponent(rotuloReferencia(r))}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

/* ------------------------------ Dados ------------------------------ */

export async function listarEstudos(categoria: CategoriaEstudo): Promise<Estudo[]> {
  const { data } = await supabase
    .from("estudos")
    .select("*")
    .eq("categoria", categoria)
    .order("created_at", { ascending: false });
  return (data ?? []) as Estudo[];
}

export async function buscarEstudo(id: string): Promise<Estudo | null> {
  const { data } = await supabase.from("estudos").select("*").eq("id", id).maybeSingle();
  return (data as Estudo | null) ?? null;
}

export async function listarCuriosidades(estudoId: string): Promise<Curiosidade[]> {
  const { data } = await supabase
    .from("estudo_curiosidades")
    .select("*")
    .eq("estudo_id", estudoId)
    .order("posicao");
  return (data ?? []) as Curiosidade[];
}

export async function listarReferencias(estudoId: string): Promise<Referencia[]> {
  const { data } = await supabase
    .from("estudo_referencias")
    .select("*")
    .eq("estudo_id", estudoId)
    .order("posicao");
  return (data ?? []) as Referencia[];
}

export async function listarPerguntas(estudoId: string, meuId: string | null): Promise<Pergunta[]> {
  const { data: perguntas } = await supabase
    .from("estudo_perguntas")
    .select("*")
    .eq("estudo_id", estudoId)
    .order("created_at", { ascending: false });

  const listaP = (perguntas ?? []) as Omit<Pergunta, "curtidas" | "euCurti" | "fotoUrl" | "respostas">[];
  if (!listaP.length) return [];
  const idsP = listaP.map((p) => p.id);

  const [{ data: respostas }, { data: curtidasP }] = await Promise.all([
    supabase.from("estudo_respostas").select("*").in("pergunta_id", idsP).order("created_at"),
    supabase.from("estudo_pergunta_curtidas").select("pergunta_id,user_id").in("pergunta_id", idsP),
  ]);

  const listaR = (respostas ?? []) as Omit<Resposta, "curtidas" | "euCurti" | "fotoUrl">[];
  const idsR = listaR.map((r) => r.id);
  const { data: curtidasR } = idsR.length
    ? await supabase.from("estudo_resposta_curtidas").select("resposta_id,user_id").in("resposta_id", idsR)
    : { data: [] };

  const autores = [...new Set([...listaP.map((p) => p.autor_id), ...listaR.map((r) => r.autor_id)])];
  const { data: perfis } = autores.length
    ? await supabase.from("profiles").select("id,foto_url").in("id", autores)
    : { data: [] };
  const fotos = new Map((perfis ?? []).map((p) => [p.id, p.foto_url as string | null]));

  const contaP = new Map<string, { total: number; eu: boolean }>();
  (curtidasP ?? []).forEach((c) => {
    const atual = contaP.get(c.pergunta_id) ?? { total: 0, eu: false };
    contaP.set(c.pergunta_id, { total: atual.total + 1, eu: atual.eu || c.user_id === meuId });
  });
  const contaR = new Map<string, { total: number; eu: boolean }>();
  (curtidasR ?? []).forEach((c) => {
    const atual = contaR.get(c.resposta_id) ?? { total: 0, eu: false };
    contaR.set(c.resposta_id, { total: atual.total + 1, eu: atual.eu || c.user_id === meuId });
  });

  return listaP.map((p) => ({
    ...p,
    curtidas: contaP.get(p.id)?.total ?? 0,
    euCurti: contaP.get(p.id)?.eu ?? false,
    fotoUrl: fotos.get(p.autor_id) ?? null,
    respostas: listaR
      .filter((r) => r.pergunta_id === p.id)
      .map((r) => ({
        ...r,
        curtidas: contaR.get(r.id)?.total ?? 0,
        euCurti: contaR.get(r.id)?.eu ?? false,
        fotoUrl: fotos.get(r.autor_id) ?? null,
      })),
  }));
}

export async function registrarModeracao(input: {
  moderadorId: string;
  moderadorNome: string;
  acao: string;
  alvoTipo: string;
  alvoId: string;
  detalhe?: string;
}) {
  await supabase.from("estudo_moderacao_log").insert({
    moderador_id: input.moderadorId,
    moderador_nome: input.moderadorNome,
    acao: input.acao,
    alvo_tipo: input.alvoTipo,
    alvo_id: input.alvoId,
    detalhe: input.detalhe ?? "",
  });
}

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
