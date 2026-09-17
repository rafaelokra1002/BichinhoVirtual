import { PetState, ItemLoja } from "@/types/pet";
import { CATALOGO_DA_LOJA, PACOTES_DE_GEMAS, PacoteDeGemas } from "@/services/gameConfig";

interface ItemCardProps {
  item: ItemLoja;
  pet: PetState;
  onComprar: (item: ItemLoja) => void;
  onEquipar: (itemId: string | null) => void;
}

function ItemCard({ item, pet, onComprar, onEquipar }: ItemCardProps) {
  const possui = pet.itensComprados.includes(item.id);
  const equipado = pet.acessorioEquipadoId === item.id;
  const nivelOk = pet.nivel >= item.nivelMinimo;
  const simbolo = item.moeda === "moedas" ? "🪙" : "💎";

  return (
    <div className="flex flex-col items-center gap-2 rounded-2xl border-2 border-stone-100 bg-stone-50 p-3 text-center dark:border-stone-800 dark:bg-stone-800/40">
      <span className="text-4xl drop-shadow-sm">{item.icone}</span>
      <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{item.nome}</span>
      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{item.descricao}</span>

      {!nivelOk && (
        <span className="text-xs font-bold text-red-500">Nível {item.nivelMinimo} necessário</span>
      )}

      {possui ? (
        <button
          type="button"
          onClick={() => onEquipar(equipado ? null : item.id)}
          className={`mt-1 w-full rounded-full px-3 py-1.5 text-xs font-bold transition-all active:translate-y-[2px] ${
            equipado
              ? "bg-green-600 text-white shadow-[0_3px_0_0_#15803d] active:shadow-[0_1px_0_0_#15803d]"
              : "bg-stone-200 text-stone-700 shadow-[0_3px_0_0_#a8a29e] active:shadow-[0_1px_0_0_#a8a29e] dark:bg-stone-700 dark:text-stone-100 dark:shadow-[0_3px_0_0_#44403c]"
          }`}
        >
          {equipado ? "Equipado ✓" : "Equipar"}
        </button>
      ) : (
        <button
          type="button"
          disabled={!nivelOk}
          onClick={() => onComprar(item)}
          className="mt-1 w-full rounded-full bg-gradient-to-b from-purple-500 to-purple-600 px-3 py-1.5 text-xs font-bold text-white shadow-[0_3px_0_0_#6d28d9] transition-all active:translate-y-[2px] active:shadow-[0_1px_0_0_#6d28d9] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {simbolo} {item.preco}
        </button>
      )}
    </div>
  );
}

interface PacoteCardProps {
  pacote: PacoteDeGemas;
  onComprar: (pacote: PacoteDeGemas) => void;
}

function PacoteCard({ pacote, onComprar }: PacoteCardProps) {
  return (
    <button
      type="button"
      onClick={() => onComprar(pacote)}
      className={`flex flex-col items-center gap-1 rounded-2xl border-2 p-3 text-center transition-all active:scale-95 ${
        pacote.destaque
          ? "border-purple-400 bg-purple-50 shadow-[0_3px_0_0_rgba(168,85,247,0.3)] dark:border-purple-500 dark:bg-purple-950/40"
          : "border-stone-100 bg-stone-50 dark:border-stone-800 dark:bg-stone-800/40"
      }`}
    >
      <span className="text-3xl drop-shadow-sm">💎</span>
      <span className="text-sm font-bold text-stone-800 dark:text-stone-100">{pacote.gemas} gemas</span>
      <span className="text-xs font-medium text-stone-500 dark:text-stone-400">{pacote.precoExibido}</span>
      <span className="mt-1 rounded-full bg-gradient-to-b from-purple-500 to-purple-600 px-2 py-0.5 text-[10px] font-bold text-white">
        Comprar (simulado)
      </span>
    </button>
  );
}

interface ShopPanelProps {
  pet: PetState;
  onComprarItem: (item: ItemLoja) => void;
  onEquiparItem: (itemId: string | null) => void;
  onComprarGemas: (pacote: PacoteDeGemas) => void;
}

export function ShopPanel({ pet, onComprarItem, onEquiparItem, onComprarGemas }: ShopPanelProps) {
  return (
    <div className="flex flex-col gap-6 pb-4">
      <section>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Roupas e acessórios
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {CATALOGO_DA_LOJA.map((item) => (
            <ItemCard key={item.id} item={item} pet={pet} onComprar={onComprarItem} onEquipar={onEquiparItem} />
          ))}
        </div>
      </section>

      <section>
        <h3 className="mb-2 text-sm font-bold uppercase tracking-wide text-stone-500 dark:text-stone-400">
          Loja de gemas
        </h3>
        <p className="mb-2 text-xs text-stone-500 dark:text-stone-400">
          Demonstração: nenhuma cobrança real é feita. Em produção, plugaria em um SDK de pagamento (loja de apps ou
          RevenueCat).
        </p>
        <div className="grid grid-cols-3 gap-2">
          {PACOTES_DE_GEMAS.map((pacote) => (
            <PacoteCard key={pacote.id} pacote={pacote} onComprar={onComprarGemas} />
          ))}
        </div>
      </section>
    </div>
  );
}
