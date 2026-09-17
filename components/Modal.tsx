import { ReactNode } from "react";

interface ModalProps {
  titulo: string;
  onFechar: () => void;
  children: ReactNode;
}

export function Modal({ titulo, onFechar, children }: ModalProps) {
  return (
    <div className="fixed inset-0 z-30 flex items-end justify-center bg-black/50 px-0 sm:items-center sm:px-4">
      <div className="flex max-h-[85vh] w-full max-w-sm flex-col overflow-hidden rounded-t-3xl border-4 border-white/70 bg-white shadow-2xl dark:border-stone-800/70 dark:bg-stone-900 sm:rounded-3xl">
        <div className="flex items-center justify-between bg-gradient-to-r from-purple-500 to-fuchsia-500 p-4">
          <h2 className="text-lg font-extrabold text-white">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-stone-600 transition-transform active:scale-90"
          >
            ✕
          </button>
        </div>
        <div className="overflow-y-auto p-4">{children}</div>
      </div>
    </div>
  );
}
