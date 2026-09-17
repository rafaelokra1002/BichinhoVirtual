import { Comida, Especie, EvolutionStage, PetMood, PetState, ResumoOffline } from "@/types/pet";
import {
  ACTION_EFFECTS,
  CRITICAL_THRESHOLD,
  DECAY_PER_MINUTE,
  ESPECIE_PADRAO,
  MAX_COCOS,
  MAX_STAT,
  MIN_STAT,
  MINUTOS_POR_COCO,
  NIVEL_DO_ESTAGIO,
  NOME_PADRAO_DO_PET,
  OFFLINE_SUMMARY_THRESHOLD_MS,
  PENALIDADE_HIGIENE_POR_COCO,
  SAUDE_PENALTY_PER_MINUTE,
  SLEEP_AUTO_WAKE_ENERGY,
  SLEEP_DECAY_FACTOR,
  SLEEP_ENERGY_RECOVERY_PER_MINUTE,
  XP_PASSIVO_POR_MINUTO,
  xpParaProximoNivel,
} from "./gameConfig";

/** Mantém um valor de atributo dentro da faixa válida (0 a 100). */
export function clamp(valor: number, min: number = MIN_STAT, max: number = MAX_STAT): number {
  return Math.min(max, Math.max(min, valor));
}

/** Cria um novo pet com todos os atributos no máximo, pronto para começar a jogar. */
export function criarNovoPet(nome: string = NOME_PADRAO_DO_PET, especie: Especie = ESPECIE_PADRAO): PetState {
  const agora = Date.now();
  return {
    nome,
    especie,
    fome: MAX_STAT,
    felicidade: MAX_STAT,
    energia: MAX_STAT,
    higiene: MAX_STAT,
    saude: MAX_STAT,
    xp: 0,
    nivel: 1,
    moedas: 30,
    gemas: 3,
    dormindo: false,
    vivo: true,
    itensComprados: [],
    acessorioEquipadoId: null,
    conquistasDesbloqueadas: [],
    minigamesJogados: 0,
    totalAlimentado: 0,
    ultimoLoginData: null,
    sequenciaDeDias: 0,
    cocos: 0,
    proximoCocoEm: agora + MINUTOS_POR_COCO * 60_000,
    totalCocosLimpos: 0,
    criadoEm: agora,
    atualizadoEm: agora,
  };
}

/** Aplica os ganhos de XP acumulados, processando quantos level ups forem necessários. */
function aplicarGanhoDeXp(state: PetState, xpGanho: number): PetState {
  let xp = state.xp + xpGanho;
  let nivel = state.nivel;

  let xpNecessario = xpParaProximoNivel(nivel);
  while (xp >= xpNecessario) {
    xp -= xpNecessario;
    nivel += 1;
    xpNecessario = xpParaProximoNivel(nivel);
  }

  return { ...state, xp, nivel };
}

interface ResultadoPassagemDeTempo {
  state: PetState;
  resumo: ResumoOffline | null;
}

/**
 * Avança o estado do pet de acordo com o tempo real decorrido, em milissegundos.
 * Usado tanto pelo tick periódico quanto para recuperar o progresso perdido
 * enquanto a página estava fechada (baseado no timestamp salvo). Quando o intervalo
 * é longo o bastante (`gerarResumo`), retorna também um resumo do que mudou, para
 * exibir "enquanto você estava fora..." ao jogador.
 */
export function aplicarPassagemDeTempoComResumo(
  state: PetState,
  elapsedMs: number,
  gerarResumo: boolean = false
): ResultadoPassagemDeTempo {
  if (!state.vivo || elapsedMs <= 0) {
    return {
      state: { ...state, atualizadoEm: state.atualizadoEm + Math.max(0, elapsedMs) },
      resumo: null,
    };
  }

  const minutos = elapsedMs / 60_000;
  const fatorDecay = state.dormindo ? SLEEP_DECAY_FACTOR : 1;
  const fimDoIntervalo = state.atualizadoEm + elapsedMs;

  // O pet faz cocô periodicamente enquanto está acordado; cocôs acumulados sujam mais rápido.
  let cocos = state.cocos;
  let proximoCocoEm = state.proximoCocoEm;
  if (!state.dormindo && fimDoIntervalo >= proximoCocoEm) {
    const intervaloCocoMs = MINUTOS_POR_COCO * 60_000;
    const passos = Math.floor((fimDoIntervalo - proximoCocoEm) / intervaloCocoMs) + 1;
    cocos = Math.min(MAX_COCOS, cocos + passos);
    proximoCocoEm += passos * intervaloCocoMs;
  }

  const penalidadeHigienePorCoco = state.cocos * PENALIDADE_HIGIENE_POR_COCO * fatorDecay * minutos;
  const fome = clamp(state.fome - DECAY_PER_MINUTE.fome * fatorDecay * minutos);
  const felicidade = clamp(state.felicidade - DECAY_PER_MINUTE.felicidade * fatorDecay * minutos);
  const higiene = clamp(state.higiene - DECAY_PER_MINUTE.higiene * fatorDecay * minutos - penalidadeHigienePorCoco);

  const energia = state.dormindo
    ? clamp(state.energia + SLEEP_ENERGY_RECOVERY_PER_MINUTE * minutos)
    : clamp(state.energia - DECAY_PER_MINUTE.energia * minutos);

  const atributosCriticos = [fome, felicidade, energia, higiene].filter(
    (valor) => valor <= CRITICAL_THRESHOLD
  ).length;

  const penalidadeSaude = atributosCriticos * SAUDE_PENALTY_PER_MINUTE * minutos;
  const saude = clamp(state.saude - DECAY_PER_MINUTE.saude * minutos - penalidadeSaude);

  const dormindo = state.dormindo && energia < SLEEP_AUTO_WAKE_ENERGY;

  let novoState: PetState = {
    ...state,
    fome,
    felicidade,
    energia,
    higiene,
    saude,
    dormindo,
    cocos,
    proximoCocoEm,
    atualizadoEm: state.atualizadoEm + elapsedMs,
  };

  const petMorreu = saude <= MIN_STAT;
  if (petMorreu) {
    novoState = { ...novoState, saude: MIN_STAT, vivo: false };
  } else {
    novoState = aplicarGanhoDeXp(novoState, XP_PASSIVO_POR_MINUTO * minutos);
  }

  const resumo: ResumoOffline | null =
    gerarResumo && elapsedMs >= OFFLINE_SUMMARY_THRESHOLD_MS
      ? {
          minutosFora: Math.round(minutos),
          fomePerdida: Math.round(state.fome - fome),
          felicidadePerdida: Math.round(state.felicidade - felicidade),
          energiaPerdida: Math.round(Math.max(0, state.energia - energia)),
          higienePerdida: Math.round(state.higiene - higiene),
          saudePerdida: Math.round(state.saude - saude),
          cocosNovos: cocos - state.cocos,
          petMorreu,
        }
      : null;

  return { state: novoState, resumo };
}

/** Variante simples, sem gerar resumo — usada no tick periódico do jogo. */
export function aplicarPassagemDeTempo(state: PetState, elapsedMs: number): PetState {
  return aplicarPassagemDeTempoComResumo(state, elapsedMs, false).state;
}

type EfeitoAcao = Partial<Record<"fome" | "felicidade" | "energia" | "higiene" | "saude", number>>;

function comAcao(state: PetState, efeitos: EfeitoAcao, xp: number): PetState {
  const atualizado: PetState = {
    ...state,
    fome: clamp(state.fome + (efeitos.fome ?? 0)),
    felicidade: clamp(state.felicidade + (efeitos.felicidade ?? 0)),
    energia: clamp(state.energia + (efeitos.energia ?? 0)),
    higiene: clamp(state.higiene + (efeitos.higiene ?? 0)),
    saude: clamp(state.saude + (efeitos.saude ?? 0)),
    atualizadoEm: Date.now(),
  };

  return aplicarGanhoDeXp(atualizado, xp);
}

/** Alimenta o pet com a comida escolhida: reduz a fome (sacia) e aumenta a felicidade. */
export function alimentar(state: PetState, comida: Comida): PetState {
  if (!state.vivo || state.dormindo) return state;
  const atualizado = comAcao(state, { fome: comida.fome, felicidade: comida.felicidade }, comida.xp);
  return { ...atualizado, totalAlimentado: state.totalAlimentado + 1 };
}

/** Brinca com o pet: aumenta a felicidade, mas consome energia. */
export function brincar(state: PetState): PetState {
  if (!state.vivo || state.dormindo) return state;
  const { felicidade, energia, xp } = ACTION_EFFECTS.brincar;
  return comAcao(state, { felicidade, energia }, xp);
}

/** Dá banho no pet: recupera higiene. */
export function banhar(state: PetState): PetState {
  if (!state.vivo || state.dormindo) return state;
  const { higiene, felicidade, xp } = ACTION_EFFECTS.banhar;
  return comAcao(state, { higiene, felicidade }, xp);
}

/** Cura o pet: recupera saúde. */
export function curar(state: PetState): PetState {
  if (!state.vivo) return state;
  const { saude, xp } = ACTION_EFFECTS.curar;
  return comAcao(state, { saude }, xp);
}

/** Faz carinho no pet: pequeno aumento de felicidade. Gratuito e permitido mesmo dormindo. */
export function acariciar(state: PetState): PetState {
  if (!state.vivo) return state;
  const { felicidade, xp } = ACTION_EFFECTS.carinho;
  return comAcao(state, { felicidade }, xp);
}

/** Limpa um cocô: some com um dos acumulados e recupera um pouco de higiene. */
export function limparUmCoco(state: PetState): PetState {
  if (!state.vivo || state.cocos <= 0) return state;
  const { higiene, xp } = ACTION_EFFECTS.limparCoco;
  const atualizado = comAcao(state, { higiene }, xp);
  return { ...atualizado, cocos: state.cocos - 1, totalCocosLimpos: state.totalCocosLimpos + 1 };
}

/** Coloca o pet para dormir, para recuperar energia com o tempo. */
export function dormir(state: PetState): PetState {
  if (!state.vivo || state.dormindo) return state;
  return { ...state, dormindo: true, atualizadoEm: Date.now() };
}

/** Acorda o pet manualmente antes da recuperação total de energia. */
export function acordar(state: PetState): PetState {
  if (!state.vivo || !state.dormindo) return state;
  return { ...state, dormindo: false, atualizadoEm: Date.now() };
}

/** Aplica a recompensa (moedas + XP) ganha em um minigame. */
export function receberRecompensaDeMinigame(state: PetState, moedas: number, xp: number): PetState {
  if (!state.vivo) return state;
  const atualizado = aplicarGanhoDeXp(
    { ...state, moedas: state.moedas + moedas, atualizadoEm: Date.now() },
    xp
  );
  return { ...atualizado, minigamesJogados: state.minigamesJogados + 1 };
}

/** Deriva o humor atual do pet a partir dos seus atributos. */
export function getHumor(state: PetState): PetMood {
  if (!state.vivo) return "morto";
  if (state.dormindo) return "dormindo";
  if (state.saude <= CRITICAL_THRESHOLD) return "doente";
  if (state.higiene <= CRITICAL_THRESHOLD) return "sujo";
  if (state.energia <= CRITICAL_THRESHOLD) return "cansado";
  if (state.fome <= CRITICAL_THRESHOLD || state.felicidade <= CRITICAL_THRESHOLD) return "triste";
  return "feliz";
}

/** Deriva o estágio de evolução do pet a partir do nível atual. */
export function getEstagioEvolucao(nivel: number): EvolutionStage {
  if (nivel >= NIVEL_DO_ESTAGIO.adulto) return "adulto";
  if (nivel >= NIVEL_DO_ESTAGIO.jovem) return "jovem";
  if (nivel >= NIVEL_DO_ESTAGIO.filhote) return "filhote";
  if (nivel >= NIVEL_DO_ESTAGIO.bebe) return "bebe";
  return "ovo";
}

export function getXpNecessarioParaProximoNivel(nivel: number): number {
  return xpParaProximoNivel(nivel);
}
