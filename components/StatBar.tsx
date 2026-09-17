interface StatBarProps {
  label: string;
  icon: string;
  value: number;
  colorClass: string;
  aviso?: string;
}

export function StatBar({ label, icon, value, colorClass, aviso }: StatBarProps) {
  const arredondado = Math.round(value);

  return (
    <div className="flex w-full items-center gap-2">
      <span className="flex w-[5.5rem] shrink-0 items-center gap-1 text-xs font-bold text-stone-700 dark:text-stone-300">
        <span className="text-sm leading-none">{icon}</span>
        {label}
      </span>

      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={arredondado}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-stone-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)] dark:bg-stone-700"
      >
        <div
          className={`relative h-full rounded-full bg-gradient-to-b transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${arredondado}%` }}
        >
          <span className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-white/30" />
        </div>
      </div>

      <span className="w-8 shrink-0 text-right text-xs font-bold tabular-nums text-stone-500 dark:text-stone-400">
        {arredondado}%
      </span>

      {aviso && (
        <span className="shrink-0 rounded-full bg-red-100 px-1.5 py-0.5 text-[10px] font-bold leading-none text-red-600 dark:bg-red-950/40 dark:text-red-400">
          {aviso}
        </span>
      )}
    </div>
  );
}
