import type { MinisterioSlug } from "./church-data";

export type SecaoKey =
  | "ensaio"
  | "oracao"
  | "repertorio"
  | "letras"
  | "avisos"
  | "estudo"
  | "agenda"
  | "visitas"
  | "cifras";

export interface ParteLetra {
  quem: string; // "Conjunto", "Solo — Ana Clara" ...
  texto: string;
  marcacao?: string; // ministração, fala entre partes
}

export interface Ensaio {
  titulo: string;
  artista: string;
  tom: string;
  link: string;
  solistas: string[];
  partes: ParteLetra[];
  observacoes?: string[];
}

export interface LouvorRepertorio {
  id: string;
  titulo: string;
  artista: string;
  tom: string;
  link: string;
  letra: string[];
}

export interface AbaRepertorio {
  id: string;
  label: string;
  louvores: LouvorRepertorio[];
}

export interface AvisoMin {
  id: string;
  titulo: string;
  texto: string;
  autor: string;
  data: string;
  fixado?: boolean;
}

export interface CheckinOracao {
  autor: string;
  texto: string;
  quando: string;
}

export interface Oracao {
  proposito: string;
  checkins: CheckinOracao[];
}

export interface EstudoMes {
  id: string;
  mes: string;
  livro: string;
  resumo: string;
  curiosidades: string[];
  mural: { autor: string; papel: string; texto: string; resposta?: { autor: string; texto: string } }[];
}

export interface EventoAgenda {
  id: string;
  titulo: string;
  tipo: "Ensaio" | "Culto" | "Evento";
  data: string;
  hora: string;
  presencas: { nome: string; presente: boolean }[];
  louvoresDoDia?: { titulo: string; ministro: string; tom: string }[];
}

export interface Visita {
  id: string;
  nome: string;
  endereco: string;
  data: string;
  hora: string;
  irmas: string[];
  realizada: boolean;
}

export interface LinhaCifra {
  acordes: string;
  letra: string;
}

export interface Cifra {
  id: string;
  titulo: string;
  artista: string;
  tom: string;
  linhas: LinhaCifra[];
}

export interface MinisterioConteudo {
  slug: MinisterioSlug;
  nome: string;
  subtitulo: string;
  emoji: string;
  lider: string;
  versiculo: string;
  frase?: string;
  secoes: { key: SecaoKey; label: string; emoji: string; descricao: string; restrito?: boolean }[];
  ensaio: Ensaio;
  oracao: Oracao;
  abas: AbaRepertorio[];
  avisos: AvisoMin[];
  estudo?: EstudoMes[];
  agenda?: EventoAgenda[];
  visitas?: Visita[];
  cifras?: Cifra[];
}

const letraTeLouvarei = [
  "Te louvarei, te louvarei",
  "Com todo o meu ser, Senhor",
  "Te louvarei, te louvarei",
  "Porque tu és o meu Deus",
];

const letraDeusEstaAqui = [
  "Deus está aqui, aleluia",
  "Tão certo como o ar que eu respiro",
  "Tão certo como a manhã que se levanta",
  "Tão certo como eu te falo e podes me ouvir",
];

const letraTeAdoramos = [
  "Te adoramos, ó Senhor",
  "Rei dos reis, Senhor dos senhores",
  "Toda glória e todo louvor",
  "São teus, somente teus",
];

const letraCeia = [
  "Este é o meu corpo, partido por vós",
  "Este é o meu sangue, derramado por vós",
  "Fazei isto em memória de mim",
  "Até que eu venha, anunciai a minha morte",
];

export const ministeriosConteudo: Record<MinisterioSlug, MinisterioConteudo> = {
  jovens: {
    slug: "jovens",
    nome: "Ministério de Jovens",
    subtitulo: "Para Cristo",
    emoji: "🔥",
    lider: "Tiago Ferreira",
    versiculo: "“Jovem, onde está a tua força? E a tua força é para a guerra.” — Juízes 6:12",
    secoes: [
      { key: "ensaio", label: "Ensaio", emoji: "🎵", descricao: "Louvor da semana, solistas e letra" },
      { key: "oracao", label: "Oração", emoji: "🙏", descricao: "Propósito e check-in do grupo" },
      { key: "repertorio", label: "Repertório", emoji: "📖", descricao: "Congregacionais e Ceia" },
      { key: "avisos", label: "Avisos", emoji: "📢", descricao: "Comunicados do ministério" },
      { key: "estudo", label: "Estudo Mensal", emoji: "📖", descricao: "Um livro da Bíblia por mês", restrito: true },
      { key: "agenda", label: "Agenda", emoji: "📅", descricao: "Ensaios, eventos e presença" },
    ],
    ensaio: {
      titulo: "Ousado Amor",
      artista: "Isaias Saad",
      tom: "D",
      link: "https://www.youtube.com/watch?v=nQWFzMvCfLE",
      solistas: ["Tiago Ferreira", "Ana Clara Mendes", "Lucas Prado"],
      partes: [
        { quem: "Solo — Tiago Ferreira", texto: "Antes que eu dissesse sim, tu me chamaste" },
        { quem: "Solo — Ana Clara Mendes", texto: "Antes que eu pecasse, tu me perdoaste" },
        { quem: "Conjunto", texto: "Ousado amor, tão largo é teu amor por mim", marcacao: "Entra a banda completa" },
        { quem: "Solo — Lucas Prado", texto: "Derruba muros, quebra mentiras", marcacao: "Momento de ministração" },
        { quem: "Conjunto", texto: "Nada me separa do teu amor" },
      ],
      observacoes: ["Ensaio quinta 20h", "Levar cabo P10 reserva"],
    },
    oracao: {
      proposito: "Semana de consagração: jejum das 12h às 18h na quarta, clamando por avivamento na juventude.",
      checkins: [
        { autor: "Ana Clara Mendes", texto: "Orando pela cirurgia da minha mãe.", quando: "02/09 — 21:10" },
        { autor: "Lucas Prado", texto: "Direção de Deus para a faculdade.", quando: "01/09 — 19:44" },
      ],
    },
    abas: [
      {
        id: "congregacional",
        label: "📌 Congregacionais",
        louvores: [
          { id: "j1", titulo: "Te Louvarei", artista: "Harpa Cristã", tom: "G", link: "https://www.youtube.com/results?search_query=te+louvarei", letra: letraTeLouvarei },
          { id: "j2", titulo: "Deus Está Aqui", artista: "Tradicional", tom: "C", link: "https://www.youtube.com/results?search_query=deus+esta+aqui", letra: letraDeusEstaAqui },
          { id: "j3", titulo: "Te Adoramos", artista: "Comunidade", tom: "D", link: "https://www.youtube.com/results?search_query=te+adoramos", letra: letraTeAdoramos },
        ],
      },
      {
        id: "ceia",
        label: "📌 Louvores da Ceia",
        louvores: [
          { id: "j4", titulo: "Nada Além do Sangue", artista: "Fernandinho", tom: "G", link: "https://www.youtube.com/results?search_query=nada+alem+do+sangue", letra: letraCeia },
        ],
      },
    ],
    avisos: [
      { id: "aj1", titulo: "Vigília da juventude", texto: "Sexta 22h no templo. Traga um amigo!", autor: "Tiago Ferreira", data: "02/09/2026", fixado: true },
      { id: "aj2", titulo: "Ação social no bairro", texto: "Sábado 9h — separar cestas básicas.", autor: "Pr. Marcos Andrade", data: "31/08/2026" },
    ],
    estudo: [
      {
        id: "junho",
        mes: "Junho",
        livro: "Gênesis",
        resumo: "As origens: criação, queda, dilúvio e os patriarcas. Deus inicia seu plano redentor com Abraão.",
        curiosidades: ["Gênesis significa 'origem' em grego.", "Cobre mais tempo que todo o restante da Bíblia."],
        mural: [
          {
            autor: "Lucas Prado",
            papel: "Membro",
            texto: "Os dias da criação são literais?",
            resposta: { autor: "Presb. Sérgio Lima", texto: "Há posições distintas; o texto enfatiza a soberania de Deus como Criador." },
          },
        ],
      },
      {
        id: "julho",
        mes: "Julho",
        livro: "Êxodo",
        resumo: "A libertação de Israel do Egito, a Lei no Sinai e o tabernáculo.",
        curiosidades: ["A Páscoa nasce em Êxodo 12.", "Moisés escreve boa parte do livro em primeira pessoa."],
        mural: [],
      },
      {
        id: "agosto",
        mes: "Agosto",
        livro: "Levítico",
        resumo: "Santidade e adoração: sacrifícios, sacerdócio e as festas do Senhor.",
        curiosidades: ["'Santo' aparece mais de 80 vezes no livro."],
        mural: [],
      },
      {
        id: "setembro",
        mes: "Setembro",
        livro: "Números",
        resumo: "A caminhada no deserto, os censos e a fidelidade de Deus diante da murmuração.",
        curiosidades: ["40 anos de peregrinação por causa da incredulidade em Cades-Barneia."],
        mural: [],
      },
    ],
    agenda: [
      {
        id: "ej1",
        titulo: "Ensaio semanal",
        tipo: "Ensaio",
        data: "04/09/2026",
        hora: "20:00",
        presencas: [
          { nome: "Tiago Ferreira", presente: true },
          { nome: "Ana Clara Mendes", presente: true },
          { nome: "Lucas Prado", presente: false },
          { nome: "Bruna Alves", presente: false },
        ],
      },
      {
        id: "ej2",
        titulo: "Culto de jovens",
        tipo: "Culto",
        data: "05/09/2026",
        hora: "19:00",
        presencas: [
          { nome: "Tiago Ferreira", presente: true },
          { nome: "Ana Clara Mendes", presente: false },
          { nome: "Lucas Prado", presente: false },
          { nome: "Bruna Alves", presente: true },
        ],
      },
    ],
  },

  irmas: {
    slug: "irmas",
    nome: "Ministério das Irmãs",
    subtitulo: "Para Cristo",
    emoji: "💜",
    lider: "Débora Nunes",
    versiculo:
      "“São muitas as mulheres virtuosas, mas tu a sobrepassas a todas.” — Provérbios 31:29",
    secoes: [
      { key: "ensaio", label: "Ensaio", emoji: "🎵", descricao: "Louvor da semana e ministras" },
      { key: "oracao", label: "Oração", emoji: "🙏", descricao: "Propósito e check-in" },
      { key: "repertorio", label: "Repertório", emoji: "📖", descricao: "Congregacionais e Ceia" },
      { key: "avisos", label: "Avisos", emoji: "📢", descricao: "Comunicados do ministério" },
      { key: "visitas", label: "Visitas", emoji: "👩‍❤️‍👩", descricao: "Agenda e histórico de visitas" },
    ],
    ensaio: {
      titulo: "Deus Cuida de Mim",
      artista: "Kleber Lucas",
      tom: "A",
      link: "https://www.youtube.com/results?search_query=deus+cuida+de+mim",
      solistas: ["Débora Nunes", "Joana Reis"],
      partes: [
        { quem: "Solo — Débora Nunes", texto: "Deus cuida de mim, há algo em mim" },
        { quem: "Solo — Joana Reis", texto: "Que me faz crer no impossível" },
        { quem: "Conjunto", texto: "Ele é o Deus que me sustenta", marcacao: "Todas as vozes" },
      ],
      observacoes: ["Ensaio terça 19h30 na sala 2"],
    },
    oracao: {
      proposito: "Interceder pelas famílias da congregação e pelas irmãs enfermas durante todo o mês.",
      checkins: [
        { autor: "Joana Reis", texto: "Peço oração pela minha neta.", quando: "02/09 — 08:20" },
        { autor: "Débora Nunes", texto: "Gratidão pela recuperação da irmã Marta.", quando: "01/09 — 17:05" },
      ],
    },
    abas: [
      {
        id: "congregacional",
        label: "📌 Congregacionais",
        louvores: [
          { id: "i1", titulo: "Te Louvarei", artista: "Harpa Cristã", tom: "G", link: "https://www.youtube.com/results?search_query=te+louvarei", letra: letraTeLouvarei },
          { id: "i2", titulo: "Deus Está Aqui", artista: "Tradicional", tom: "C", link: "https://www.youtube.com/results?search_query=deus+esta+aqui", letra: letraDeusEstaAqui },
        ],
      },
      {
        id: "ceia",
        label: "📌 Louvores da Ceia",
        louvores: [
          { id: "i3", titulo: "Cordeiro Santo", artista: "Congregacional", tom: "D", link: "https://www.youtube.com/results?search_query=cordeiro+santo", letra: letraCeia },
        ],
      },
    ],
    avisos: [
      { id: "ai1", titulo: "Chá das Irmãs", texto: "Sábado às 15h no salão. Cada uma traz um doce.", autor: "Débora Nunes", data: "02/09/2026", fixado: true },
      { id: "ai2", titulo: "Círculo de oração", texto: "Segunda 14h — casa da irmã Marta.", autor: "Joana Reis", data: "30/08/2026" },
    ],
    visitas: [
      { id: "v1", nome: "Irmã Marta Ribeiro", endereco: "Rua Bela Vista, 45 — Centro", data: "05/09/2026", hora: "14:00", irmas: ["Débora Nunes", "Joana Reis"], realizada: false },
      { id: "v2", nome: "Dona Cecília (vizinhança)", endereco: "Av. das Flores, 980 — Jardim", data: "12/09/2026", hora: "10:00", irmas: ["Ana Clara Mendes", "Bruna Alves"], realizada: false },
      { id: "v3", nome: "Irmã Lúcia Prado", endereco: "Rua do Campo, 12 — Vila Nova", data: "22/08/2026", hora: "16:00", irmas: ["Débora Nunes"], realizada: true },
    ],
  },

  louvor: {
    slug: "louvor",
    nome: "Ministério de Louvor",
    subtitulo: "IPR do Brasil",
    emoji: "🎤",
    lider: "Evandro Pimentel",
    versiculo: "“Tudo quanto tem fôlego louve ao Senhor.” — Salmos 150:6",
    frase: "Tudo para a glória Dele, para edificação da igreja.",
    secoes: [
      { key: "agenda", label: "Agenda", emoji: "📅", descricao: "Presença e louvores do dia" },
      { key: "ensaio", label: "Ensaios", emoji: "🎵", descricao: "Louvor, solistas e marcações" },
      { key: "letras", label: "Letras", emoji: "📖", descricao: "Rápidos, Congregacional e Ceia" },
      { key: "cifras", label: "Cifras", emoji: "🎸", descricao: "Acordes com transposição" },
      { key: "avisos", label: "Avisos", emoji: "📢", descricao: "Comunicados da equipe" },
      { key: "oracao", label: "Oração", emoji: "🙏", descricao: "Propósito e pedidos da equipe" },
    ],
    ensaio: {
      titulo: "Santo Espírito",
      artista: "Laura Souguellis",
      tom: "E",
      link: "https://www.youtube.com/results?search_query=santo+espirito+laura",
      solistas: ["Evandro Pimentel", "Ana Clara Mendes"],
      partes: [
        { quem: "Solo — Evandro Pimentel", texto: "Ao teu nome, toda língua se dobrará" },
        { quem: "Conjunto", texto: "Santo Espírito, enche este lugar", marcacao: "Entrada de teclado + voz" },
        { quem: "Fala — Evandro", texto: "“Deixe o Espírito falar ao seu coração agora.”", marcacao: "Fala entre as partes" },
        { quem: "Conjunto", texto: "Vem, Espírito, vem", marcacao: "Momento de ministração — repetir livre" },
      ],
      observacoes: ["Dinâmica: 2º refrão só voz e teclado", "Bateria entra na virada após a fala"],
    },
    oracao: {
      proposito: "Que a equipe ministre em santidade e unidade neste trimestre, buscando a presença antes da técnica.",
      checkins: [
        { autor: "Evandro Pimentel", texto: "Deus tem falado sobre quebrantamento no altar.", quando: "02/09 — 22:30" },
        { autor: "Ana Clara Mendes", texto: "Oração pela voz — estou com rouquidão.", quando: "02/09 — 09:12" },
      ],
    },
    abas: [
      {
        id: "rapidos",
        label: "⚡ Rápidos",
        louvores: [
          { id: "l1", titulo: "Te Louvarei", artista: "Harpa Cristã", tom: "G", link: "https://www.youtube.com/results?search_query=te+louvarei", letra: letraTeLouvarei },
          { id: "l2", titulo: "Alegria, Alegria", artista: "Congregacional", tom: "C", link: "https://www.youtube.com/results?search_query=alegria+alegria+louvor", letra: ["Alegria, alegria no coração", "Cristo vive em mim, aleluia!"] },
        ],
      },
      {
        id: "congregacional",
        label: "📌 Congregacional",
        louvores: [
          { id: "l3", titulo: "Grande é o Senhor", artista: "Adhemar de Campos", tom: "C", link: "https://www.youtube.com/results?search_query=grande+e+o+senhor", letra: ["Grande é o Senhor e mui digno de louvor", "Na cidade do nosso Deus, seu santo monte"] },
          { id: "l4", titulo: "Deus Está Aqui", artista: "Tradicional", tom: "C", link: "https://www.youtube.com/results?search_query=deus+esta+aqui", letra: letraDeusEstaAqui },
        ],
      },
      {
        id: "ceia",
        label: "✝️ Ceia",
        louvores: [
          { id: "l5", titulo: "Nada Além do Sangue", artista: "Fernandinho", tom: "G", link: "https://www.youtube.com/results?search_query=nada+alem+do+sangue", letra: letraCeia },
        ],
      },
    ],
    avisos: [
      { id: "al1", titulo: "Passagem de som", texto: "Domingo 16h30 — todos no templo com instrumentos afinados.", autor: "Evandro Pimentel", data: "02/09/2026", fixado: true },
      { id: "al2", titulo: "Nova escala publicada", texto: "Confira a escala de setembro na Agenda.", autor: "Pr. Marcos Andrade", data: "01/09/2026" },
    ],
    agenda: [
      {
        id: "el1",
        titulo: "Ensaio geral",
        tipo: "Ensaio",
        data: "04/09/2026",
        hora: "20:00",
        presencas: [
          { nome: "Evandro Pimentel", presente: true },
          { nome: "Ana Clara Mendes", presente: true },
          { nome: "Tiago Ferreira", presente: false },
        ],
      },
      {
        id: "el2",
        titulo: "Culto de sábado",
        tipo: "Culto",
        data: "05/09/2026",
        hora: "19:00",
        presencas: [
          { nome: "Evandro Pimentel", presente: true },
          { nome: "Ana Clara Mendes", presente: true },
          { nome: "Tiago Ferreira", presente: true },
        ],
        louvoresDoDia: [
          { titulo: "Nada Além do Sangue", ministro: "Tiago Ferreira", tom: "G" },
          { titulo: "Ousado Amor", ministro: "Ana Clara Mendes", tom: "D" },
        ],
      },
      {
        id: "el3",
        titulo: "Culto de domingo",
        tipo: "Culto",
        data: "06/09/2026",
        hora: "18:00",
        presencas: [
          { nome: "Evandro Pimentel", presente: true },
          { nome: "Ana Clara Mendes", presente: false },
          { nome: "Tiago Ferreira", presente: true },
        ],
        louvoresDoDia: [
          { titulo: "Grande é o Senhor", ministro: "Evandro Pimentel", tom: "C" },
          { titulo: "Santo Espírito", ministro: "Ana Clara Mendes", tom: "E" },
        ],
      },
    ],
    cifras: [
      {
        id: "c1",
        titulo: "Grande é o Senhor",
        artista: "Adhemar de Campos",
        tom: "C",
        linhas: [
          { acordes: "C            G/B        Am", letra: "Grande é o Senhor e mui digno" },
          { acordes: "F           C/E      Dm7  G", letra: "de louvor na cidade do nosso Deus" },
          { acordes: "C           G/B          Am", letra: "Santo monte seu, ó quão grande" },
          { acordes: "F        G           C", letra: "é o Senhor, o nosso Deus" },
        ],
      },
      {
        id: "c2",
        titulo: "Te Louvarei",
        artista: "Harpa Cristã",
        tom: "G",
        linhas: [
          { acordes: "G          D        Em", letra: "Te louvarei, te louvarei" },
          { acordes: "C        D          G", letra: "Com todo o meu ser, Senhor" },
          { acordes: "G          D        Em", letra: "Te louvarei, te louvarei" },
          { acordes: "C       D        G", letra: "Porque tu és o meu Deus" },
        ],
      },
    ],
  },
};

export const podeEditarEstudo = (cargo: string) =>
  ["Fundador", "Admin", "Pastor", "Presbítero"].includes(cargo);
