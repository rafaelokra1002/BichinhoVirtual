import { PetState } from "@/types/pet";
import { CRITICAL_THRESHOLD } from "@/services/gameConfig";
import { StatBar } from "./StatBar";

function corPorValor(value: number, corBase: string): string {
  if (value <= CRITICAL_THRESHOLD) return "from-red-400 to-red-500";
  if (value <= 50) return "from-amber-400 to-amber-500";
  return corBase;
}

interface StatsPanelProps {
  pet: PetState;
}

export function StatsPanel({ pet }: StatsPanelProps) {
  return (
    <div className="flex w-full flex-col gap-3">
      <StatBar label="Fome" icon="🍖" value={pet.fome} colorClass={corPorValor(pet.fome, "from-orange-400 to-orange-500")} />
      <StatBar
        label="Felicidade"
        icon="😊"
        value={pet.felicidade}
        colorClass={corPorValor(pet.felicidade, "from-pink-400 to-pink-500")}
      />
      <StatBar
        label="Energia"
        icon="⚡"
        value={pet.energia}
        colorClass={corPorValor(pet.energia, "from-blue-400 to-blue-500")}
      />
      <StatBar
        label="Higiene"
        icon="🧼"
        value={pet.higiene}
        colorClass={corPorValor(pet.higiene, "from-cyan-400 to-cyan-500")}
        aviso={pet.cocos > 0 ? `💩×${pet.cocos}` : undefined}
      />
      <StatBar
        label="Saúde"
        icon="❤️"
        value={pet.saude}
        colorClass={corPorValor(pet.saude, "from-green-400 to-green-500")}
      />
    </div>
  );
}
