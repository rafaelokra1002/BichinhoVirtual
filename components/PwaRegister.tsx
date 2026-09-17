"use client";

import { useEffect } from "react";

/** Registra o service worker do app shell, habilitando a instalação como PWA. */
export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Falha silenciosa: o jogo continua funcionando normalmente sem o service worker.
      });
    }
  }, []);

  return null;
}
