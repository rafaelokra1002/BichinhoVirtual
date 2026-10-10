export type AbaDoJogo = "inicio" | "minigames" | "loja" | "conquistas";

interface AbaConfig {
  id: AbaDoJogo;
  rotulo: string;
  icone: string;
}

const ABAS: AbaConfig[] = [
  { id: "inicio", rotulo: "Início", icone: "🏠" },
  { id: "minigames", rotulo: "Jogos", icone: "🎮" },
  { id: "loja", rotulo: "Loja", icone: "🛒" },
  { id: "conquistas", rotulo: "Prêmios", icone: "🏆" },
];

interface BottomNavProps {
  abaAtiva: AbaDoJogo;
  onSelecionar: (aba: AbaDoJogo) => void;
}

export function BottomNav({ abaAtiva, onSelecionar }: BottomNavProps) {
  return (
    <div className="grid grid-cols-4 gap-1 border-t border-stone-100 bg-stone-50 p-1.5 pb-[max(0.375rem,env(safe-area-inset-bottom))] dark:border-stone-800 dark:bg-stone-900/60">
      {ABAS.map((aba) => {
        const ativa = aba.id === abaAtiva;
        return (
          <button
            key={aba.id}
            type="button"
            onClick={() => onSelecionar(aba.id)}
            className={`flex flex-col items-center gap-0.5 rounded-2xl py-1.5 text-xs font-bold transition-all active:scale-95 ${
              ativa
                ? "bg-purple-100 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300"
                : "text-stone-400 dark:text-stone-500"
            }`}
          >
            <span className={`text-xl transition-transform ${ativa ? "scale-110" : ""}`}>{aba.icone}</span>
            {aba.rotulo}
          </button>
        );
      })}
    </div>
  );
}
