import { Comida, Conquista, Especie, EvolutionStage, ItemLoja } from "@/types/pet";

export const STORAGE_KEY = "bichinho-virtual:pet";

export const ESPECIE_PADRAO: Especie = "dino";

export interface ConfigDaEspecie {
  id: Especie;
  nome: string;
  icone: string;
  corClara: string;
  corEscura: string;
}

export const CATALOGO_DE_ESPECIES: ConfigDaEspecie[] = [
  { id: "dino", nome: "Dino", icone: "🦖", corClara: "#2dd4c4", corEscura: "#0f9c92" },
  { id: "gato", nome: "Gatinho", icone: "🐱", corClara: "#fdba74", corEscura: "#ea580c" },
  { id: "urso", nome: "Ursinho", icone: "🐻", corClara: "#d3a373", corEscura: "#92622f" },
  { id: "coelho", nome: "Coelhinho", icone: "🐰", corClara: "#e9d5ff", corEscura: "#a78bfa" },
];

export const TICK_INTERVAL_MS = 3000;

export const MIN_STAT = 0;
export const MAX_STAT = 100;

/**
 * Taxas pensadas pra um pet que sobrevive bastante tempo sem cuidado (cerca de
 * meio dia a um dia inteiro, dependendo de quanto os atributos ficam críticos ao
 * mesmo tempo) — o suficiente pra uma criança ir pra escola e voltar sem achar o
 * bichinho morto. Antes dessas taxas serem reduzidas (~20x), o pet morria em
 * menos de uma hora sem nenhuma interação.
 */
export const DECAY_PER_MINUTE = {
  fome: 0.15,
  felicidade: 0.1,
  energia: 0.08,
  higiene: 0.13,
  saude: 0.02,
} as const;

/** Abaixo desse valor um atributo é considerado crítico e passa a corroer a saúde. */
export const CRITICAL_THRESHOLD = 25;

/** Perda extra de saúde por minuto, por atributo em estado crítico. */
export const SAUDE_PENALTY_PER_MINUTE = 0.15;

export const SLEEP_DECAY_FACTOR = 0.35;
export const SLEEP_ENERGY_RECOVERY_PER_MINUTE = 14;
export const SLEEP_AUTO_WAKE_ENERGY = 100;

/** A cada quantos minutos acordado o pet faz um novo cocô (até o limite MAX_COCOS). */
export const MINUTOS_POR_COCO = 20;
export const MAX_COCOS = 4;
/** Perda extra de higiene por minuto, por cocô não limpo. */
export const PENALIDADE_HIGIENE_POR_COCO = 0.3;

export const ACTION_EFFECTS = {
  brincar: { felicidade: 25, energia: -15, xp: 10 },
  banhar: { higiene: 45, felicidade: 3, xp: 4 },
  curar: { saude: 35, xp: 6 },
  carinho: { felicidade: 8, xp: 2 },
  limparCoco: { higiene: 5, xp: 2 },
} as const;

export const XP_PASSIVO_POR_MINUTO = 2;

export function xpParaProximoNivel(nivel: number): number {
  return nivel * 100;
}

export const NIVEL_DO_ESTAGIO: Record<EvolutionStage, number> = {
  ovo: 1,
  bebe: 2,
  filhote: 4,
  jovem: 7,
  adulto: 12,
};

export const NOME_PADRAO_DO_PET = "Bichinho";

/** Depois desse tempo sem abrir o jogo, mostramos o resumo do que aconteceu offline. */
export const OFFLINE_SUMMARY_THRESHOLD_MS = 2 * 60_000;

// ---------------------------------------------------------------------------
// Comidas
// ---------------------------------------------------------------------------

export const CATALOGO_DE_COMIDAS: Comida[] = [
  { id: "racao", nome: "Ração", icone: "🥣", preco: 0, fome: 20, felicidade: 2, xp: 4 },
  { id: "suco", nome: "Suco de Frutas", icone: "🧃", preco: 3, fome: 10, felicidade: 12, xp: 3 },
  { id: "fruta", nome: "Fruta", icone: "🍎", preco: 5, fome: 30, felicidade: 8, xp: 6 },
  { id: "pizza", nome: "Pizza", icone: "🍕", preco: 18, fome: 35, felicidade: 15, xp: 10 },
  { id: "sorvete", nome: "Sorvete", icone: "🍦", preco: 12, fome: 25, felicidade: 18, xp: 8 },
  { id: "bolo", nome: "Bolo Especial", icone: "🍰", preco: 25, fome: 45, felicidade: 25, xp: 12 },
];

// ---------------------------------------------------------------------------
// Loja: roupas e acessórios (cosméticos, mostrados sobrepostos ao avatar)
// ---------------------------------------------------------------------------

export const CATALOGO_DA_LOJA: ItemLoja[] = [
  {
    id: "oculos",
    nome: "Óculos Escuros",
    icone: "🕶️",
    categoria: "acessorio",
    preco: 20,
    moeda: "moedas",
    nivelMinimo: 1,
    descricao: "Deixa o bichinho com estilo.",
  },
  {
    id: "chapeu",
    nome: "Chapéu de Festa",
    icone: "🎩",
    categoria: "acessorio",
    preco: 35,
    moeda: "moedas",
    nivelMinimo: 2,
    descricao: "Perfeito para comemorar o level up.",
  },
  {
    id: "lacinho",
    nome: "Laço",
    icone: "🎀",
    categoria: "acessorio",
    preco: 30,
    moeda: "moedas",
    nivelMinimo: 2,
    descricao: "Um toque de charme.",
  },
  {
    id: "coroa",
    nome: "Coroa Real",
    icone: "👑",
    categoria: "acessorio",
    preco: 15,
    moeda: "gemas",
    nivelMinimo: 5,
    descricao: "Item premium para o bichinho mais nobre da cidade.",
  },
  {
    id: "capa",
    nome: "Capa de Herói",
    icone: "🦸",
    categoria: "roupa",
    preco: 25,
    moeda: "gemas",
    nivelMinimo: 8,
    descricao: "Item premium exclusivo para quem chegou longe.",
  },
  {
    id: "tiara",
    nome: "Tiara de Borboleta",
    icone: "🦋",
    categoria: "acessorio",
    preco: 18,
    moeda: "moedas",
    nivelMinimo: 3,
    descricao: "Delicada e cheia de estilo.",
  },
  {
    id: "asas",
    nome: "Asas de Fada",
    icone: "🧚",
    categoria: "roupa",
    preco: 35,
    moeda: "gemas",
    nivelMinimo: 10,
    descricao: "Item premium raro para o bichinho mais experiente.",
  },
];

// ---------------------------------------------------------------------------
// Pacotes de gemas (moeda premium) — compra simulada, sem processar pagamento real.
// ---------------------------------------------------------------------------

export interface PacoteDeGemas {
  id: string;
  gemas: number;
  precoExibido: string;
  destaque?: boolean;
}

export const PACOTES_DE_GEMAS: PacoteDeGemas[] = [
  { id: "gemas_p", gemas: 20, precoExibido: "R$ 2,90" },
  { id: "gemas_m", gemas: 55, precoExibido: "R$ 6,90", destaque: true },
  { id: "gemas_g", gemas: 120, precoExibido: "R$ 12,90" },
];

// ---------------------------------------------------------------------------
// Conquistas
// ---------------------------------------------------------------------------

export const LISTA_DE_CONQUISTAS: Conquista[] = [
  {
    id: "primeira_refeicao",
    nome: "Primeira Refeição",
    descricao: "Alimente seu bichinho pela primeira vez.",
    icone: "🍽️",
    recompensaMoedas: 10,
    condicao: (pet) => pet.totalAlimentado >= 1,
  },
  {
    id: "cuidador_dedicado",
    nome: "Cuidador Dedicado",
    descricao: "Alcance o nível 5.",
    icone: "🏅",
    recompensaMoedas: 30,
    condicao: (pet) => pet.nivel >= 5,
  },
  {
    id: "mestre_dos_minigames",
    nome: "Mestre dos Minigames",
    descricao: "Jogue 10 minigames.",
    icone: "🎮",
    recompensaMoedas: 40,
    condicao: (pet) => pet.minigamesJogados >= 10,
  },
  {
    id: "comprador_frequente",
    nome: "Comprador Frequente",
    descricao: "Compre 3 itens na loja.",
    icone: "🛍️",
    recompensaMoedas: 25,
    condicao: (pet) => pet.itensComprados.length >= 3,
  },
  {
    id: "sequencia_de_ouro",
    nome: "Sequência de Ouro",
    descricao: "Entre no jogo por 7 dias seguidos.",
    icone: "🔥",
    recompensaMoedas: 100,
    condicao: (pet) => pet.sequenciaDeDias >= 7,
  },
  {
    id: "lenda_adulta",
    nome: "Lenda Adulta",
    descricao: "Evolua seu bichinho até a fase adulta.",
    icone: "🌟",
    recompensaMoedas: 60,
    condicao: (pet) => pet.nivel >= NIVEL_DO_ESTAGIO.adulto,
  },
  {
    id: "faxineiro",
    nome: "Faxineiro Nota 10",
    descricao: "Limpe 20 cocôs do seu bichinho.",
    icone: "🧹",
    recompensaMoedas: 20,
    condicao: (pet) => pet.totalCocosLimpos >= 20,
  },
  {
    id: "colecionador",
    nome: "Colecionador",
    descricao: "Tenha 6 itens diferentes na loja.",
    icone: "🎒",
    recompensaMoedas: 45,
    condicao: (pet) => pet.itensComprados.length >= 6,
  },
  {
    id: "veterano",
    nome: "Veterano",
    descricao: "Alcance o nível 10.",
    icone: "🎖️",
    recompensaMoedas: 70,
    condicao: (pet) => pet.nivel >= 10,
  },
];

// ---------------------------------------------------------------------------
// Recompensa diária (bônus de login por dia da sequência, 1 a 7)
// ---------------------------------------------------------------------------

export const RECOMPENSA_DIARIA_POR_DIA: { moedas: number; gemas: number }[] = [
  { moedas: 10, gemas: 0 },
  { moedas: 15, gemas: 0 },
  { moedas: 20, gemas: 1 },
  { moedas: 25, gemas: 0 },
  { moedas: 30, gemas: 1 },
  { moedas: 40, gemas: 2 },
  { moedas: 100, gemas: 5 },
];

// ---------------------------------------------------------------------------
// Falas espontâneas do pet, usadas para chamar a atenção do jogador
// ---------------------------------------------------------------------------

export const FALAS_POR_ESTADO = {
  fome: ["Estou com fome...", "Cadê minha comida?", "Que tal um lanchinho?"],
  felicidade: ["Vamos brincar?", "Estou entediado!", "Fica comigo um pouco?"],
  higiene: ["Acho que preciso de um banho...", "Tô cheirando estranho!"],
  energia: ["Estou tão cansado...", "Preciso de uma soneca."],
  saude: ["Não estou me sentindo bem...", "Acho que estou doente."],
  feliz: ["Oi! Estou muito feliz hoje!", "Você é o melhor cuidador!", "Bora jogar um minigame?"],
} as const;

export const INTERVALO_FALA_MS = 25_000;
