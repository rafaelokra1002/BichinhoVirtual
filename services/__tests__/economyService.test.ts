import { describe, expect, it } from "vitest";
import { comprarItem, equiparItem, processarCompraSimuladaDeGemas } from "@/services/economyService";
import { criarNovoPet } from "@/services/petService";
import { ItemLoja, PetState } from "@/types/pet";

const ITEM_TESTE: ItemLoja = {
  id: "oculos",
  nome: "Óculos Escuros",
  icone: "🕶️",
  categoria: "acessorio",
  preco: 20,
  moeda: "moedas",
  nivelMinimo: 1,
  descricao: "teste",
};

describe("comprarItem", () => {
  it("compra com sucesso, debita o saldo e adiciona ao inventário", () => {
    const pet: PetState = { ...criarNovoPet(), moedas: 50 };
    const resultado = comprarItem(pet, ITEM_TESTE);

    expect(resultado.sucesso).toBe(true);
    expect(resultado.state.moedas).toBe(30);
    expect(resultado.state.itensComprados).toContain(ITEM_TESTE.id);
  });

  it("recusa por saldo insuficiente sem alterar o estado", () => {
    const pet: PetState = { ...criarNovoPet(), moedas: 5 };
    const resultado = comprarItem(pet, ITEM_TESTE);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.motivo).toBe("saldo_insuficiente");
    expect(resultado.state).toBe(pet);
  });

  it("recusa por nível insuficiente", () => {
    const pet: PetState = { ...criarNovoPet(), moedas: 100, nivel: 1 };
    const itemDeNivelAlto: ItemLoja = { ...ITEM_TESTE, nivelMinimo: 5 };
    const resultado = comprarItem(pet, itemDeNivelAlto);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.motivo).toBe("nivel_insuficiente");
  });

  it("recusa comprar um item que já possui", () => {
    const pet: PetState = { ...criarNovoPet(), moedas: 100, itensComprados: [ITEM_TESTE.id] };
    const resultado = comprarItem(pet, ITEM_TESTE);

    expect(resultado.sucesso).toBe(false);
    expect(resultado.motivo).toBe("ja_possui");
  });

  it("usa o saldo de gemas quando o item é premium", () => {
    const itemPremium: ItemLoja = { ...ITEM_TESTE, id: "coroa", moeda: "gemas", preco: 10 };
    const pet: PetState = { ...criarNovoPet(), gemas: 15, moedas: 0 };
    const resultado = comprarItem(pet, itemPremium);

    expect(resultado.sucesso).toBe(true);
    expect(resultado.state.gemas).toBe(5);
    expect(resultado.state.moedas).toBe(0);
  });
});

describe("equiparItem", () => {
  it("equipa um item já comprado", () => {
    const pet: PetState = { ...criarNovoPet(), itensComprados: [ITEM_TESTE.id] };
    expect(equiparItem(pet, ITEM_TESTE.id).acessorioEquipadoId).toBe(ITEM_TESTE.id);
  });

  it("ignora tentativa de equipar item não comprado", () => {
    const pet = criarNovoPet();
    expect(equiparItem(pet, ITEM_TESTE.id)).toBe(pet);
  });

  it("permite desequipar passando null", () => {
    const pet: PetState = { ...criarNovoPet(), itensComprados: [ITEM_TESTE.id], acessorioEquipadoId: ITEM_TESTE.id };
    expect(equiparItem(pet, null).acessorioEquipadoId).toBeNull();
  });
});

describe("processarCompraSimuladaDeGemas", () => {
  it("credita a quantidade de gemas do pacote", () => {
    const pet: PetState = { ...criarNovoPet(), gemas: 3 };
    const resultado = processarCompraSimuladaDeGemas(pet, { id: "gemas_p", gemas: 20, precoExibido: "R$ 2,90" });
    expect(resultado.gemas).toBe(23);
  });
});
