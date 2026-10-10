import { FeedbackMessage, FeedbackTipo } from "@/types/pet";

const ESTILO_POR_TIPO: Record<FeedbackTipo, string> = {
  info: "bg-stone-800 text-white",
  sucesso: "bg-green-600 text-white",
  alerta: "bg-amber-500 text-white",
  erro: "bg-red-600 text-white",
};

interface FeedbackBannerProps {
  mensagens: FeedbackMessage[];
}

/**
 * Mostra só a mensagem mais recente, em fluxo normal (empurra o conteúdo abaixo
 * em vez de flutuar por cima dele) — evita cobrir o avatar do pet quando várias
 * mensagens chegam em sequência.
 */
export function FeedbackBanner({ mensagens }: FeedbackBannerProps) {
  const ultima = mensagens[mensagens.length - 1];

  return (
    <div className="flex min-h-[2rem] items-center justify-center px-3 pt-1.5">
      {ultima && (
        <div
          key={ultima.id}
          className={`animate-[fade-in_0.2s_ease-out] rounded-full px-4 py-1.5 text-center text-sm font-bold shadow-md ${ESTILO_POR_TIPO[ultima.tipo]}`}
        >
          {ultima.texto}
        </div>
      )}
    </div>
  );
}
