interface ActionButtonProps {
  label: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  colorClass: string;
}

export function ActionButton({ label, icon, onClick, disabled, colorClass }: ActionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center gap-0.5 rounded-2xl px-2 py-2 text-white transition-all duration-100 active:translate-y-[3px] disabled:cursor-not-allowed disabled:opacity-40 ${colorClass}`}
    >
      <span className="text-xl drop-shadow-sm">{icon}</span>
      <span className="text-xs font-bold">{label}</span>
    </button>
  );
}
