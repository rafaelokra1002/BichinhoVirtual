import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { getStatusRecompensaDiaria, resgatarRecompensaDiaria } from "@/services/dailyRewardService";
import { RECOMPENSA_DIARIA_POR_DIA } from "@/services/gameConfig";
import { criarNovoPet } from "@/services/petService";
import { PetState } from "@/types/pet";

const HOJE = new Date(2026, 0, 15, 12, 0, 0); // 15/jan/2026 ao meio-dia (evita ambiguidade de fuso)

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(HOJE);
});

afterEach(() => {
  vi.useRealTimers();
});

describe("getStatusRecompensaDiaria", () => {
  it("está disponível no primeiro login (nunca resgatado)", () => {
    const pet = criarNovoPet();
    const status = getStatusRecompensaDiaria(pet);
    expect(status.disponivel).toBe(true);
    expect(status.proximoDiaDaSequencia).toBe(1);
  });

  it("fica indisponível se já resgatada hoje", () => {
    const pet: PetState = { ...criarNovoPet(), ultimoLoginData: "2026-01-15", sequenciaDeDias: 3 };
    const status = getStatusRecompensaDiaria(pet);
    expect(status.disponivel).toBe(false);
    expect(status.proximoDiaDaSequencia).toBe(3);
  });

  it("continua a sequência se o último login foi ontem", () => {
    const pet: PetState = { ...criarNovoPet(), ultimoLoginData: "2026-01-14", sequenciaDeDias: 3 };
    const status = getStatusRecompensaDiaria(pet);
    expect(status.disponivel).toBe(true);
    expect(status.proximoDiaDaSequencia).toBe(4);
  });

  it("reinicia a sequência se pulou um ou mais dias", () => {
    const pet: PetState = { ...criarNovoPet(), ultimoLoginData: "2026-01-10", sequenciaDeDias: 5 };
    const status = getStatusRecompensaDiaria(pet);
    expect(status.disponivel).toBe(true);
    expect(status.proximoDiaDaSequencia).toBe(1);
  });

  it("trava a sequência em 7 dias mesmo além disso", () => {
    const pet: PetState = { ...criarNovoPet(), ultimoLoginData: "2026-01-14", sequenciaDeDias: 7 };
    const status = getStatusRecompensaDiaria(pet);
    expect(status.proximoDiaDaSequencia).toBe(7);
  });
});

describe("resgatarRecompensaDiaria", () => {
  it("credita moedas e gemas do dia correspondente e atualiza a sequência", () => {
    const pet = criarNovoPet();
    const resultado = resgatarRecompensaDiaria(pet);
    const recompensaDia1 = RECOMPENSA_DIARIA_POR_DIA[0];

    expect(resultado.ultimoLoginData).toBe("2026-01-15");
    expect(resultado.sequenciaDeDias).toBe(1);
    expect(resultado.moedas).toBe(pet.moedas + recompensaDia1.moedas);
    expect(resultado.gemas).toBe(pet.gemas + recompensaDia1.gemas);
  });

  it("não faz nada se já foi resgatada hoje", () => {
    const pet: PetState = { ...criarNovoPet(), ultimoLoginData: "2026-01-15" };
    expect(resgatarRecompensaDiaria(pet)).toBe(pet);
  });
});
