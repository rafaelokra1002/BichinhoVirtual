import { PetState } from "@/types/pet";
import { getTodasAsConquistas } from "@/services/achievementService";

interface AchievementsPanelProps {
  pet: PetState;
}

export function AchievementsPanel({ pet }: AchievementsPanelProps) {
  const conquistas = getTodasAsConquistas();

  return (
    <div className="flex flex-col gap-2 pb-4">
      {conquistas.map((conquista) => {
        const desbloqueada = pet.conquistasDesbloqueadas.includes(conquista.id);
        return (
          <div
            key={conquista.id}
            className={`flex items-center gap-3 rounded-2xl border-2 p-3 transition-transform ${
              desbloqueada
                ? "border-amber-300 bg-gradient-to-r from-amber-50 to-yellow-50 shadow-[0_2px_0_0_rgba(217,119,6,0.15)] dark:border-amber-600 dark:from-amber-950/30 dark:to-amber-950/30"
                : "border-stone-100 bg-stone-50 opacity-60 dark:border-stone-800 dark:bg-stone-800/30"
            }`}
          >
            <span className="text-3xl drop-shadow-sm">{desbloqueada ? conquista.icone : "🔒"}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-stone-800 dark:text-stone-100">{conquista.nome}</p>
              <p className="text-xs font-medium text-stone-500 dark:text-stone-400">{conquista.descricao}</p>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
              +{conquista.recompensaMoedas}🪙
            </span>
          </div>
        );
      })}
    </div>
  );
}
