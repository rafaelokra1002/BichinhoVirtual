interface LevelBadgeProps {
  nivel: number;
  xp: number;
  xpNecessario: number;
}

export function LevelBadge({ nivel, xp, xpNecessario }: LevelBadgeProps) {
  const progresso = Math.round((xp / xpNecessario) * 100);

  return (
    <div className="flex w-full items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-amber-300 to-amber-500 text-base font-extrabold text-white shadow-[0_3px_0_0_#b45309]">
        {nivel}
      </span>
      <div className="flex-1">
        <div className="mb-1 flex items-center justify-between text-xs font-bold text-stone-500 dark:text-stone-400">
          <span>Nível {nivel}</span>
          <span className="tabular-nums">
            {Math.floor(xp)}/{xpNecessario} XP
          </span>
        </div>
        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200 shadow-[inset_0_1px_2px_rgba(0,0,0,0.15)] dark:bg-stone-700">
          <div
            className="h-full rounded-full bg-gradient-to-b from-purple-400 to-purple-500 transition-all duration-500 ease-out"
            style={{ width: `${progresso}%` }}
          />
        </div>
      </div>
    </div>
  );
}
