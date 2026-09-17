import { RECOMPENSA_DIARIA_POR_DIA } from "@/services/gameConfig";
import { Modal } from "./Modal";

interface DailyRewardModalProps {
  diaDaSequencia: number;
  onResgatar: () => void;
  onFechar: () => void;
}

export function DailyRewardModal({ diaDaSequencia, onResgatar, onFechar }: DailyRewardModalProps) {
  const recompensa = RECOMPENSA_DIARIA_POR_DIA[diaDaSequencia - 1];

  return (
    <Modal titulo={`Recompensa do dia ${diaDaSequencia}`} onFechar={onFechar}>
      <div className="flex flex-col items-center gap-3 py-2 text-center">
        <span className="text-5xl">🎁</span>
        <p className="text-stone-600 dark:text-stone-300">Volte todo dia para ganhar recompensas cada vez maiores!</p>
        <div className="flex gap-4 text-lg font-bold text-stone-800 dark:text-stone-100">
          <span>🪙 {recompensa.moedas}</span>
          {recompensa.gemas > 0 && <span>💎 {recompensa.gemas}</span>}
        </div>
        <div className="flex gap-1">
          {RECOMPENSA_DIARIA_POR_DIA.map((_, indice) => (
            <span
              key={indice}
              className={`h-2 w-6 rounded-full ${
                indice < diaDaSequencia ? "bg-purple-500" : "bg-stone-200 dark:bg-stone-700"
              }`}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onResgatar}
          className="mt-2 w-full rounded-full bg-gradient-to-b from-purple-500 to-purple-600 py-2.5 font-extrabold text-white shadow-[0_4px_0_0_#6d28d9] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_1px_0_0_#6d28d9]"
        >
          Resgatar
        </button>
      </div>
    </Modal>
  );
}
