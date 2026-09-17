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
    <div className="w-full">
      <div className="mb-1 flex items-center justify-between text-sm font-bold text-stone-700 dark:text-stone-300">
        <span>
          {icon} {label}
          {aviso && <span className="ml-1 text-xs text-red-500">{aviso}</span>}
        </span>
        <span className="tabular-nums">{arredondado}%</span>
      </div>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuenow={arredondado}
        aria-valuemin={0}
        aria-valuemax={100}
        className="h-3.5 w-full overflow-hidden rounded-full bg-stone-200 shadow-[inset_0_1px_3px_rgba(0,0,0,0.15)] dark:bg-stone-700"
      >
        <div
          className={`relative h-full rounded-full bg-gradient-to-b transition-all duration-500 ease-out ${colorClass}`}
          style={{ width: `${arredondado}%` }}
        >
          <span className="absolute inset-x-0 top-0 h-1/2 rounded-full bg-white/30" />
        </div>
      </div>
    </div>
  );
}
