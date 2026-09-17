import { describe, expect, it } from "vitest";
import { verificarConquistas } from "@/services/achievementService";
import { criarNovoPet } from "@/services/petService";
import { PetState } from "@/types/pet";

describe("verificarConquistas", () => {
  it("não desbloqueia nada quando nenhuma condição é satisfeita", () => {
    const pet = criarNovoPet();
    const resultado = verificarConquistas(pet);

    expect(resultado.desbloqueadasAgora).toHaveLength(0);
    expect(resultado.state).toBe(pet);
  });

  it("desbloqueia e credita moedas quando a condição é satisfeita", () => {
    const pet: PetState = { ...criarNovoPet(), totalAlimentado: 1 };
    const resultado = verificarConquistas(pet);

    expect(resultado.desbloqueadasAgora.map((c) => c.id)).toContain("primeira_refeicao");
    expect(resultado.state.conquistasDesbloqueadas).toContain("primeira_refeicao");
    expect(resultado.state.moedas).toBe(pet.moedas + 10);
  });

  it("não desbloqueia de novo uma conquista já obtida", () => {
    const pet: PetState = {
      ...criarNovoPet(),
      totalAlimentado: 1,
      conquistasDesbloqueadas: ["primeira_refeicao"],
    };
    const resultado = verificarConquistas(pet);

    expect(resultado.desbloqueadasAgora).toHaveLength(0);
  });

  it("desbloqueia várias conquistas de uma vez e soma as recompensas", () => {
    const pet: PetState = {
      ...criarNovoPet(),
      totalAlimentado: 1,
      nivel: 5,
      minigamesJogados: 10,
    };
    const resultado = verificarConquistas(pet);
    const idsDesbloqueados = resultado.desbloqueadasAgora.map((c) => c.id);

    expect(idsDesbloqueados).toEqual(
      expect.arrayContaining(["primeira_refeicao", "cuidador_dedicado", "mestre_dos_minigames"])
    );
    const somaEsperada = resultado.desbloqueadasAgora.reduce((soma, c) => soma + c.recompensaMoedas, 0);
    expect(resultado.state.moedas).toBe(pet.moedas + somaEsperada);
  });
});
