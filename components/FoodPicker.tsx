import { Comida, PetState } from "@/types/pet";
import { CATALOGO_DE_COMIDAS } from "@/services/gameConfig";
import { Modal } from "./Modal";

interface FoodPickerProps {
  pet: PetState;
  onEscolher: (comida: Comida) => void;
  onFechar: () => void;
}

export function FoodPicker({ pet, onEscolher, onFechar }: FoodPickerProps) {
  return (
    <Modal titulo="O que seu pet vai comer?" onFechar={onFechar}>
      <div className="grid grid-cols-2 gap-3">
        {CATALOGO_DE_COMIDAS.map((comida) => {
          const podeComprar = pet.moedas >= comida.preco;
          return (
            <button
              key={comida.id}
              type="button"
              disabled={!podeComprar}
              onClick={() => {
                onEscolher(comida);
                onFechar();
              }}
              className="flex flex-col items-center gap-1 rounded-2xl border-2 border-stone-100 bg-stone-50 p-3 text-center transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100 dark:border-stone-800 dark:bg-stone-800/40"
            >
              <span className="text-4xl drop-shadow-sm">{comida.icone}</span>
              <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{comida.nome}</span>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                {comida.preco === 0 ? "Grátis" : `🪙 ${comida.preco}`}
              </span>
            </button>
          );
        })}
      </div>
    </Modal>
  );
}
