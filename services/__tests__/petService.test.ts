import { describe, expect, it } from "vitest";
import {
  acariciar,
  acordar,
  alimentar,
  aplicarPassagemDeTempo,
  aplicarPassagemDeTempoComResumo,
  banhar,
  brincar,
  clamp,
  criarNovoPet,
  curar,
  dormir,
  getEstagioEvolucao,
  getHumor,
  limparUmCoco,
  receberRecompensaDeMinigame,
} from "@/services/petService";
import { CRITICAL_THRESHOLD, DECAY_PER_MINUTE, MAX_STAT, NIVEL_DO_ESTAGIO, SLEEP_DECAY_FACTOR } from "@/services/gameConfig";
import { Comida, PetState } from "@/types/pet";

const COMIDA_TESTE: Comida = { id: "racao", nome: "Ração", icone: "🥣", preco: 0, fome: 20, felicidade: 2, xp: 4 };

describe("clamp", () => {
  it("mantém o valor dentro da faixa padrão (0-100)", () => {
    expect(clamp(150)).toBe(100);
    expect(clamp(-10)).toBe(0);
    expect(clamp(42)).toBe(42);
  });
});

describe("criarNovoPet", () => {
  it("começa vivo, com atributos no máximo e nível 1", () => {
    const pet = criarNovoPet("Rex", "dino");
    expect(pet.vivo).toBe(true);
    expect(pet.nivel).toBe(1);
    expect(pet.fome).toBe(MAX_STAT);
    expect(pet.saude).toBe(MAX_STAT);
    expect(pet.nome).toBe("Rex");
    expect(pet.especie).toBe("dino");
  });
});

describe("ações do pet", () => {
  const petBase = criarNovoPet("Rex", "dino");

  it("alimentar reduz a fome ganha, aumenta felicidade e conta a refeição", () => {
    const faminto: PetState = { ...petBase, fome: 50, felicidade: 50 };
    const alimentado = alimentar(faminto, COMIDA_TESTE);
    expect(alimentado.fome).toBe(70);
    expect(alimentado.felicidade).toBe(52);
    expect(alimentado.totalAlimentado).toBe(1);
  });

  it("alimentar não faz nada se o pet estiver dormindo ou morto", () => {
    const dormindo: PetState = { ...petBase, dormindo: true };
    expect(alimentar(dormindo, COMIDA_TESTE)).toBe(dormindo);

    const morto: PetState = { ...petBase, vivo: false };
    expect(alimentar(morto, COMIDA_TESTE)).toBe(morto);
  });

  it("brincar aumenta felicidade e consome energia", () => {
    const resultado = brincar(petBase);
    expect(resultado.felicidade).toBe(MAX_STAT); // já estava no máximo, clampado
    expect(resultado.energia).toBe(MAX_STAT - 15);
  });

  it("banhar e curar respeitam o clamp em 100", () => {
    expect(banhar(petBase).higiene).toBe(MAX_STAT);
    expect(curar(petBase).saude).toBe(MAX_STAT);
  });

  it("acariciar funciona mesmo com o pet dormindo", () => {
    const dormindo: PetState = { ...petBase, dormindo: true, felicidade: 50 };
    expect(acariciar(dormindo).felicidade).toBe(58);
  });

  it("dormir e acordar alternam a flag e não têm efeito quando já no estado alvo", () => {
    const acordado = dormir(petBase);
    expect(acordado.dormindo).toBe(true);
    expect(dormir(acordado)).toBe(acordado);

    const desperto = acordar(acordado);
    expect(desperto.dormindo).toBe(false);
    expect(acordar(petBase)).toBe(petBase);
  });

  it("limparUmCoco remove um cocô e não faz nada se não houver nenhum", () => {
    const sujo: PetState = { ...petBase, cocos: 2, higiene: 50 };
    const limpo = limparUmCoco(sujo);
    expect(limpo.cocos).toBe(1);
    expect(limpo.totalCocosLimpos).toBe(1);
    expect(limpo.higiene).toBe(55);

    const semCoco: PetState = { ...petBase, cocos: 0 };
    expect(limparUmCoco(semCoco)).toBe(semCoco);
  });

  it("receberRecompensaDeMinigame credita moedas, xp e conta o jogo", () => {
    const resultado = receberRecompensaDeMinigame(petBase, 10, 250);
    expect(resultado.moedas).toBe(petBase.moedas + 10);
    expect(resultado.minigamesJogados).toBe(1);
    // 250 xp: consome 100 pro nível 2 (xpParaProximoNivel(1)), sobram 150 (< 200 p/ nível 3)
    expect(resultado.nivel).toBe(2);
    expect(resultado.xp).toBe(150);
  });
});

describe("getHumor", () => {
  const petBase = criarNovoPet();

  it("prioriza morto > dormindo > doente > sujo > cansado > triste > feliz", () => {
    expect(getHumor({ ...petBase, vivo: false })).toBe("morto");
    expect(getHumor({ ...petBase, dormindo: true })).toBe("dormindo");
    expect(getHumor({ ...petBase, saude: CRITICAL_THRESHOLD })).toBe("doente");
    expect(getHumor({ ...petBase, higiene: CRITICAL_THRESHOLD })).toBe("sujo");
    expect(getHumor({ ...petBase, energia: CRITICAL_THRESHOLD })).toBe("cansado");
    expect(getHumor({ ...petBase, fome: CRITICAL_THRESHOLD })).toBe("triste");
    expect(getHumor(petBase)).toBe("feliz");
  });
});

describe("getEstagioEvolucao", () => {
  it("mapeia o nível para o estágio correto", () => {
    expect(getEstagioEvolucao(1)).toBe("ovo");
    expect(getEstagioEvolucao(NIVEL_DO_ESTAGIO.bebe)).toBe("bebe");
    expect(getEstagioEvolucao(NIVEL_DO_ESTAGIO.filhote)).toBe("filhote");
    expect(getEstagioEvolucao(NIVEL_DO_ESTAGIO.jovem)).toBe("jovem");
    expect(getEstagioEvolucao(NIVEL_DO_ESTAGIO.adulto)).toBe("adulto");
    expect(getEstagioEvolucao(999)).toBe("adulto");
  });
});

describe("aplicarPassagemDeTempo", () => {
  it("decai os atributos proporcionalmente ao tempo decorrido", () => {
    const pet = criarNovoPet();
    const dezMinutosMs = 10 * 60_000;
    const resultado = aplicarPassagemDeTempo(pet, dezMinutosMs);

    expect(resultado.fome).toBeCloseTo(MAX_STAT - DECAY_PER_MINUTE.fome * 10);
    expect(resultado.energia).toBeCloseTo(MAX_STAT - DECAY_PER_MINUTE.energia * 10);
    expect(resultado.vivo).toBe(true);
  });

  it("decai bem mais devagar enquanto dormindo, e recupera energia", () => {
    const pet: PetState = { ...criarNovoPet(), dormindo: true, energia: 50 };
    const dezMinutosMs = 10 * 60_000;
    const resultado = aplicarPassagemDeTempo(pet, dezMinutosMs);

    expect(resultado.energia).toBe(MAX_STAT); // recupera 14/min, clamped a 100
    expect(resultado.fome).toBeCloseTo(MAX_STAT - DECAY_PER_MINUTE.fome * SLEEP_DECAY_FACTOR * 10, 5);
  });

  it("acorda automaticamente quando a energia enche dormindo", () => {
    const pet: PetState = { ...criarNovoPet(), dormindo: true, energia: 95 };
    const resultado = aplicarPassagemDeTempo(pet, 10 * 60_000);
    expect(resultado.energia).toBe(MAX_STAT);
    expect(resultado.dormindo).toBe(false);
  });

  it("mata o pet quando a saúde chega a zero por negligência prolongada", () => {
    const pet: PetState = {
      ...criarNovoPet(),
      fome: 0,
      felicidade: 0,
      energia: 0,
      higiene: 0,
      saude: 5,
    };
    // vários atributos críticos por muito tempo corroem a saúde até matar o pet
    const resultado = aplicarPassagemDeTempo(pet, 60 * 60_000);
    expect(resultado.vivo).toBe(false);
    expect(resultado.saude).toBe(0);
  });

  it("não altera o estado (além do timestamp) quando o pet já está morto", () => {
    const petMorto: PetState = { ...criarNovoPet(), vivo: false, saude: 0 };
    const resultado = aplicarPassagemDeTempo(petMorto, 5 * 60_000);
    expect(resultado.fome).toBe(petMorto.fome);
    expect(resultado.vivo).toBe(false);
  });

  it("gera um resumo apenas quando o intervalo passa do limiar e solicitado", () => {
    const pet = criarNovoPet();
    const { resumo: semResumo } = aplicarPassagemDeTempoComResumo(pet, 30_000, true);
    expect(semResumo).toBeNull();

    const { resumo } = aplicarPassagemDeTempoComResumo(pet, 5 * 60_000, true);
    expect(resumo).not.toBeNull();
    expect(resumo?.minutosFora).toBe(5);
    expect(resumo?.petMorreu).toBe(false);
  });
});
