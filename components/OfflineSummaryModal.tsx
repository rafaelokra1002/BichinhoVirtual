import { ResumoOffline } from "@/types/pet";
import { Modal } from "./Modal";

interface OfflineSummaryModalProps {
  resumo: ResumoOffline;
  onFechar: () => void;
}

function linhaDeAtributo(icone: string, nome: string, perdido: number) {
  if (perdido <= 0) return null;
  return (
    <li key={nome} className="flex items-center justify-between text-sm">
      <span>
        {icone} {nome}
      </span>
      <span className="font-semibold text-red-500">-{perdido}</span>
    </li>
  );
}

export function OfflineSummaryModal({ resumo, onFechar }: OfflineSummaryModalProps) {
  return (
    <Modal titulo="Enquanto você estava fora" onFechar={onFechar}>
      <div className="flex flex-col gap-3">
        <p className="text-sm text-stone-600 dark:text-stone-300">
          Você ficou fora por cerca de {resumo.minutosFora} minuto{resumo.minutosFora === 1 ? "" : "s"}.
        </p>

        {resumo.petMorreu ? (
          <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-600 dark:bg-red-950/30 dark:text-red-400">
            Infelizmente seu pet não resistiu à ausência. 💔
          </p>
        ) : (
          <ul className="flex flex-col gap-1 rounded-xl bg-stone-50 p-3 dark:bg-stone-800">
            {[
              linhaDeAtributo("🍖", "Fome", resumo.fomePerdida),
              linhaDeAtributo("😊", "Felicidade", resumo.felicidadePerdida),
              linhaDeAtributo("⚡", "Energia", resumo.energiaPerdida),
              linhaDeAtributo("🧼", "Higiene", resumo.higienePerdida),
              linhaDeAtributo("❤️", "Saúde", resumo.saudePerdida),
            ].filter(Boolean)}
          </ul>
        )}

        {!resumo.petMorreu && resumo.cocosNovos > 0 && (
          <p className="text-sm text-stone-600 dark:text-stone-300">
            💩 Seu pet fez {resumo.cocosNovos} cocô{resumo.cocosNovos === 1 ? "" : "s"}. Bora limpar?
          </p>
        )}

        <button
          type="button"
          onClick={onFechar}
          className="w-full rounded-full bg-stone-800 py-2.5 font-extrabold text-white shadow-[0_4px_0_0_#292524] transition-all duration-100 active:translate-y-[3px] active:shadow-[0_1px_0_0_#292524] dark:bg-stone-100 dark:text-stone-900 dark:shadow-[0_4px_0_0_#78716c]"
        >
          Entendi
        </button>
      </div>
    </Modal>
  );
}
