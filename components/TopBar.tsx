interface TopBarProps {
  nomeDeUsuario: string;
  moedas: number;
  gemas: number;
  mudo: boolean;
  recompensaDiariaDisponivel: boolean;
  onAlternarSom: () => void;
  onAbrirRecompensaDiaria: () => void;
  onSair: () => void;
}

export function TopBar({
  nomeDeUsuario,
  moedas,
  gemas,
  mudo,
  recompensaDiariaDisponivel,
  onAlternarSom,
  onAbrirRecompensaDiaria,
  onSair,
}: TopBarProps) {
  return (
    <div className="flex flex-col gap-2 bg-gradient-to-r from-purple-500 to-fuchsia-500 px-4 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm font-extrabold text-white">
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-amber-600 shadow-[0_2px_0_0_rgba(0,0,0,0.08)]">
            🪙 {moedas}
          </span>
          <span className="flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-purple-600 shadow-[0_2px_0_0_rgba(0,0,0,0.08)]">
            💎 {gemas}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onAbrirRecompensaDiaria}
            aria-label="Recompensa diária"
            className={`relative flex h-9 w-9 items-center justify-center rounded-full text-lg shadow-[0_2px_0_0_rgba(0,0,0,0.12)] transition-transform active:scale-90 ${
              recompensaDiariaDisponivel ? "bg-amber-400" : "bg-white/90"
            }`}
          >
            🎁
            {recompensaDiariaDisponivel && (
              <span className="absolute -right-0.5 -top-0.5 h-3 w-3 animate-pulse rounded-full bg-red-500 ring-2 ring-white" />
            )}
          </button>
          <button
            type="button"
            onClick={onAlternarSom}
            aria-label={mudo ? "Ativar som" : "Desativar som"}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-[0_2px_0_0_rgba(0,0,0,0.12)] transition-transform active:scale-90"
          >
            {mudo ? "🔇" : "🔊"}
          </button>
          <button
            type="button"
            onClick={onSair}
            aria-label="Sair da conta"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-lg shadow-[0_2px_0_0_rgba(0,0,0,0.12)] transition-transform active:scale-90"
          >
            🚪
          </button>
        </div>
      </div>
      <p className="text-xs font-semibold text-white/80">Olá, {nomeDeUsuario}!</p>
    </div>
  );
}
