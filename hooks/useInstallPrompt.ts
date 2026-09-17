"use client";

import { useCallback, useEffect, useState } from "react";

/** Evento não padronizado no TS lib.dom — disparado pelo navegador quando o PWA pode ser instalado. */
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

/**
 * Guarda o evento `beforeinstallprompt` (o navegador só permite disparar o prompt
 * de instalação uma vez, em resposta a um clique do usuário) e expõe uma função
 * pra acioná-lo a partir de um botão nosso, com nosso próprio texto/estilo.
 */
export function useInstallPrompt() {
  const [eventoDeInstalacao, setEventoDeInstalacao] = useState<BeforeInstallPromptEvent | null>(null);
  const [instalado, setInstalado] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- checagem única do modo de exibição atual (só existe no cliente)
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalado(true);

    const aoFicarInstalavel = (evento: Event) => {
      evento.preventDefault();
      setEventoDeInstalacao(evento as BeforeInstallPromptEvent);
    };
    const aoInstalar = () => {
      setInstalado(true);
      setEventoDeInstalacao(null);
    };

    window.addEventListener("beforeinstallprompt", aoFicarInstalavel);
    window.addEventListener("appinstalled", aoInstalar);
    return () => {
      window.removeEventListener("beforeinstallprompt", aoFicarInstalavel);
      window.removeEventListener("appinstalled", aoInstalar);
    };
  }, []);

  const instalar = useCallback(async () => {
    if (!eventoDeInstalacao) return;
    await eventoDeInstalacao.prompt();
    const escolha = await eventoDeInstalacao.userChoice;
    if (escolha.outcome === "accepted") setInstalado(true);
    setEventoDeInstalacao(null);
  }, [eventoDeInstalacao]);

  return { podeInstalar: eventoDeInstalacao !== null && !instalado, instalar };
}
