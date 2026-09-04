export type Cargo =
  | "Fundador"
  | "Admin"
  | "Pastor"
  | "Presbítero"
  | "Auxiliar de Caixa"
  | "Membro";

export type MinisterioSlug = "louvor" | "jovens" | "irmas";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  whatsapp: string;
  endereco: string;
  cargo: Cargo;
  ministerio: MinisterioSlug | null;
  funcao: string;
  bio: string;
  versiculo: string;
  foto: string | null;
}

// Usuário logado (mock — será substituído pelo login do backend)
export const usuarioAtual: Usuario = {
  id: "u1",
  nome: "Evandro Pimentel",
  email: "evandro@ipr.org.br",
  whatsapp: "(11) 99999-0000",
  endereco: "Rua das Oliveiras, 120 — São Paulo/SP",
  cargo: "Fundador",
  ministerio: "louvor",
  funcao: "Líder de Louvor",
  bio: "Servo do Senhor, apaixonado por música e pela obra da igreja.",
  versiculo: "Salmos 23:1 — O Senhor é o meu pastor, nada me faltará.",
  foto: null,
};

export const avisos = [
  {
    id: "a1",
    titulo: "Santa Ceia neste domingo",
    texto:
      "Neste domingo teremos a celebração da Santa Ceia às 18h. Venha com o coração preparado.",
    data: "02/09/2026",
    autor: "Pr. Marcos Andrade",
  },
  {
    id: "a2",
    titulo: "Campanha de doações",
    texto: "Estamos recebendo alimentos não perecíveis para as famílias assistidas.",
    data: "30/08/2026",
    autor: "Presb. Sérgio Lima",
  },
];

export interface Louvor {
  titulo: string;
  artista: string;
  tom: string;
}

export interface Culto {
  slug: "quinta" | "sabado" | "domingo";
  dia: string;
  horario: string;
  data: string;
  tema: string;
  pregador: string;
  dirigente: string;
  louvores: Louvor[];
}

export const cultos: Culto[] = [
  {
    slug: "quinta",
    dia: "Quinta-feira",
    horario: "19h30",
    data: "03/09/2026",
    tema: "Culto de Oração e Doutrina",
    pregador: "Presb. Sérgio Lima",
    dirigente: "Diác. Paulo Souza",
    louvores: [],
  },
  {
    slug: "sabado",
    dia: "Sábado",
    horario: "19h00",
    data: "05/09/2026",
    tema: "Jovens em Adoração",
    pregador: "Pr. Marcos Andrade",
    dirigente: "Tiago Ferreira",
    louvores: [
      { titulo: "Nada Além do Sangue", artista: "Fernandinho", tom: "G" },
      { titulo: "Ousado Amor", artista: "Isaias Saad", tom: "D" },
      { titulo: "Tu És Fiel, Senhor", artista: "Harpa", tom: "A" },
    ],
  },
  {
    slug: "domingo",
    dia: "Domingo",
    horario: "18h00",
    data: "06/09/2026",
    tema: "A Graça que Sustenta",
    pregador: "Pr. Marcos Andrade",
    dirigente: "Ana Clara Mendes",
    louvores: [
      { titulo: "Grande é o Senhor", artista: "Adhemar de Campos", tom: "C" },
      { titulo: "Santo Espírito", artista: "Laura Souguellis", tom: "E" },
      { titulo: "Deus Proverá", artista: "Comunidade Kadosh", tom: "F" },
    ],
  },
];

export const categoriasOracao = [
  "Saúde",
  "Família",
  "Emprego",
  "Financeiro",
  "Espiritual",
  "Outros",
] as const;

export interface PedidoOracao {
  id: string;
  autor: string;
  categoria: (typeof categoriasOracao)[number];
  texto: string;
  criadoEm: string;
  expiraEm: string;
  orando: number;
}

export const pedidosOracao: PedidoOracao[] = [
  {
    id: "p1",
    autor: "Ana Clara Mendes",
    categoria: "Saúde",
    texto: "Peço oração pela cirurgia da minha mãe na próxima terça-feira.",
    criadoEm: "01/09/2026",
    expiraEm: "08/09/2026",
    orando: 12,
  },
  {
    id: "p2",
    autor: "Tiago Ferreira",
    categoria: "Emprego",
    texto: "Estou em processo seletivo, peço direção de Deus.",
    criadoEm: "31/08/2026",
    expiraEm: "07/09/2026",
    orando: 7,
  },
  {
    id: "p3",
    autor: "Diác. Paulo Souza",
    categoria: "Família",
    texto: "Restauração e paz no lar de uma família da nossa congregação.",
    criadoEm: "30/08/2026",
    expiraEm: "06/09/2026",
    orando: 21,
  },
];

export interface Estudo {
  id: string;
  titulo: string;
  livro: string;
  tema: string;
  autor: string;
  resumo: string;
  curiosidade: string;
  referencias: string[];
  mural: { autor: string; texto: string }[];
}

export const estudos: Estudo[] = [
  {
    id: "e1",
    titulo: "A Justificação pela Fé",
    livro: "Romanos",
    tema: "Doutrina",
    autor: "Pr. Marcos Andrade",
    resumo:
      "Um estudo sobre Romanos 5 e a certeza da paz com Deus mediante a fé em Cristo.",
    curiosidade:
      "Romanos foi escrito por Paulo em Corinto, por volta de 57 d.C., e entregue por Febe.",
    referencias: ["Romanos 5:1-11", "Gálatas 2:16", "Efésios 2:8-9"],
    mural: [
      { autor: "Ana Clara Mendes", texto: "Estudo abençoado, mudou minha semana." },
    ],
  },
  {
    id: "e2",
    titulo: "Os Salmos de Subida",
    livro: "Salmos",
    tema: "Adoração",
    autor: "Presb. Sérgio Lima",
    resumo: "Salmos 120 a 134 e a caminhada do povo rumo a Jerusalém.",
    curiosidade: "Eram cantados pelos peregrinos ao subir para as festas no templo.",
    referencias: ["Salmos 121", "Salmos 133"],
    mural: [],
  },
  {
    id: "e3",
    titulo: "Mulheres de Fé",
    livro: "Rute",
    tema: "Família",
    autor: "Irmã Débora Nunes",
    resumo: "A fidelidade de Rute e o cuidado providencial de Deus.",
    curiosidade: "Rute, moabita, entra na genealogia de Jesus.",
    referencias: ["Rute 1:16", "Mateus 1:5"],
    mural: [],
  },
];

export interface Ministerio {
  slug: MinisterioSlug;
  nome: string;
  emoji: string;
  lider: string;
  descricao: string;
  botoes: string[];
}

export const ministerios: Ministerio[] = [
  {
    slug: "louvor",
    nome: "Ministério de Louvor",
    emoji: "🎵",
    lider: "Evandro Pimentel",
    descricao: "Equipe de músicos e vocais dos cultos de sábado e domingo.",
    botoes: ["Repertório", "Escala", "Ensaios", "Cifras", "Mural da Equipe"],
  },
  {
    slug: "jovens",
    nome: "Ministério de Jovens",
    emoji: "🔥",
    lider: "Tiago Ferreira",
    descricao: "Discipulado, encontros e ações sociais da juventude.",
    botoes: ["Encontros", "Discipulado", "Escala", "Ações Sociais", "Mural Jovem"],
  },
  {
    slug: "irmas",
    nome: "Ministério das Irmãs",
    emoji: "💜",
    lider: "Débora Nunes",
    descricao: "Círculo de oração, visitas e projetos de acolhimento.",
    botoes: ["Círculo de Oração", "Visitas", "Chá das Irmãs", "Projetos", "Mural"],
  },
];

export interface MensagemPastoral {
  id: string;
  autor: string;
  papel: string;
  texto: string;
  quando: string;
}

export const conversaPastoral: MensagemPastoral[] = [
  {
    id: "m1",
    autor: "Evandro Pimentel",
    papel: "Membro",
    texto: "A paz do Senhor, pastor. Gostaria de conversar sobre um assunto pessoal.",
    quando: "01/09 — 20:14",
  },
  {
    id: "m2",
    autor: "Pr. Marcos Andrade",
    papel: "Pastor",
    texto: "A paz, irmão! Estou à disposição. Pode falar com tranquilidade.",
    quando: "01/09 — 21:02",
  },
];

export type TipoLancamento = "entrada" | "saida";
export type FormaPagamento = "Dinheiro" | "Pix" | "Cartão";

export interface Lancamento {
  id: string;
  tipo: TipoLancamento;
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  /** ISO yyyy-mm-dd — usado em gráficos, filtros e fechamento de mês */
  dataISO: string;
  responsavel: string;
  forma: FormaPagamento;
  observacao?: string | undefined;
  comprovante?: string | null | undefined;
}

export const categoriasEntrada = ["Dízimo", "Oferta", "Doação", "Evento"];
export const categoriasSaida = [
  "Conta Luz",
  "Água",
  "Aluguel",
  "Manutenção",
  "Repasse Sede",
  "Evento",
];

const hoje = new Date();
const diasAtras = (n: number) => {
  const d = new Date(hoje);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};
export const formatarData = (iso: string) => {
  const [a, m, d] = iso.split("-");
  return `${d}/${m}/${a}`;
};

export const lancamentos: Lancamento[] = [
  {
    id: "l1",
    tipo: "entrada",
    categoria: "Dízimo",
    descricao: "Dízimos do culto de domingo",
    valor: 4820,
    data: formatarData(diasAtras(3)),
    dataISO: diasAtras(3),
    responsavel: "Auxiliar Joana Reis",
    forma: "Pix",
  },
  {
    id: "l2",
    tipo: "entrada",
    categoria: "Oferta",
    descricao: "Oferta de gratidão",
    valor: 1230.5,
    data: formatarData(diasAtras(3)),
    dataISO: diasAtras(3),
    responsavel: "Auxiliar Joana Reis",
    forma: "Dinheiro",
  },
  {
    id: "l3",
    tipo: "saida",
    categoria: "Conta Luz",
    descricao: "Conta de luz — mês anterior",
    valor: 742.9,
    data: formatarData(diasAtras(6)),
    dataISO: diasAtras(6),
    responsavel: "Presb. Sérgio Lima",
    forma: "Cartão",
    observacao: "Vencimento dia 10.",
  },
  {
    id: "l4",
    tipo: "saida",
    categoria: "Repasse Sede",
    descricao: "Repasse mensal à sede",
    valor: 1500,
    data: formatarData(diasAtras(9)),
    dataISO: diasAtras(9),
    responsavel: "Pr. Marcos Andrade",
    forma: "Pix",
  },
  {
    id: "l5",
    tipo: "entrada",
    categoria: "Doação",
    descricao: "Doação para cestas básicas",
    valor: 600,
    data: formatarData(diasAtras(14)),
    dataISO: diasAtras(14),
    responsavel: "Auxiliar Joana Reis",
    forma: "Pix",
  },
  {
    id: "l6",
    tipo: "saida",
    categoria: "Manutenção",
    descricao: "Reparo do ar-condicionado do templo",
    valor: 980,
    data: formatarData(diasAtras(18)),
    dataISO: diasAtras(18),
    responsavel: "Presb. Sérgio Lima",
    forma: "Dinheiro",
  },
  {
    id: "l7",
    tipo: "entrada",
    categoria: "Dízimo",
    descricao: "Dízimos do culto de quinta",
    valor: 2140,
    data: formatarData(diasAtras(24)),
    dataISO: diasAtras(24),
    responsavel: "Auxiliar Joana Reis",
    forma: "Dinheiro",
  },
  {
    id: "l8",
    tipo: "saida",
    categoria: "Água",
    descricao: "Conta de água",
    valor: 318.4,
    data: formatarData(diasAtras(27)),
    dataISO: diasAtras(27),
    responsavel: "Auxiliar Joana Reis",
    forma: "Cartão",
  },
];


export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const podeVerCaixa = (cargo: Cargo) =>
  ["Fundador", "Pastor", "Presbítero", "Auxiliar de Caixa"].includes(cargo);

export const podeVerAdmin = (cargo: Cargo) => ["Fundador", "Admin"].includes(cargo);

export const ehLideranca = (cargo: Cargo) =>
  ["Fundador", "Admin", "Pastor", "Presbítero"].includes(cargo);
