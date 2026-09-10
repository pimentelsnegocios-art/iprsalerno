export const CARGOS = [
  "Visitante",
  "Membro",
  "Diácono",
  "Auxiliar de Caixa",
  "Líder de Louvor",
  "Líder de Jovens",
  "Líder de Irmãs",
  "Presbítero",
  "Pastor",
  "Admin",
  "Fundador",
] as const;

export type CargoOficial = (typeof CARGOS)[number];

export const MINISTERIOS_DISPONIVEIS = [
  "Louvor",
  "Jovens",
  "Irmãs",
  "Diaconia",
  "Mídia",
  "Intercessão",
  "Infantil",
  "Recepção",
] as const;

export type SlugMinisterio = "louvor" | "jovens" | "irmas";

export const NOME_MINISTERIO: Record<SlugMinisterio, string> = {
  louvor: "Louvor",
  jovens: "Jovens",
  irmas: "Irmãs",
};

const LIDER_DO: Record<string, SlugMinisterio> = {
  "Líder de Louvor": "louvor",
  "Líder de Jovens": "jovens",
  "Líder de Irmãs": "irmas",
};

export interface PerfilPermissao {
  cargo: string;
  status: string;
  ministerios: string[];
}

export const ehSuperAdmin = (p: PerfilPermissao) =>
  ["Fundador", "Pastor", "Presbítero"].includes(p.cargo);

export const ehAdmin = (p: PerfilPermissao) => p.cargo === "Admin" || ehSuperAdmin(p);

/** Cadastro liberado pela liderança. */
export const estaAprovado = (p: PerfilPermissao) =>
  ["aprovado", "ativo", "liderança", "lideranca"].includes((p.status ?? "").toLowerCase());

export const estaPendente = (p: PerfilPermissao) =>
  (p.status ?? "").toLowerCase() === "pendente";

export const estaRejeitado = (p: PerfilPermissao) =>
  ["rejeitado", "bloqueado"].includes((p.status ?? "").toLowerCase());

export const ehVisitante = (p: PerfilPermissao) => p.cargo === "Visitante";

export const podeVerCaixaPerfil = (p: PerfilPermissao) =>
  !ehVisitante(p) && (ehAdmin(p) || p.cargo === "Auxiliar de Caixa");

export const podeEditarCaixa = podeVerCaixaPerfil;

export const podeGerirAgenda = (p: PerfilPermissao) => ehAdmin(p);

export const podeAprovarCadastros = (p: PerfilPermissao) => ehAdmin(p);

export const podeExcluirMembros = (p: PerfilPermissao) => ehAdmin(p);

/** Visitante e pendente não acessam pastoral/estudos restritos. */
export const podeVerPastoral = (p: PerfilPermissao) => !ehVisitante(p) && estaAprovado(p);

export function podeVerMinisterio(p: PerfilPermissao, slug: SlugMinisterio) {
  if (ehSuperAdmin(p)) return true;
  if (ehVisitante(p)) return false;
  if (!estaAprovado(p)) return false;
  if (LIDER_DO[p.cargo] === slug) return true;
  return p.ministerios.includes(NOME_MINISTERIO[slug]);
}

export function podeAdministrarMinisterio(p: PerfilPermissao, slug: SlugMinisterio) {
  return ehSuperAdmin(p) || (estaAprovado(p) && LIDER_DO[p.cargo] === slug);
}

/** Motivo do bloqueio, para mostrar a mensagem certa. */
export function motivoBloqueio(p: PerfilPermissao): "pendente" | "rejeitado" | "visitante" | "sem-acesso" {
  if (estaPendente(p)) return "pendente";
  if (estaRejeitado(p)) return "rejeitado";
  if (ehVisitante(p)) return "visitante";
  return "sem-acesso";
}

export const perfilVazio: PerfilPermissao = {
  cargo: "Membro",
  status: "Pendente",
  ministerios: [],
};
