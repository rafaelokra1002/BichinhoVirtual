# Bichinho Virtual

Jogo de bichinho virtual estilo Tamagotchi/Pou, voltado para crianças de 5 a 12 anos, em React, Next.js, TypeScript e Tailwind CSS. Cada criança tem sua própria conta (usuário + PIN de 4 dígitos) e o bichinho fica salvo num banco Postgres (Neon), então o progresso segue com ela em qualquer aparelho. Inclui economia com moeda dupla, loja com cosméticos e compra premium simulada, dois minigames, conquistas e recompensas diárias.

## Como rodar

1. Crie um banco Postgres (o projeto foi feito pensando no [Neon](https://neon.tech), free tier já é suficiente).
2. Copie a connection string e crie um arquivo `.env.local` na raiz:
   ```
   DATABASE_URL="postgresql://usuario:senha@host/banco?sslmode=require"
   ```
3. Instale as dependências e envie o schema pro banco:
   ```bash
   npm install
   npm run db:push
   ```
4. Rode o jogo:
   ```bash
   npm run dev
   ```

Abra [http://localhost:3000](http://localhost:3000).

```bash
npm run build      # build de produção
npm run start      # serve o build de produção
npm run lint       # eslint
npm run test       # roda a suíte de testes (vitest) uma vez
npm run test:watch # roda os testes em modo watch
npm run db:push    # aplica mudanças de schema/lib/db/schema.ts no banco
npm run db:studio  # abre o Drizzle Studio pra inspecionar as tabelas
```

**Nunca commite `.env.local`** — ele já está no `.gitignore`. Se a connection string vazar (ex.: colada num chat, commitada por engano), troque a senha do banco no painel do provedor.

## Estrutura de pastas

```
app/
  layout.tsx            Layout raiz, fontes, metadata e manifest do PWA
  page.tsx                Página única: login → escolha de espécie → abas do jogo
  api/
    auth/registrar, entrar, sair, sessao    Rotas de autenticação (cookie de sessão httpOnly)
    pet                                       GET carrega o pet do usuário logado, PUT salva
  globals.css              Tailwind + animações (idle do pet, popups de ação)

lib/
  db/schema.ts             Tabelas Drizzle: usuarios, sessoes, pets
  db/client.ts               Conexão com o Neon (driver HTTP serverless)
  auth/pin.ts                 Hash/verificação do PIN (scrypt, salgado)
  auth/session.ts              Cria/lê/destrói a sessão (cookie httpOnly + tabela `sessoes`)
  auth/validacao.ts             Regras de nome de usuário e PIN, compartilhadas pelas rotas

types/
  pet.ts                    Todos os tipos do domínio (PetState, Especie, ItemLoja, Conquista...)

services/                    Regras de negócio puras — não sabem que o React existe
  apiClient.ts                Chamadas fetch para as rotas de API (auth + pet)
  gameConfig.ts                Constantes ajustáveis: decaimento, catálogo de comidas, loja, espécies, conquistas
  petService.ts                 Ações do pet, passagem de tempo, humor, evolução, cocô
  economyService.ts              Compra/equipar itens, compra simulada de gemas
  achievementService.ts           Verifica e concede conquistas
  dailyRewardService.ts            Sequência de login e recompensa diária
  __tests__/                        Testes (vitest) das funções puras acima

hooks/
  usePetGame.ts             Hook central: autenticação, carga/salvamento no servidor, loop de tempo real
  useSound.ts                 Efeitos sonoros sintetizados via Web Audio API (sem arquivos externos)
  useNotificacoes.ts            Notificações locais (Notification API) quando um atributo fica crítico
  useInstallPrompt.ts            Captura o evento `beforeinstallprompt` pro botão de instalar o PWA

components/
  InstallButton.tsx                        Botão flutuante "Instalar" (só aparece quando o navegador permite)
  TelaDeLogin.tsx, EscolhaDeEspecie.tsx   Entrar/criar conta, e escolher qual bichinho nasce do ovo
  PetAvatar.tsx, PetSpeechBubble.tsx        Cenário + personagem ilustrado em SVG (por espécie) e balão de fala
  StatBar.tsx, StatsPanel.tsx, LevelBadge.tsx    Barras de progresso e nível/XP
  ActionButton.tsx, ActionBar.tsx          Botões de ação (alimentar, brincar, carinho, banhar, curar, dormir)
  FoodPicker.tsx                            Seletor de comidas
  ShopPanel.tsx                              Loja: cosméticos + pacotes de gemas
  AchievementsPanel.tsx                       Lista de conquistas
  MiniGamesHub.tsx, TapMiniGame.tsx, DodgeMiniGame.tsx   Seleção e os dois minigames
  TopBar.tsx, BottomNav.tsx                    Barra superior (usuário/moedas/gemas/sair) e navegação por abas
  Modal.tsx, FeedbackBanner.tsx, GameOverModal.tsx, DailyRewardModal.tsx, OfflineSummaryModal.tsx
  PwaRegister.tsx                                Registra o service worker do PWA

public/
  manifest.json, icon.svg, sw.js            Manifesto do PWA, ícone e service worker básico
```

## Como o jogo funciona

- **Conta**: usuário + PIN de 4 dígitos, sem e-mail — pensado pro público de 5 a 12 anos. O PIN é hasheado com `scrypt` (nunca fica em texto puro no banco), login tem limite de tentativas (5 erradas = 5 min de bloqueio), e a sessão fica num cookie `httpOnly` referenciando uma linha na tabela `sessoes`.
- **Um pet por conta**: ao criar a conta (ou depois que o pet morre), a criança escolhe a espécie (dino, gato, urso ou coelho) e um nome — o bichinho nasce como ovo e "choca" depois de subir de nível.
- **Atributos** (0–100): fome, felicidade, energia, higiene e saúde. Decaem com o tempo real (diferença entre timestamps, não contagem de ticks), então o progresso continua correto mesmo fechando a aba.
- **Ações**: alimentar (4 comidas diferentes), brincar, fazer carinho, banhar, dormir (recupera energia, acorda sozinho ao encher), curar. Saúde cai mais rápido quando outro atributo fica crítico — negligenciar por muito tempo mata o pet. O pet também faz cocô periodicamente; ignorado, suja mais rápido.
- **XP, nível e evolução**: toda ação e a passagem do tempo geram XP; o pet evolui visualmente em 5 estágios (ovo → bebê → filhote → jovem → adulto).
- **Economia**: moedas (minigames, conquistas, recompensa diária) e gemas (premium, só via "compra" simulada). Gastas em comida especial e cosméticos na loja.
- **Minigames**: Toque Rápido (reflexo, 20s) e Desvie dos Obstáculos (trocar de faixa, dificuldade crescente). Cada um paga moedas + XP conforme a pontuação.
- **Retenção**: recompensa diária com sequência de até 7 dias, falas espontâneas do pet, conquistas, e um resumo "enquanto você estava fora" ao reabrir o jogo.
- **Som**: efeitos sonoros gerados em tempo real via Web Audio API (sem depender de arquivos de áudio).
- **Notificações**: o sininho na barra superior pede permissão do navegador e passa a avisar (via Notification API + service worker) quando um atributo crítico é atingido *enquanto a aba está em segundo plano*. São notificações locais — exigem o app ainda aberto (mesmo minimizado); não chegam com o navegador fechado. Para isso, seria preciso Web Push real (ver "Sugestões de melhorias futuras").
- **Instalar como app**: quando o navegador permite (Chrome/Edge/Android — Safari/iOS não expõe esse evento), um botão "Instalar" aparece no canto superior direito em qualquer tela, disparando o prompt nativo do PWA.
- **Persistência**: o pet é salvo no banco a cada mudança relevante, com um *throttle* (no máximo 1x a cada ~10s) pra não bater no banco a cada tick de 3 segundos — e salva imediatamente ao trocar de aba ou fechar a página.

## Preparação para app / PWA

- O `manifest.json` e um service worker básico (`public/sw.js`) já deixam o app instalável e funcionando com uma camada simples de cache. Antes de publicar em loja, troque por uma solução mais robusta de cache de assets (ex.: `next-pwa` ou Serwist) e gere ícones PNG (192×192, 512×512, maskable) além do SVG atual.
- Para empacotar como APK/IPA, o caminho mais direto é envolver este projeto com [Capacitor](https://capacitorjs.com/): `npm i @capacitor/core @capacitor/cli`, `npx cap init`, configurar `next.config.ts` com `output: "export"` (build 100% estático) e então `npx cap add android` / `npx cap add ios`.

## Preparação para monetização real

`services/economyService.ts` já isola a compra de gemas numa única função (`processarCompraSimuladaDeGemas`), pensada para ser o ponto de troca por um SDK de pagamento real (Google Play Billing / App Store / RevenueCat via plugin do Capacitor) sem precisar mexer no resto do jogo.

## Sugestões de melhorias futuras

- **Recuperação de conta**: hoje, esquecer o PIN significa perder o acesso (não há e-mail cadastrado). Dá pra adicionar um e-mail opcional do responsável só pra reset de PIN, sem tornar o cadastro mais pesado pra criança.
- **Rate limiting por IP** nas rotas de auth, além do bloqueio por usuário que já existe — evita tentativas de adivinhar nomes de usuário válidos em massa.
- **Sprites reais**: o personagem é desenhado em SVG por código; a arquitetura (estágio + humor + espécie → props de um componente) já comporta trocar por sprites/spritesheets ilustrados sem mudar a lógica.
- **Mais espécies, minigames e itens**: os catálogos ficam centralizados em `gameConfig.ts` — adicionar itens é só estender os arrays.
- **Web Push de verdade**: hoje as notificações (`useNotificacoes.ts`) são locais — só funcionam com o app aberto (mesmo minimizado). Pra avisar com o navegador fechado, precisa de Web Push real: chaves VAPID, uma tabela de inscrições no banco, e um Cron Job (ex.: Vercel Cron) verificando os pets periodicamente.
- **Mais cobertura de testes**: `services/__tests__/` já cobre decaimento, morte, level up, economia, conquistas e a recompensa diária (`npm run test`); ainda falta cobrir os componentes React e as rotas de API.
- **Migrações versionadas**: o projeto usa `drizzle-kit push` (aplica o schema direto, bom pra iterar rápido); antes de produção com dados reais de verdade, vale trocar por `drizzle-kit generate` + `migrate` para ter histórico de migrações.
