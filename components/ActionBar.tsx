import { PetState } from "@/types/pet";
import { MAX_STAT } from "@/services/gameConfig";
import { ActionButton } from "./ActionButton";

interface ActionBarProps {
  pet: PetState;
  onAbrirComida: () => void;
  onBrincar: () => void;
  onCarinho: () => void;
  onBanhar: () => void;
  onCurar: () => void;
  onDormir: () => void;
  onAcordar: () => void;
}

export function ActionBar({
  pet,
  onAbrirComida,
  onBrincar,
  onCarinho,
  onBanhar,
  onCurar,
  onDormir,
  onAcordar,
}: ActionBarProps) {
  const bloqueadoPorSono = pet.dormindo;

  return (
    <div className="grid w-full grid-cols-3 gap-2">
      <ActionButton
        label="Alimentar"
        icon="🍖"
        onClick={onAbrirComida}
        disabled={bloqueadoPorSono || pet.fome >= MAX_STAT}
        colorClass="bg-gradient-to-b from-orange-400 to-orange-500 shadow-[0_4px_0_0_#c2410c] active:shadow-[0_1px_0_0_#c2410c]"
      />
      <ActionButton
        label="Brincar"
        icon="🎾"
        onClick={onBrincar}
        disabled={bloqueadoPorSono || pet.energia <= 0}
        colorClass="bg-gradient-to-b from-pink-400 to-pink-500 shadow-[0_4px_0_0_#be185d] active:shadow-[0_1px_0_0_#be185d]"
      />
      <ActionButton
        label="Carinho"
        icon="🥰"
        onClick={onCarinho}
        disabled={pet.felicidade >= MAX_STAT}
        colorClass="bg-gradient-to-b from-rose-400 to-rose-500 shadow-[0_4px_0_0_#be123c] active:shadow-[0_1px_0_0_#be123c]"
      />
      <ActionButton
        label="Banhar"
        icon="🧼"
        onClick={onBanhar}
        disabled={bloqueadoPorSono || pet.higiene >= MAX_STAT}
        colorClass="bg-gradient-to-b from-cyan-400 to-cyan-500 shadow-[0_4px_0_0_#0e7490] active:shadow-[0_1px_0_0_#0e7490]"
      />
      <ActionButton
        label="Curar"
        icon="💊"
        onClick={onCurar}
        disabled={pet.saude >= MAX_STAT}
        colorClass="bg-gradient-to-b from-green-400 to-green-500 shadow-[0_4px_0_0_#15803d] active:shadow-[0_1px_0_0_#15803d]"
      />
      {pet.dormindo ? (
        <ActionButton
          label="Acordar"
          icon="⏰"
          onClick={onAcordar}
          colorClass="bg-gradient-to-b from-blue-400 to-blue-500 shadow-[0_4px_0_0_#1d4ed8] active:shadow-[0_1px_0_0_#1d4ed8]"
        />
      ) : (
        <ActionButton
          label="Dormir"
          icon="😴"
          onClick={onDormir}
          disabled={pet.energia >= MAX_STAT}
          colorClass="bg-gradient-to-b from-blue-400 to-blue-500 shadow-[0_4px_0_0_#1d4ed8] active:shadow-[0_1px_0_0_#1d4ed8]"
        />
      )}
    </div>
  );
}
