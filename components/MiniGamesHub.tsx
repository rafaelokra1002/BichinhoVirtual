"use client";

import { useState } from "react";
import { TapMiniGame } from "./TapMiniGame";
import { DodgeMiniGame } from "./DodgeMiniGame";

type JogoAtivo = "nenhum" | "toque" | "desvio";

interface MiniGamesHubProps {
  minigamesJogados: number;
  onFinalizar: (moedas: number, xp: number) => void;
  onTocarSom: (tipo: "clique" | "sucesso" | "erro") => void;
}

export function MiniGamesHub({ minigamesJogados, onFinalizar, onTocarSom }: MiniGamesHubProps) {
  const [jogoAtivo, setJogoAtivo] = useState<JogoAtivo>("nenhum");

  const finalizarEVoltar = (moedas: number, xp: number) => {
    onFinalizar(moedas, xp);
    setJogoAtivo("nenhum");
  };

  if (jogoAtivo === "toque") {
    return (
      <TapMiniGame onFinalizar={finalizarEVoltar} onSair={() => setJogoAtivo("nenhum")} onTocarSom={onTocarSom} />
    );
  }

  if (jogoAtivo === "desvio") {
    return (
      <DodgeMiniGame onFinalizar={finalizarEVoltar} onSair={() => setJogoAtivo("nenhum")} onTocarSom={onTocarSom} />
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-4">
      <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">
        Jogos concluídos até agora: {minigamesJogados}
      </p>

      <button
        type="button"
        onClick={() => setJogoAtivo("toque")}
        className="flex items-center gap-3 rounded-2xl border-2 border-stone-100 bg-gradient-to-r from-amber-50 to-orange-50 p-4 text-left shadow-[0_3px_0_0_rgba(0,0,0,0.05)] transition-all active:translate-y-[2px] active:shadow-none dark:border-stone-800 dark:from-stone-800/40 dark:to-stone-800/40"
      >
        <span className="text-4xl drop-shadow-sm">⭐</span>
        <div>
          <p className="font-extrabold text-stone-800 dark:text-stone-100">Toque Rápido</p>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Toque nos itens antes que desapareçam.</p>
        </div>
      </button>

      <button
        type="button"
        onClick={() => setJogoAtivo("desvio")}
        className="flex items-center gap-3 rounded-2xl border-2 border-stone-100 bg-gradient-to-r from-emerald-50 to-teal-50 p-4 text-left shadow-[0_3px_0_0_rgba(0,0,0,0.05)] transition-all active:translate-y-[2px] active:shadow-none dark:border-stone-800 dark:from-stone-800/40 dark:to-stone-800/40"
      >
        <span className="text-4xl drop-shadow-sm">🪨</span>
        <div>
          <p className="font-extrabold text-stone-800 dark:text-stone-100">Desvie dos Obstáculos</p>
          <p className="text-xs font-medium text-stone-500 dark:text-stone-400">Troque de faixa e não deixe seu pet bater.</p>
        </div>
      </button>
    </div>
  );
}
