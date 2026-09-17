"use client";

import { useEffect, useRef, useState } from "react";

const DURACAO_SEGUNDOS = 25;
const TICK_MS = 150;
const VIDAS_INICIAIS = 3;
const FAIXAS = [0, 1, 2] as const;

interface Obstaculo {
  id: number;
  faixa: number;
  y: number;
}

interface DodgeMiniGameProps {
  onFinalizar: (moedas: number, xp: number) => void;
  onSair: () => void;
  onTocarSom: (tipo: "clique" | "erro") => void;
}

/** Minigame de desvio: o pet troca de faixa para não ser atingido por obstáculos que caem. */
export function DodgeMiniGame({ onFinalizar, onSair, onTocarSom }: DodgeMiniGameProps) {
  const [faixaJogador, setFaixaJogador] = useState(1);
  const [obstaculos, setObstaculos] = useState<Obstaculo[]>([]);
  const [vidas, setVidas] = useState(VIDAS_INICIAIS);
  const [pontuacao, setPontuacao] = useState(0);
  const [tempoRestante, setTempoRestante] = useState(DURACAO_SEGUNDOS);

  const terminado = vidas <= 0 || tempoRestante <= 0;

  const proximoId = useRef(1);
  const ticksDesdeSpawn = useRef(0);
  const ticksTotais = useRef(0);
  const faixaJogadorRef = useRef(faixaJogador);

  useEffect(() => {
    faixaJogadorRef.current = faixaJogador;
  }, [faixaJogador]);

  useEffect(() => {
    if (terminado) return;

    const id = setInterval(() => {
      ticksTotais.current += 1;

      if (ticksTotais.current % Math.round(1000 / TICK_MS) === 0) {
        setTempoRestante((atual) => Math.max(0, atual - 1));
      }

      const dificuldade = 1 + ticksTotais.current / 300;
      const passo = 4 * dificuldade;

      setObstaculos((atual) => {
        const movidos: Obstaculo[] = [];
        atual.forEach((o) => {
          const novoY = o.y + passo;
          if (novoY >= 100) {
            setPontuacao((p) => p + 1);
          } else {
            movidos.push({ ...o, y: novoY });
          }
        });

        const colisao = movidos.find((o) => o.y >= 78 && o.y <= 94 && o.faixa === faixaJogadorRef.current);
        if (colisao) {
          onTocarSom("erro");
          setVidas((v) => Math.max(0, v - 1));
          return movidos.filter((o) => o.id !== colisao.id);
        }
        return movidos;
      });

      ticksDesdeSpawn.current += 1;
      const intervaloSpawnEmTicks = Math.max(4, Math.round(6 - ticksTotais.current / 200));
      if (ticksDesdeSpawn.current >= intervaloSpawnEmTicks) {
        ticksDesdeSpawn.current = 0;
        setObstaculos((atual) => [
          ...atual,
          { id: proximoId.current++, faixa: Math.floor(Math.random() * 3), y: 0 },
        ]);
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [terminado, onTocarSom]);

  if (terminado) {
    const moedas = Math.max(2, pontuacao * 2);
    const xp = pontuacao * 3;
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <span className="text-5xl">{vidas <= 0 ? "💥" : "🏁"}</span>
        <p className="text-lg font-bold text-stone-800 dark:text-stone-100">
          {vidas <= 0 ? "Seu pet bateu!" : "Tempo esgotado!"}
        </p>
        <p className="text-sm text-stone-600 dark:text-stone-300">Obstáculos desviados: {pontuacao}</p>
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
        <span>{"❤️".repeat(vidas)}</span>
        <button type="button" onClick={onSair} className="text-xs text-stone-400 underline">
          Sair
        </button>
      </div>

      <div className="relative h-72 w-full overflow-hidden rounded-2xl bg-gradient-to-b from-emerald-100 to-emerald-200 dark:from-emerald-950 dark:to-emerald-900">
        {FAIXAS.map((faixa) => (
          <div
            key={faixa}
            className="absolute top-0 h-full border-r-2 border-white/40 last:border-r-0"
            style={{ left: `${faixa * 33.33}%`, width: "33.33%" }}
          />
        ))}

        {obstaculos.map((obstaculo) => (
          <span
            key={obstaculo.id}
            className="absolute text-3xl"
            style={{ left: `${obstaculo.faixa * 33.33 + 10}%`, top: `${obstaculo.y}%` }}
          >
            🪨
          </span>
        ))}

        <span
          className="absolute bottom-2 text-4xl transition-all duration-150"
          style={{ left: `${faixaJogador * 33.33 + 8}%` }}
        >
          🐾
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => setFaixaJogador((f) => Math.max(0, f - 1))}
          className="rounded-full bg-stone-800 py-3 text-xl text-white transition-transform active:scale-95 dark:bg-stone-100 dark:text-stone-900"
        >
          ⬅️
        </button>
        <button
          type="button"
          onClick={() => setFaixaJogador((f) => Math.min(2, f + 1))}
          className="rounded-full bg-stone-800 py-3 text-xl text-white transition-transform active:scale-95 dark:bg-stone-100 dark:text-stone-900"
        >
          ➡️
        </button>
      </div>
    </div>
  );
}
