"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const PREFERENCIA_KEY = "bichinho-virtual:notificacoes";

/**
 * Notificações locais (Notification API + service worker), sem servidor: avisam o
 * jogador quando o bichinho precisa de atenção enquanto a aba está em segundo plano.
 * Diferente de Web Push, só funcionam com o app ainda aberto (mesmo minimizado) —
 * não sobrevivem ao navegador fechado. Ver README para evoluir pra push real.
 */
export function useNotificacoes() {
  const suportado = typeof window !== "undefined" && "Notification" in window;
  const [permitido, setPermitido] = useState(false);

  useEffect(() => {
    if (!suportado) return;
    try {
      const preferencia = window.localStorage.getItem(PREFERENCIA_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- carregamento único a partir do localStorage (só existe no cliente)
      if (preferencia === "1" && Notification.permission === "granted") setPermitido(true);
    } catch {
      // ignorado
    }
  }, [suportado]);

  const ativar = useCallback(async (): Promise<boolean> => {
    if (!suportado) return false;
    const resultado = await Notification.requestPermission();
    const concedida = resultado === "granted";
    setPermitido(concedida);
    try {
      window.localStorage.setItem(PREFERENCIA_KEY, concedida ? "1" : "0");
    } catch {
      // ignorado
    }
    return concedida;
  }, [suportado]);

  const desativar = useCallback(() => {
    setPermitido(false);
    try {
      window.localStorage.setItem(PREFERENCIA_KEY, "0");
    } catch {
      // ignorado
    }
  }, []);

  const notificar = useCallback(
    async (titulo: string, corpo: string) => {
      if (!permitido || !suportado || Notification.permission !== "granted") return;
      try {
        const registro = await navigator.serviceWorker?.getRegistration();
        if (registro) {
          await registro.showNotification(titulo, { body: corpo, icon: "/icon.svg", tag: "bichinho-aviso" });
        } else {
          new Notification(titulo, { body: corpo, icon: "/icon.svg" });
        }
      } catch {
        // notificação é um extra — nunca deve quebrar o resto do jogo
      }
    },
    [permitido, suportado]
  );

  return useMemo(
    () => ({ suportado, permitido, ativar, desativar, notificar }),
    [suportado, permitido, ativar, desativar, notificar]
  );
}
