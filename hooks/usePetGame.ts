"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Comida,
  Especie,
  FeedbackMessage,
  FeedbackTipo,
  ItemLoja,
  PetState,
  ResumoOffline,
  StatKey,
} from "@/types/pet";
import {
  CRITICAL_THRESHOLD,
  FALAS_POR_ESTADO,
  INTERVALO_FALA_MS,
  NOME_PADRAO_DO_PET,
  PacoteDeGemas,
  TICK_INTERVAL_MS,
} from "@/services/gameConfig";
import {
  acariciar,
  acordar,
  alimentar,
  aplicarPassagemDeTempo,
  aplicarPassagemDeTempoComResumo,
  banhar,
  brincar,
  criarNovoPet,
  curar,
  dormir,
  getEstagioEvolucao,
  getHumor,
  getXpNecessarioParaProximoNivel,
  limparUmCoco,
  receberRecompensaDeMinigame,
} from "@/services/petService";
import {
  ResultadoAuth,
  UsuarioAutenticado,
  buscarPet,
  entrar as entrarNaApi,
  registrar as registrarNaApi,
  sair as sairNaApi,
  salvarPetNoServidor,
  sessaoAtual,
} from "@/services/apiClient";
import { comprarItem, equiparItem, processarCompraSimuladaDeGemas } from "@/services/economyService";
import { verificarConquistas } from "@/services/achievementService";
import { getStatusRecompensaDiaria, resgatarRecompensaDiaria as resgatarNoService } from "@/services/dailyRewardService";
import { useSound } from "./useSound";

const AVISOS_CRITICOS: Record<StatKey, string> = {
  fome: "Seu pet está com fome!",
  felicidade: "Seu pet está triste, que tal brincar um pouco?",
  energia: "Seu pet está exausto, deixe-o dormir.",
  higiene: "Seu pet está sujo, hora do banho!",
  saude: "Seu pet está doente e precisa de cuidados!",
};

const INTERVALO_MIN_SALVAMENTO_MS = 10_000;

let proximoIdDeFeedback = 1;

/**
 * Importante: nenhuma função passada como argumento para um `set...` (updater form)
 * neste hook deve ter efeitos colaterais (emitirFeedback, som.tocar etc). O React
 * Strict Mode chama essas funções duas vezes em desenvolvimento para checar pureza,
 * o que duplicaria toasts e sons. Por isso as ações abaixo leem `pet` direto do
 * closure e chamam `setPet` só com o valor final já calculado.
 */
export function usePetGame() {
  const [usuario, setUsuario] = useState<UsuarioAutenticado | null>(null);
  const [verificandoSessao, setVerificandoSessao] = useState(true);
  const [carregandoPet, setCarregandoPet] = useState(false);

  const [pet, setPet] = useState<PetState | null>(null);
  const [mensagens, setMensagens] = useState<FeedbackMessage[]>([]);
  const [resumoOffline, setResumoOffline] = useState<ResumoOffline | null>(null);
  const [mostrarRecompensaDiaria, setMostrarRecompensaDiaria] = useState(false);
  const [falaAtual, setFalaAtual] = useState<string | null>(null);
  const avisosEnviados = useRef<Set<StatKey>>(new Set());
  const petRef = useRef<PetState | null>(null);
  const ultimoSalvamentoRef = useRef(0);
  const timeoutSalvamentoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const som = useSound();

  useEffect(() => {
    petRef.current = pet;
  }, [pet]);

  const emitirFeedback = useCallback((texto: string, tipo: FeedbackTipo = "info") => {
    const id = proximoIdDeFeedback++;
    setMensagens((atual) => [...atual, { id, texto, tipo }]);
    setTimeout(() => {
      setMensagens((atual) => atual.filter((m) => m.id !== id));
    }, 4000);
  }, []);

  /** Busca o pet do usuário logado no servidor e recupera o tempo perdido offline. */
  const carregarPetDoUsuario = useCallback(async () => {
    setCarregandoPet(true);
    const petDoServidor = await buscarPet();

    if (!petDoServidor) {
      setPet(null);
      setCarregandoPet(false);
      return;
    }

    const decorrido = Date.now() - petDoServidor.atualizadoEm;
    const { state, resumo } = aplicarPassagemDeTempoComResumo(petDoServidor, decorrido, true);

    setPet(state);
    if (resumo) setResumoOffline(resumo);
    if (getStatusRecompensaDiaria(state).disponivel) setMostrarRecompensaDiaria(true);
    setCarregandoPet(false);
  }, []);

  // Ao montar, confere se já existe uma sessão válida (cookie) e, se houver, carrega o pet.
  useEffect(() => {
    (async () => {
      const usuarioAtual = await sessaoAtual();
      setUsuario(usuarioAtual);
      setVerificandoSessao(false);
      if (usuarioAtual) await carregarPetDoUsuario();
    })();
  }, [carregarPetDoUsuario]);

  // Loop de tempo real: a cada tick, avança o estado com base no tempo real decorrido.
  // Usa a forma funcional de `setPet` (sem efeitos colaterais dentro dela) para sempre
  // partir do estado mais recente, sem depender de re-renderizações.
  useEffect(() => {
    const intervalo = setInterval(() => {
      setPet((atual) => {
        if (!atual) return atual;
        const agora = Date.now();
        const decorrido = agora - atual.atualizadoEm;
        return aplicarPassagemDeTempo(atual, decorrido);
      });
    }, TICK_INTERVAL_MS);

    return () => clearInterval(intervalo);
  }, []);

  // Salva no servidor a cada mudança de estado, mas no máximo 1x a cada ~10s (throttle
  // de borda final): evita bater no banco a cada tick de 3s sem perder mudanças recentes.
  useEffect(() => {
    if (!pet || !usuario) return;

    const agora = Date.now();
    const decorrido = agora - ultimoSalvamentoRef.current;

    const salvarAgora = () => {
      ultimoSalvamentoRef.current = Date.now();
      salvarPetNoServidor(pet);
    };

    if (decorrido >= INTERVALO_MIN_SALVAMENTO_MS) {
      salvarAgora();
    } else {
      if (timeoutSalvamentoRef.current) clearTimeout(timeoutSalvamentoRef.current);
      timeoutSalvamentoRef.current = setTimeout(salvarAgora, INTERVALO_MIN_SALVAMENTO_MS - decorrido);
    }

    return () => {
      if (timeoutSalvamentoRef.current) clearTimeout(timeoutSalvamentoRef.current);
    };
  }, [pet, usuario]);

  // Garante que a última mudança seja salva ao trocar de aba ou fechar a página
  // (keepalive mantém a requisição viva mesmo com a página sendo descartada).
  useEffect(() => {
    if (!usuario) return;

    const salvarAoOcultar = () => {
      if (document.visibilityState === "hidden" && petRef.current) {
        salvarPetNoServidor(petRef.current, true);
      }
    };

    document.addEventListener("visibilitychange", salvarAoOcultar);
    window.addEventListener("pagehide", salvarAoOcultar);
    return () => {
      document.removeEventListener("visibilitychange", salvarAoOcultar);
      window.removeEventListener("pagehide", salvarAoOcultar);
    };
  }, [usuario]);

  // Verifica conquistas sempre que o estado do pet muda; concede moedas e avisa o jogador.
  // Só dispara em transições reais de `pet` (não é reinvocado à toa pelo Strict Mode).
  useEffect(() => {
    if (!pet || !pet.vivo) return;
    const resultado = verificarConquistas(pet);
    if (resultado.desbloqueadasAgora.length === 0) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect -- concede a recompensa das conquistas recém-satisfeitas
    setPet(resultado.state);
    resultado.desbloqueadasAgora.forEach((conquista) => {
      emitirFeedback(`Conquista desbloqueada: ${conquista.nome}! +${conquista.recompensaMoedas} moedas`, "sucesso");
    });
    som.tocar("levelUp");
  }, [pet, emitirFeedback, som]);

  // Avisos de atributos críticos (uma vez por queda abaixo do limite).
  useEffect(() => {
    if (!pet || !pet.vivo) return;

    (Object.keys(AVISOS_CRITICOS) as StatKey[]).forEach((chave) => {
      const valor = pet[chave];
      const jaAvisado = avisosEnviados.current.has(chave);

      if (valor <= CRITICAL_THRESHOLD && !jaAvisado) {
        avisosEnviados.current.add(chave);
        emitirFeedback(AVISOS_CRITICOS[chave], "alerta");
      } else if (valor > CRITICAL_THRESHOLD && jaAvisado) {
        avisosEnviados.current.delete(chave);
      }
    });
  }, [pet, emitirFeedback]);

  // Pet fala sozinho de vez em quando, convidando o jogador a interagir (retenção).
  // Lê o pet mais recente via ref (não via `setPet`) para não rodar dentro de um updater.
  useEffect(() => {
    const intervalo = setInterval(() => {
      const atual = petRef.current;
      if (!atual || !atual.vivo || atual.dormindo) return;
      if (document.visibilityState !== "visible") return;

      const categoriasCriticas: (keyof typeof FALAS_POR_ESTADO)[] = (
        ["fome", "felicidade", "higiene", "energia", "saude"] as const
      ).filter((chave) => atual[chave] <= CRITICAL_THRESHOLD);

      const categoria = categoriasCriticas[0] ?? "feliz";
      const opcoes = FALAS_POR_ESTADO[categoria];
      const fala = opcoes[Math.floor(Math.random() * opcoes.length)];

      setFalaAtual(fala);
      setTimeout(() => setFalaAtual(null), 6000);
    }, INTERVALO_FALA_MS);

    return () => clearInterval(intervalo);
  }, []);

  const executarAcao = useCallback(
    (acao: (state: PetState) => PetState, mensagemSucesso: string, mensagemBloqueio?: string) => {
      if (!pet) return;

      if (!pet.vivo) {
        emitirFeedback("Seu pet não está mais aqui. Comece um novo cuidado.", "erro");
        return;
      }
      if (pet.dormindo && mensagemBloqueio) {
        emitirFeedback(mensagemBloqueio, "alerta");
        return;
      }

      const proximo = acao(pet);
      if (proximo !== pet) {
        setPet(proximo);
        emitirFeedback(mensagemSucesso, "sucesso");
        som.tocar("sucesso");
      }
    },
    [pet, emitirFeedback, som]
  );

  const handleAlimentar = useCallback(
    (comida: Comida) => {
      if (!pet) return;
      if (!pet.vivo) {
        emitirFeedback("Seu pet não está mais aqui. Comece um novo cuidado.", "erro");
        return;
      }
      if (pet.dormindo) {
        emitirFeedback("Deixe seu pet dormir em paz.", "alerta");
        return;
      }
      if (pet.moedas < comida.preco) {
        emitirFeedback("Moedas insuficientes para essa comida.", "erro");
        som.tocar("erro");
        return;
      }

      const alimentado = alimentar({ ...pet, moedas: pet.moedas - comida.preco }, comida);
      setPet(alimentado);
      emitirFeedback(`Seu pet comeu ${comida.nome.toLowerCase()} e está satisfeito!`, "sucesso");
      som.tocar("sucesso");
    },
    [pet, emitirFeedback, som]
  );

  const handleBrincar = useCallback(
    () => executarAcao(brincar, "Seu pet adorou brincar!", "Seu pet está dormindo agora."),
    [executarAcao]
  );

  const handleBanhar = useCallback(
    () => executarAcao(banhar, "Seu pet está limpinho e cheiroso!", "Seu pet está dormindo agora."),
    [executarAcao]
  );

  const handleCurar = useCallback(
    () => executarAcao(curar, "Seu pet está se sentindo melhor!"),
    [executarAcao]
  );

  const handleCarinho = useCallback(
    () => executarAcao(acariciar, "Seu pet adorou o carinho!"),
    [executarAcao]
  );

  const handleLimparCoco = useCallback(() => {
    if (!pet || pet.cocos <= 0) return;
    setPet(limparUmCoco(pet));
    som.tocar("clique");
  }, [pet, som]);

  const handleDormir = useCallback(() => {
    if (!pet || !pet.vivo) return;
    setPet(dormir(pet));
    emitirFeedback("Seu pet foi dormir. Boa noite!", "info");
  }, [pet, emitirFeedback]);

  const handleAcordar = useCallback(() => {
    if (!pet || !pet.vivo) return;
    setPet(acordar(pet));
    emitirFeedback("Seu pet acordou!", "info");
  }, [pet, emitirFeedback]);

  const registrarResultadoMinigame = useCallback(
    (moedas: number, xp: number) => {
      if (!pet || !pet.vivo) return;
      setPet(receberRecompensaDeMinigame(pet, moedas, xp));
      emitirFeedback(`Minigame concluído! +${moedas} moedas, +${xp} XP`, "sucesso");
      som.tocar("moeda");
    },
    [pet, emitirFeedback, som]
  );

  const handleComprarItem = useCallback(
    (item: ItemLoja) => {
      if (!pet) return;
      const resultado = comprarItem(pet, item);
      if (!resultado.sucesso) {
        const motivo =
          resultado.motivo === "saldo_insuficiente"
            ? "Saldo insuficiente."
            : resultado.motivo === "nivel_insuficiente"
              ? `Disponível a partir do nível ${item.nivelMinimo}.`
              : "Você já tem esse item.";
        emitirFeedback(motivo, "erro");
        som.tocar("erro");
        return;
      }
      setPet(resultado.state);
      emitirFeedback(`Você comprou: ${item.nome}!`, "sucesso");
      som.tocar("moeda");
    },
    [pet, emitirFeedback, som]
  );

  const handleEquiparItem = useCallback(
    (itemId: string | null) => {
      if (!pet) return;
      setPet(equiparItem(pet, itemId));
    },
    [pet]
  );

  const handleComprarPacoteDeGemas = useCallback(
    (pacote: PacoteDeGemas) => {
      if (!pet) return;
      setPet(processarCompraSimuladaDeGemas(pet, pacote));
      emitirFeedback(`Compra simulada: +${pacote.gemas} gemas!`, "sucesso");
      som.tocar("moeda");
    },
    [pet, emitirFeedback, som]
  );

  const handleResgatarRecompensaDiaria = useCallback(() => {
    if (pet) {
      setPet(resgatarNoService(pet));
      emitirFeedback("Recompensa diária resgatada!", "sucesso");
      som.tocar("moeda");
    }
    setMostrarRecompensaDiaria(false);
  }, [pet, emitirFeedback, som]);

  const fecharResumoOffline = useCallback(() => setResumoOffline(null), []);
  const fecharModalRecompensaDiaria = useCallback(() => setMostrarRecompensaDiaria(false), []);
  const abrirModalRecompensaDiaria = useCallback(() => {
    if (pet && getStatusRecompensaDiaria(pet).disponivel) setMostrarRecompensaDiaria(true);
  }, [pet]);

  const limparEstadoLocal = useCallback(() => {
    avisosEnviados.current.clear();
    setMensagens([]);
    setResumoOffline(null);
    setMostrarRecompensaDiaria(false);
    setFalaAtual(null);
  }, []);

  /** Entra ou cria a conta (usuário + PIN de 4 dígitos) e já carrega o pet, se houver. */
  const autenticar = useCallback(
    async (modo: "entrar" | "registrar", nomeDeUsuario: string, pin: string): Promise<ResultadoAuth> => {
      const resultado = modo === "registrar" ? await registrarNaApi(nomeDeUsuario, pin) : await entrarNaApi(nomeDeUsuario, pin);
      if (!resultado.ok) return resultado;

      const usuarioAtual = await sessaoAtual();
      setUsuario(usuarioAtual);
      await carregarPetDoUsuario();
      return resultado;
    },
    [carregarPetDoUsuario]
  );

  /** Sai da conta: some com a sessão no servidor e limpa tudo localmente. */
  const sairDaConta = useCallback(async () => {
    await sairNaApi();
    setUsuario(null);
    setPet(null);
    limparEstadoLocal();
  }, [limparEstadoLocal]);

  /** Limpa a tela e volta para a escolha de espécie (usado após a morte do pet). */
  const recomecar = useCallback(() => {
    limparEstadoLocal();
    setPet(null);
  }, [limparEstadoLocal]);

  /** Cria o pet com a espécie escolhida pela criança e começa o jogo. */
  const escolherEspecieEComecar = useCallback((especie: Especie, nome: string = NOME_PADRAO_DO_PET) => {
    const novoPet = criarNovoPet(nome, especie);
    setPet(novoPet);
    ultimoSalvamentoRef.current = Date.now();
    salvarPetNoServidor(novoPet);
  }, []);

  const humor = pet ? getHumor(pet) : null;
  const estagio = pet ? getEstagioEvolucao(pet.nivel) : null;
  const xpNecessario = pet ? getXpNecessarioParaProximoNivel(pet.nivel) : 0;
  const statusRecompensaDiaria = pet ? getStatusRecompensaDiaria(pet) : null;

  return {
    usuario,
    autenticar,
    sairDaConta,
    carregando: verificandoSessao || (usuario !== null && carregandoPet),
    precisaAutenticar: !verificandoSessao && usuario === null,
    precisaEscolherEspecie: !verificandoSessao && usuario !== null && !carregandoPet && pet === null,
    escolherEspecieEComecar,
    pet,
    humor,
    estagio,
    xpNecessario,
    mensagens,
    falaAtual,
    resumoOffline,
    fecharResumoOffline,
    mostrarRecompensaDiaria,
    statusRecompensaDiaria,
    resgatarRecompensaDiaria: handleResgatarRecompensaDiaria,
    fecharModalRecompensaDiaria,
    abrirModalRecompensaDiaria,
    alimentar: handleAlimentar,
    brincar: handleBrincar,
    banhar: handleBanhar,
    curar: handleCurar,
    acariciar: handleCarinho,
    limparCoco: handleLimparCoco,
    dormir: handleDormir,
    acordar: handleAcordar,
    reiniciar: recomecar,
    registrarResultadoMinigame,
    comprarItem: handleComprarItem,
    equiparItem: handleEquiparItem,
    comprarPacoteDeGemas: handleComprarPacoteDeGemas,
    som,
  };
}
