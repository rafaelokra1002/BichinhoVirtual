"use client";

import { useInstallPrompt } from "@/hooks/useInstallPrompt";

/** Botão flutuante de "instalar app", visível em qualquer tela — só aparece quando o navegador permite. */
export function InstallButton() {
  const { podeInstalar, instalar } = useInstallPrompt();

  if (!podeInstalar) return null;

  return (
    <button
      type="button"
      onClick={instalar}
      className="fixed right-4 top-4 z-40 flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-sm font-bold text-purple-700 shadow-[0_3px_0_0_rgba(109,40,217,0.25)] backdrop-blur transition-all active:translate-y-[2px] active:shadow-none dark:bg-stone-900/95 dark:text-purple-300"
    >
      <span className="text-lg">📲</span> Instalar
    </button>
  );
}
