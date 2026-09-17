import { Conquista, PetState } from "@/types/pet";
import { LISTA_DE_CONQUISTAS } from "./gameConfig";

export interface ResultadoConquistas {
  state: PetState;
  desbloqueadasAgora: Conquista[];
}

/**
 * Verifica todas as conquistas ainda não desbloqueadas e libera (+ credita moedas) as
 * que tiveram sua condição satisfeita pelo estado atual do pet.
 */
export function verificarConquistas(state: PetState): ResultadoConquistas {
  const desbloqueadasAgora: Conquista[] = [];
  let moedasGanhas = 0;

  for (const conquista of LISTA_DE_CONQUISTAS) {
    if (state.conquistasDesbloqueadas.includes(conquista.id)) continue;
    if (conquista.condicao(state)) {
      desbloqueadasAgora.push(conquista);
      moedasGanhas += conquista.recompensaMoedas;
    }
  }

  if (desbloqueadasAgora.length === 0) {
    return { state, desbloqueadasAgora };
  }

  return {
    state: {
      ...state,
      moedas: state.moedas + moedasGanhas,
      conquistasDesbloqueadas: [
        ...state.conquistasDesbloqueadas,
        ...desbloqueadasAgora.map((c) => c.id),
      ],
    },
    desbloqueadasAgora,
  };
}

export function getTodasAsConquistas(): Conquista[] {
  return LISTA_DE_CONQUISTAS;
}
