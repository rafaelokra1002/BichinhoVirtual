"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const DURACAO_SEGUNDOS = 20;
const INTERVALO_SPAWN_MS = 700;
const VIDA_DO_ALVO_MS = 1100;
const EMOJIS_ALVO = ["⭐", "🍓", "🍬", "🎈", "🍀"];

interface Alvo {
  id: number;
  x: number;
  y: number;
  emoji: string;
}

interface TapMiniGameProps {
  onFinalizar: (moedas: number, xp: number) => void;
  onSair: () => void;
  onTocarSom: (tipo: "clique" | "sucesso") => void;
}

/** Minigame de toque: itens aparecem por um curto período e o jogador precisa tocá-los antes que somam. */
export function TapMiniGame({ onFinalizar, onSair, onTocarSom }: TapMiniGameProps) {
  const [tempoRestante, setTempoRestante] = useState(DURACAO_SEGUNDOS);
  const [pontuacao, setPontuacao] = useState(0);
  const [alvos, setAlvos] = useState<Alvo[]>([]);
  const [terminado, setTerminado] = useState(false);
  const proximoId = useRef(1);

  useEffect(() => {
    if (terminado) return;
    const id = setInterval(() => {
      setTempoRestante((atual) => {
        if (atual <= 1) {
          setTerminado(true);
          return 0;
        }
        return atual - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [terminado]);

  useEffect(() => {
    if (terminado) return;
    const id = setInterval(() => {
      const novoAlvo: Alvo = {
        id: proximoId.current++,
        x: 10 + Math.random() * 75,
        y: 10 + Math.random() * 65,
        emoji: EMOJIS_ALVO[Math.floor(Math.random() * EMOJIS_ALVO.length)],
      };
      setAlvos((atual) => [...atual, novoAlvo]);
      setTimeout(() => {
        setAlvos((atual) => atual.filter((a) => a.id !== novoAlvo.id));
      }, VIDA_DO_ALVO_MS);
    }, INTERVALO_SPAWN_MS);
    return () => clearInterval(id);
  }, [terminado]);

  const tocarAlvo = useCallback(
    (id: number) => {
      setAlvos((atual) => atual.filter((a) => a.id !== id));
      setPontuacao((atual) => atual + 1);
      onTocarSom("clique");
    },
    [onTocarSom]
  );

  if (terminado) {
    const moedas = Math.max(2, Math.round(pontuacao * 0.8));
    const xp = pontuacao * 2;
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="text-5xl">🏆</span>
        <p className="text-lg font-bold text-stone-800 dark:text-stone-100">Pontuação: {pontuacao}</p>
        <p className="text-sm text-stone-500 dark:text-stone-400">
          +{moedas} moedas · +{xp} XP
        </p>
        <button
          type="button"
          onClick={() => onFinalizar(moedas, xp)}
          className="rounded-full bg-gradient-to-b from-purple-500 to-purple-600 px-5 py-2.5 font-extrabold text-white shadow-[0_4px_0_0_#6d28d9] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_1px_0_0_#6d28d9]"
        >
          Coletar recompensa
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between text-sm font-semibold text-stone-600 dark:text-stone-300">
        <span>⏱️ {tempoRestante}s</span>
        <span>⭐ {pontuacao}</span>
        <button type="button" onClick={onSair} className="text-xs text-stone-400 underline">
          Sair
        </button>
      </div>
      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-sky-100 to-sky-200 dark:from-sky-950 dark:to-sky-900">
        {alvos.map((alvo) => (
          <button
            key={alvo.id}
            type="button"
            onClick={() => tocarAlvo(alvo.id)}
            style={{ left: `${alvo.x}%`, top: `${alvo.y}%` }}
            className="absolute flex h-12 w-12 items-center justify-center rounded-full bg-white/80 text-2xl shadow-md transition-transform active:scale-75"
          >
            {alvo.emoji}
          </button>
        ))}
      </div>
      <p className="text-center text-xs text-stone-500 dark:text-stone-400">
        Toque nos itens antes que desapareçam!
      </p>
    </div>
  );
}
