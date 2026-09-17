import { ItemLoja, MoedaTipo, PetState } from "@/types/pet";
import { PacoteDeGemas } from "./gameConfig";

export interface ResultadoCompra {
  sucesso: boolean;
  motivo?: "saldo_insuficiente" | "nivel_insuficiente" | "ja_possui";
  state: PetState;
}

function saldoDe(state: PetState, moeda: MoedaTipo): number {
  return moeda === "moedas" ? state.moedas : state.gemas;
}

function comSaldoAtualizado(state: PetState, moeda: MoedaTipo, delta: number): PetState {
  return moeda === "moedas"
    ? { ...state, moedas: state.moedas + delta }
    : { ...state, gemas: state.gemas + delta };
}

/** Compra um item da loja (roupa, acessório ou comida especial) com moedas ou gemas. */
export function comprarItem(state: PetState, item: ItemLoja): ResultadoCompra {
  if (state.itensComprados.includes(item.id)) {
    return { sucesso: false, motivo: "ja_possui", state };
  }
  if (state.nivel < item.nivelMinimo) {
    return { sucesso: false, motivo: "nivel_insuficiente", state };
  }
  if (saldoDe(state, item.moeda) < item.preco) {
    return { sucesso: false, motivo: "saldo_insuficiente", state };
  }

  const atualizado = comSaldoAtualizado(state, item.moeda, -item.preco);
  return {
    sucesso: true,
    state: {
      ...atualizado,
      itensComprados: [...state.itensComprados, item.id],
      atualizadoEm: Date.now(),
    },
  };
}

/** Equipa (ou remove, passando null) um acessório/roupa já comprado. */
export function equiparItem(state: PetState, itemId: string | null): PetState {
  if (itemId !== null && !state.itensComprados.includes(itemId)) return state;
  return { ...state, acessorioEquipadoId: itemId };
}

/**
 * Credita um pacote de gemas comprado. Não processa nenhum pagamento real — é uma
 * simulação da vitrine de compras, pensada para plugar um SDK de pagamento (Google
 * Play Billing / App Store / RevenueCat via Capacitor) no lugar desta função no futuro.
 */
export function processarCompraSimuladaDeGemas(state: PetState, pacote: PacoteDeGemas): PetState {
  return { ...state, gemas: state.gemas + pacote.gemas, atualizadoEm: Date.now() };
}
