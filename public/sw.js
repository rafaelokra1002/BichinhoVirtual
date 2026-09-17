const CACHE_NAME = "bichinho-virtual-v1";
const APP_SHELL = ["/", "/manifest.json", "/icon.svg"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((chaves) => Promise.all(chaves.filter((chave) => chave !== CACHE_NAME).map((chave) => caches.delete(chave))))
  );
  self.clients.claim();
});

// Ao tocar numa notificação do bichinho, foca uma aba já aberta do jogo (ou abre uma nova).
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((listaDeClientes) => {
      for (const cliente of listaDeClientes) {
        if ("focus" in cliente) return cliente.focus();
      }
      if (self.clients.openWindow) return self.clients.openWindow("/");
    })
  );
});

// Estratégia simples: tenta a rede, cai para o cache se estiver offline.
// Suficiente para o app shell continuar abrindo sem internet; não é um cache
// completo de todos os assets com hash do Next.js (ver README para evoluir isso
// com next-pwa/Serwist antes de publicar em produção).
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        const copia = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copia));
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});
