interface GameOverModalProps {
  nome: string;
  nivelAlcancado: number;
  onReiniciar: () => void;
}

export function GameOverModal({ nome, nivelAlcancado, onReiniciar }: GameOverModalProps) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-3xl bg-stone-900/90 px-6 text-center text-white">
      <span className="text-6xl">💀</span>
      <h2 className="text-2xl font-extrabold">{nome} não resistiu...</h2>
      <p className="font-medium text-stone-300">
        Ele chegou ao nível {nivelAlcancado} antes de partir. Cuide melhor do próximo!
      </p>
      <button
        type="button"
        onClick={onReiniciar}
        className="rounded-full bg-white px-6 py-2.5 font-extrabold text-stone-900 shadow-[0_4px_0_0_#a8a29e] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_1px_0_0_#a8a29e]"
      >
        Começar de novo
      </button>
    </div>
  );
}
