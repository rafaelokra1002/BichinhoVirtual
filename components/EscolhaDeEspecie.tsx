"use client";

import { useState } from "react";
import { Especie } from "@/types/pet";
import { CATALOGO_DE_ESPECIES } from "@/services/gameConfig";

interface EscolhaDeEspecieProps {
  onEscolher: (especie: Especie, nome: string) => void;
}

export function EscolhaDeEspecie({ onEscolher }: EscolhaDeEspecieProps) {
  const [selecionada, setSelecionada] = useState<Especie | null>(null);
  const [nome, setNome] = useState("");

  return (
    <div className="flex flex-1 flex-col gap-5 p-6">
      <div className="text-center">
        <p className="text-4xl">🥚</p>
        <h1 className="mt-1 text-xl font-extrabold text-stone-800 dark:text-stone-100">
          Qual bichinho vai nascer?
        </h1>
        <p className="text-sm font-medium text-stone-500 dark:text-stone-400">Escolha quem vai morar no seu ovo</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CATALOGO_DE_ESPECIES.map((especie) => {
          const ativa = selecionada === especie.id;
          return (
            <button
              key={especie.id}
              type="button"
              onClick={() => setSelecionada(especie.id)}
              className={`flex flex-col items-center gap-2 rounded-3xl border-4 p-4 transition-all active:scale-95 ${
                ativa
                  ? "border-purple-400 bg-purple-50 shadow-[0_3px_0_0_rgba(168,85,247,0.3)] dark:bg-purple-950/30"
                  : "border-transparent bg-stone-100 dark:bg-stone-800"
              }`}
              style={ativa ? { borderColor: especie.corEscura } : undefined}
            >
              <span
                className="flex h-16 w-16 items-center justify-center rounded-full text-4xl shadow-inner"
                style={{ backgroundColor: especie.corClara }}
              >
                {especie.icone}
              </span>
              <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{especie.nome}</span>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="nome-do-pet" className="text-sm font-medium text-stone-600 dark:text-stone-300">
          Nome do bichinho
        </label>
        <input
          id="nome-do-pet"
          type="text"
          value={nome}
          maxLength={16}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Bichinho"
          className="rounded-2xl border-2 border-stone-200 px-4 py-2.5 text-base font-medium outline-none focus:border-purple-400 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100"
        />
      </div>

      <button
        type="button"
        disabled={!selecionada}
        onClick={() => selecionada && onEscolher(selecionada, nome.trim() || "Bichinho")}
        className="mt-auto w-full rounded-full bg-gradient-to-b from-purple-500 to-purple-600 py-3 text-base font-extrabold text-white shadow-[0_4px_0_0_#6d28d9] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_1px_0_0_#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Chocar o ovo! 🥚
      </button>
    </div>
  );
}
