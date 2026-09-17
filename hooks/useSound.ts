"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const SOUND_MUTE_KEY = "bichinho-virtual:mudo";

type TipoDeSom = "clique" | "sucesso" | "erro" | "moeda" | "levelUp";

/** Frequências (Hz) e duração (ms) de cada efeito sonoro, gerados via Web Audio — sem arquivos externos. */
const RECEITA_DO_SOM: Record<TipoDeSom, { frequencias: number[]; duracaoMs: number; tipo: OscillatorType }> = {
  clique: { frequencias: [440], duracaoMs: 60, tipo: "sine" },
  sucesso: { frequencias: [523, 659, 784], duracaoMs: 90, tipo: "sine" },
  erro: { frequencias: [220, 160], duracaoMs: 120, tipo: "sawtooth" },
  moeda: { frequencias: [988, 1318], duracaoMs: 70, tipo: "square" },
  levelUp: { frequencias: [523, 659, 784, 1046], duracaoMs: 100, tipo: "triangle" },
};

/**
 * Efeitos sonoros simples, sintetizados em tempo real via Web Audio API.
 * Evita depender de arquivos de áudio (licenciamento, tamanho de download) para um MVP.
 */
export function useSound() {
  const contextoRef = useRef<AudioContext | null>(null);
  const [mudo, setMudo] = useState(false);

  useEffect(() => {
    try {
      const salvo = window.localStorage.getItem(SOUND_MUTE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- carregamento único a partir do localStorage (só existe no cliente)
      if (salvo === "1") setMudo(true);
    } catch {
      // ignorado
    }
  }, []);

  const getContexto = useCallback((): AudioContext | null => {
    if (typeof window === "undefined") return null;
    const AudioContextCtor =
      window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;

    if (!contextoRef.current) {
      contextoRef.current = new AudioContextCtor();
    }
    return contextoRef.current;
  }, []);

  const tocar = useCallback(
    (tipo: TipoDeSom) => {
      if (mudo) return;
      const ctx = getContexto();
      if (!ctx) return;

      const { frequencias, duracaoMs, tipo: forma } = RECEITA_DO_SOM[tipo];
      const inicio = ctx.currentTime;

      frequencias.forEach((frequencia, indice) => {
        const oscilador = ctx.createOscillator();
        const ganho = ctx.createGain();
        oscilador.type = forma;
        oscilador.frequency.value = frequencia;

        const tempoNota = inicio + (indice * duracaoMs) / 1000;
        ganho.gain.setValueAtTime(0.0001, tempoNota);
        ganho.gain.exponentialRampToValueAtTime(0.15, tempoNota + 0.01);
        ganho.gain.exponentialRampToValueAtTime(0.0001, tempoNota + duracaoMs / 1000);

        oscilador.connect(ganho).connect(ctx.destination);
        oscilador.start(tempoNota);
        oscilador.stop(tempoNota + duracaoMs / 1000 + 0.02);
      });
    },
    [mudo, getContexto]
  );

  const alternarMudo = useCallback(() => {
    setMudo((atual) => {
      const novo = !atual;
      try {
        window.localStorage.setItem(SOUND_MUTE_KEY, novo ? "1" : "0");
      } catch {
        // ignorado
      }
      return novo;
    });
  }, []);

  // Memoizado para que hooks que dependem do objeto (ex.: usePetGame) não recriem
  // callbacks a cada render — só muda quando `mudo` de fato alterna.
  return useMemo(() => ({ tocar, mudo, alternarMudo }), [tocar, mudo, alternarMudo]);
}
