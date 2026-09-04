export const CARGOS = [
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

export const podeVerCaixaPerfil = (p: PerfilPermissao) =>
  ehAdmin(p) || p.cargo === "Auxiliar de Caixa";

export const podeEditarCaixa = podeVerCaixaPerfil;

export const podeGerirAgenda = (p: PerfilPermissao) => ehAdmin(p);

export const podeAprovarCadastros = (p: PerfilPermissao) => ehAdmin(p);

export const podeExcluirMembros = (p: PerfilPermissao) => ehAdmin(p);

export function podeVerMinisterio(p: PerfilPermissao, slug: SlugMinisterio) {
  if (ehSuperAdmin(p)) return true;
  if (LIDER_DO[p.cargo] === slug) return true;
  return p.ministerios.includes(NOME_MINISTERIO[slug]);
}

export function podeAdministrarMinisterio(p: PerfilPermissao, slug: SlugMinisterio) {
  return ehSuperAdmin(p) || LIDER_DO[p.cargo] === slug;
}

export const perfilVazio: PerfilPermissao = {
  cargo: "Membro",
  status: "Pendente",
  ministerios: [],
};
