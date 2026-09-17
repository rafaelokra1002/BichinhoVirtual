"use client";

import { useCallback, useRef, useState } from "react";
import { usePetGame } from "@/hooks/usePetGame";
import { CATALOGO_DA_LOJA } from "@/services/gameConfig";
import { Comida } from "@/types/pet";
import { AcaoVisualState, PetAvatar, TipoDeAcaoVisual } from "@/components/PetAvatar";
import { PetSpeechBubble } from "@/components/PetSpeechBubble";
import { StatsPanel } from "@/components/StatsPanel";
import { LevelBadge } from "@/components/LevelBadge";
import { ActionBar } from "@/components/ActionBar";
import { FeedbackBanner } from "@/components/FeedbackBanner";
import { GameOverModal } from "@/components/GameOverModal";
import { TopBar } from "@/components/TopBar";
import { BottomNav, AbaDoJogo } from "@/components/BottomNav";
import { FoodPicker } from "@/components/FoodPicker";
import { ShopPanel } from "@/components/ShopPanel";
import { AchievementsPanel } from "@/components/AchievementsPanel";
import { MiniGamesHub } from "@/components/MiniGamesHub";
import { DailyRewardModal } from "@/components/DailyRewardModal";
import { OfflineSummaryModal } from "@/components/OfflineSummaryModal";
import { EscolhaDeEspecie } from "@/components/EscolhaDeEspecie";
import { TelaDeLogin } from "@/components/TelaDeLogin";

export default function Home() {
  const {
    usuario,
    autenticar,
    sairDaConta,
    pet,
    humor,
    estagio,
    xpNecessario,
    mensagens,
    falaAtual,
    carregando,
    precisaAutenticar,
    precisaEscolherEspecie,
    escolherEspecieEComecar,
    resumoOffline,
    fecharResumoOffline,
    mostrarRecompensaDiaria,
    statusRecompensaDiaria,
    resgatarRecompensaDiaria,
    fecharModalRecompensaDiaria,
    abrirModalRecompensaDiaria,
    alimentar,
    brincar,
    acariciar,
    banhar,
    curar,
    limparCoco,
    dormir,
    acordar,
    reiniciar,
    registrarResultadoMinigame,
    comprarItem,
    equiparItem,
    comprarPacoteDeGemas,
    som,
  } = usePetGame();

  const [aba, setAba] = useState<AbaDoJogo>("inicio");
  const [mostrarComida, setMostrarComida] = useState(false);
  const [acaoVisual, setAcaoVisual] = useState<AcaoVisualState | null>(null);
  const proximaChaveDeAcao = useRef(1);

  const dispararAnimacaoDeAcao = useCallback((tipo: TipoDeAcaoVisual, emoji: string) => {
    const chave = proximaChaveDeAcao.current++;
    setAcaoVisual({ tipo, emoji, chave });
    setTimeout(() => {
      setAcaoVisual((atual) => (atual?.chave === chave ? null : atual));
    }, 1000);
  }, []);

  if (carregando) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="text-4xl animate-bounce">🥚</span>
          <p className="font-semibold text-stone-500 dark:text-stone-400">Carregando seu bichinho...</p>
        </div>
      </div>
    );
  }

  if (precisaAutenticar) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <main className="flex w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white shadow-[0_20px_45px_-15px_rgba(147,51,234,0.4)] dark:border-stone-800/70 dark:bg-stone-900">
          <TelaDeLogin onAutenticar={autenticar} />
        </main>
      </div>
    );
  }

  if (precisaEscolherEspecie) {
    return (
      <div className="flex flex-1 items-center justify-center px-4 py-8">
        <main className="flex w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white shadow-[0_20px_45px_-15px_rgba(147,51,234,0.4)] dark:border-stone-800/70 dark:bg-stone-900">
          <EscolhaDeEspecie onEscolher={escolherEspecieEComecar} />
        </main>
      </div>
    );
  }

  if (!pet || !humor || !estagio) return null;

  const acessorioIcone = pet.acessorioEquipadoId
    ? (CATALOGO_DA_LOJA.find((item) => item.id === pet.acessorioEquipadoId)?.icone ?? null)
    : null;

  const handleAlimentar = (comida: Comida) => {
    alimentar(comida);
    dispararAnimacaoDeAcao("comendo", comida.icone);
  };
  const handleBrincar = () => {
    brincar();
    dispararAnimacaoDeAcao("brincando", "🎾");
  };
  const handleCarinho = () => {
    acariciar();
    dispararAnimacaoDeAcao("acariciando", "💗");
  };
  const handleBanhar = () => {
    banhar();
    dispararAnimacaoDeAcao("banhando", "🫧");
  };
  const handleCurar = () => {
    curar();
    dispararAnimacaoDeAcao("curando", "✨");
  };
  const handleDormir = () => {
    dormir();
    dispararAnimacaoDeAcao("dormindo", "💤");
  };
  const handleAcordar = () => {
    acordar();
    dispararAnimacaoDeAcao("acordando", "☀️");
  };

  return (
    <div className="flex flex-1 items-center justify-center px-4 py-8">
      <main className="relative flex w-full max-w-sm flex-col overflow-hidden rounded-[2rem] border-4 border-white/70 bg-white shadow-[0_20px_45px_-15px_rgba(147,51,234,0.4)] dark:border-stone-800/70 dark:bg-stone-900">
        {!pet.vivo && (
          <GameOverModal nome={pet.nome} nivelAlcancado={pet.nivel} onReiniciar={() => reiniciar()} />
        )}

        {resumoOffline && <OfflineSummaryModal resumo={resumoOffline} onFechar={fecharResumoOffline} />}

        {mostrarRecompensaDiaria && statusRecompensaDiaria && (
          <DailyRewardModal
            diaDaSequencia={statusRecompensaDiaria.proximoDiaDaSequencia}
            onResgatar={resgatarRecompensaDiaria}
            onFechar={fecharModalRecompensaDiaria}
          />
        )}

        {mostrarComida && (
          <FoodPicker pet={pet} onEscolher={handleAlimentar} onFechar={() => setMostrarComida(false)} />
        )}

        <TopBar
          nomeDeUsuario={usuario?.nomeDeUsuario ?? ""}
          moedas={pet.moedas}
          gemas={pet.gemas}
          mudo={som.mudo}
          recompensaDiariaDisponivel={Boolean(statusRecompensaDiaria?.disponivel)}
          onAlternarSom={som.alternarMudo}
          onAbrirRecompensaDiaria={abrirModalRecompensaDiaria}
          onSair={sairDaConta}
        />

        <FeedbackBanner mensagens={mensagens} />

        <div className="flex flex-col gap-5 px-6 pb-6 pt-1">
          {aba === "inicio" && (
            <>
              <div className="relative flex flex-col items-center gap-2 overflow-hidden rounded-3xl border-2 border-stone-100 shadow-inner dark:border-stone-800">
                {falaAtual && (
                  <div className="absolute left-1/2 top-3 z-10 -translate-x-1/2">
                    <PetSpeechBubble texto={falaAtual} />
                  </div>
                )}
                <PetAvatar
                  estagio={estagio}
                  humor={humor}
                  nome={pet.nome}
                  especie={pet.especie}
                  acessorioIcone={acessorioIcone}
                  acaoVisual={acaoVisual}
                  cocos={pet.cocos}
                  onLimparCoco={limparCoco}
                />
              </div>

              <LevelBadge nivel={pet.nivel} xp={pet.xp} xpNecessario={xpNecessario} />

              <StatsPanel pet={pet} />

              <ActionBar
                pet={pet}
                onAbrirComida={() => setMostrarComida(true)}
                onBrincar={handleBrincar}
                onCarinho={handleCarinho}
                onBanhar={handleBanhar}
                onCurar={handleCurar}
                onDormir={handleDormir}
                onAcordar={handleAcordar}
              />
            </>
          )}

          {aba === "minigames" && (
            <MiniGamesHub
              minigamesJogados={pet.minigamesJogados}
              onFinalizar={registrarResultadoMinigame}
              onTocarSom={som.tocar}
            />
          )}

          {aba === "loja" && (
            <ShopPanel
              pet={pet}
              onComprarItem={comprarItem}
              onEquiparItem={equiparItem}
              onComprarGemas={comprarPacoteDeGemas}
            />
          )}

          {aba === "conquistas" && <AchievementsPanel pet={pet} />}
        </div>

        <BottomNav abaAtiva={aba} onSelecionar={setAba} />
      </main>
    </div>
  );
}
