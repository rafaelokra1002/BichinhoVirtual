import { PetState } from "@/types/pet";
import { RECOMPENSA_DIARIA_POR_DIA } from "./gameConfig";

function formatarDataLocal(data: Date): string {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function dataLocalDeHoje(): string {
  return formatarDataLocal(new Date());
}

/**
 * Compara `dataSalva` com o dia anterior a `hoje` (ambos "YYYY-MM-DD").
 * Importante: `new Date("YYYY-MM-DD")` interpreta a string como UTC, então
 * lê-la de volta com getters locais (`getDate` etc.) desloca o dia em fusos
 * horários atrás de UTC — Brasil incluso. Por isso construímos a data com os
 * componentes numéricos (ano, mês, dia), que o construtor de `Date` sempre
 * interpreta em horário local.
 */
function eraOntem(dataSalva: string, hoje: string): boolean {
  const [ano, mes, dia] = hoje.split("-").map(Number);
  const ontem = new Date(ano, mes - 1, dia - 1);
  return dataSalva === formatarDataLocal(ontem);
}

export interface StatusRecompensaDiaria {
  disponivel: boolean;
  proximoDiaDaSequencia: number;
}

/** Indica se há uma recompensa diária para resgatar hoje, e a qual dia da sequência (1 a 7) ela corresponde. */
export function getStatusRecompensaDiaria(state: PetState): StatusRecompensaDiaria {
  const hoje = dataLocalDeHoje();

  if (state.ultimoLoginData === hoje) {
    return { disponivel: false, proximoDiaDaSequencia: Math.min(state.sequenciaDeDias, 7) || 1 };
  }

  const continuaSequencia = state.ultimoLoginData !== null && eraOntem(state.ultimoLoginData, hoje);
  const proximaSequencia = continuaSequencia ? state.sequenciaDeDias + 1 : 1;

  return { disponivel: true, proximoDiaDaSequencia: Math.min(proximaSequencia, 7) };
}

/** Resgata a recompensa diária, atualizando a sequência e o saldo do jogador. */
export function resgatarRecompensaDiaria(state: PetState): PetState {
  const hoje = dataLocalDeHoje();
  const { disponivel, proximoDiaDaSequencia } = getStatusRecompensaDiaria(state);
  if (!disponivel) return state;

  const continuaSequencia = state.ultimoLoginData !== null && eraOntem(state.ultimoLoginData, hoje);
  const novaSequencia = continuaSequencia ? state.sequenciaDeDias + 1 : 1;
  const recompensa = RECOMPENSA_DIARIA_POR_DIA[proximoDiaDaSequencia - 1];

  return {
    ...state,
    ultimoLoginData: hoje,
    sequenciaDeDias: novaSequencia,
    moedas: state.moedas + recompensa.moedas,
    gemas: state.gemas + recompensa.gemas,
  };
}
