export type PetMood = "feliz" | "triste" | "cansado" | "doente" | "sujo" | "dormindo" | "animado" | "morto";

export type EvolutionStage = "ovo" | "bebe" | "filhote" | "jovem" | "adulto";

export type Especie = "dino" | "gato" | "urso" | "coelho";

export type StatKey = "fome" | "felicidade" | "energia" | "higiene" | "saude";

export type MoedaTipo = "moedas" | "gemas";

export interface PetState {
  nome: string;
  especie: Especie;
  fome: number;
  felicidade: number;
  energia: number;
  higiene: number;
  saude: number;
  xp: number;
  nivel: number;
  moedas: number;
  gemas: number;
  dormindo: boolean;
  vivo: boolean;
  itensComprados: string[];
  acessorioEquipadoId: string | null;
  conquistasDesbloqueadas: string[];
  minigamesJogados: number;
  totalAlimentado: number;
  ultimoLoginData: string | null;
  sequenciaDeDias: number;
  cocos: number;
  proximoCocoEm: number;
  totalCocosLimpos: number;
  criadoEm: number;
  atualizadoEm: number;
}

export type FeedbackTipo = "info" | "sucesso" | "alerta" | "erro";

export interface FeedbackMessage {
  id: number;
  texto: string;
  tipo: FeedbackTipo;
}

export interface Comida {
  id: string;
  nome: string;
  icone: string;
  preco: number;
  fome: number;
  felicidade: number;
  xp: number;
}

export type CategoriaItemLoja = "comida" | "roupa" | "acessorio";

export interface ItemLoja {
  id: string;
  nome: string;
  icone: string;
  categoria: CategoriaItemLoja;
  preco: number;
  moeda: MoedaTipo;
  nivelMinimo: number;
  descricao: string;
}

export interface Conquista {
  id: string;
  nome: string;
  descricao: string;
  icone: string;
  recompensaMoedas: number;
  condicao: (pet: PetState) => boolean;
}

export interface ResumoOffline {
  minutosFora: number;
  fomePerdida: number;
  felicidadePerdida: number;
  energiaPerdida: number;
  higienePerdida: number;
  saudePerdida: number;
  cocosNovos: number;
  petMorreu: boolean;
}

export interface RecompensaMiniGame {
  moedas: number;
  xp: number;
  pontuacao: number;
}
