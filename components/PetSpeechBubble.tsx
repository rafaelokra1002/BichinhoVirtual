interface PetSpeechBubbleProps {
  texto: string;
}

export function PetSpeechBubble({ texto }: PetSpeechBubbleProps) {
  return (
    <div className="balao-fala animate-[fade-in_0.2s_ease-out] rounded-2xl border-2 border-purple-100 bg-white px-3 py-2 text-sm font-semibold text-stone-700 shadow-lg dark:border-purple-900/40 dark:bg-stone-800 dark:text-stone-100">
      {texto}
    </div>
  );
}
