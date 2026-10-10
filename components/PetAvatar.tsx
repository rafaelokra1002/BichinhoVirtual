import { Especie, EvolutionStage, PetMood } from "@/types/pet";
import { CATALOGO_DE_ESPECIES } from "@/services/gameConfig";

export type TipoDeAcaoVisual =
  | "comendo"
  | "brincando"
  | "acariciando"
  | "banhando"
  | "curando"
  | "dormindo"
  | "acordando";

export interface AcaoVisualState {
  tipo: TipoDeAcaoVisual;
  emoji: string;
  chave: number;
}

interface PetAvatarProps {
  estagio: EvolutionStage;
  humor: PetMood;
  nome: string;
  especie: Especie;
  acessorioIcone?: string | null;
  acaoVisual?: AcaoVisualState | null;
  cocos?: number;
  onLimparCoco?: () => void;
}

/** Posições dos cocôs no chão, alternando dos dois lados sem sobrepor o bichinho. */
const POSICAO_DOS_COCOS = [
  { x: 62, y: 302 },
  { x: 258, y: 302 },
  { x: 42, y: 282 },
  { x: 278, y: 282 },
];

const NOME_DO_ESTAGIO: Record<EvolutionStage, string> = {
  ovo: "Ovo",
  bebe: "Bebê",
  filhote: "Filhote",
  jovem: "Jovem",
  adulto: "Adulto",
};

const TEMA_DO_ESTAGIO: Record<EvolutionStage, string> = {
  ovo: "bg-stone-100 text-stone-600 dark:bg-stone-800 dark:text-stone-300",
  bebe: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  filhote: "bg-lime-100 text-lime-700 dark:bg-lime-900/50 dark:text-lime-300",
  jovem: "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300",
  adulto: "bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300",
};

const ESCALA_DO_ESTAGIO: Partial<Record<EvolutionStage, number>> = {
  bebe: 0.78,
  filhote: 0.88,
  jovem: 1,
  adulto: 1.08,
};

const ESPINHOS_DO_ESTAGIO: Partial<Record<EvolutionStage, number>> = {
  bebe: 2,
  filhote: 3,
  jovem: 4,
  adulto: 5,
};

const POSICAO_DOS_ESPINHOS = [
  { x: 18, y: -230 },
  { x: 42, y: -222 },
  { x: 62, y: -204 },
  { x: 76, y: -180 },
  { x: 83, y: -152 },
];

/** Animação contínua de "estar vivo", tocando em loop sempre que nenhuma ação está em curso. */
const ANIMACAO_IDLE_POR_HUMOR: Record<PetMood, string> = {
  feliz: "animate-bounce",
  animado: "animate-bounce",
  triste: "animate-[idle-sway_3s_ease-in-out_infinite]",
  cansado: "animate-[idle-bob_2.6s_ease-in-out_infinite]",
  doente: "animate-[idle-shake_1.1s_ease-in-out_infinite]",
  sujo: "animate-[idle-sway_2.2s_ease-in-out_infinite]",
  dormindo: "animate-[idle-bob_3.2s_ease-in-out_infinite]",
  morto: "",
};

/** Qual animação o corpo faz na hora da ação. */
const ANIMACAO_DO_AVATAR_POR_ACAO: Record<TipoDeAcaoVisual, string> = {
  comendo: "animate-[pop_0.35s_ease-in-out_3]",
  brincando: "animate-[wiggle_0.3s_ease-in-out_4]",
  acariciando: "animate-[pop_0.5s_ease-in-out_2]",
  banhando: "animate-[wiggle_0.35s_ease-in-out_3]",
  curando: "animate-[pop_0.4s_ease-in-out_2]",
  dormindo: "animate-[pop_0.4s_ease-in-out_1]",
  acordando: "animate-[pop_0.4s_ease-in-out_1]",
};

type FormaDosOlhos = "aberto" | "meio" | "fechado" | "coracao" | "espiral" | "x" | "surpresa";
type FormaDaBoca = "sorriso" | "triste" | "reta" | "aberta" | "o";

interface Expressao {
  olhos: FormaDosOlhos;
  boca: FormaDaBoca;
}

const EXPRESSAO_POR_HUMOR: Record<PetMood, Expressao> = {
  feliz: { olhos: "aberto", boca: "sorriso" },
  animado: { olhos: "aberto", boca: "aberta" },
  triste: { olhos: "meio", boca: "triste" },
  cansado: { olhos: "meio", boca: "reta" },
  doente: { olhos: "espiral", boca: "triste" },
  sujo: { olhos: "meio", boca: "reta" },
  dormindo: { olhos: "fechado", boca: "o" },
  morto: { olhos: "x", boca: "reta" },
};

const EXPRESSAO_POR_ACAO: Record<TipoDeAcaoVisual, Expressao> = {
  comendo: { olhos: "aberto", boca: "aberta" },
  brincando: { olhos: "aberto", boca: "aberta" },
  acariciando: { olhos: "coracao", boca: "sorriso" },
  banhando: { olhos: "fechado", boca: "sorriso" },
  curando: { olhos: "meio", boca: "sorriso" },
  dormindo: { olhos: "fechado", boca: "o" },
  acordando: { olhos: "surpresa", boca: "o" },
};

/** Gera os pontos de uma espiral simples, usada no olho "tonto" (doente). */
function pontosDaEspiral(cx: number, cy: number, voltas = 1.6, raioMax = 10): string {
  const passos = 24;
  const pontos: string[] = [];
  for (let i = 0; i <= passos; i++) {
    const t = i / passos;
    const angulo = t * voltas * Math.PI * 2;
    const raio = t * raioMax;
    pontos.push(`${cx + raio * Math.cos(angulo)},${cy + raio * Math.sin(angulo)}`);
  }
  return pontos.join(" ");
}

function Olho({ cx, cy, tipo }: { cx: number; cy: number; tipo: FormaDosOlhos }) {
  switch (tipo) {
    case "fechado":
      return (
        <path
          d={`M${cx - 12},${cy} Q${cx},${cy + 9} ${cx + 12},${cy}`}
          stroke="#2d2d2d"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      );
    case "meio":
      return (
        <g>
          <circle cx={cx} cy={cy} r={13} fill="white" />
          <path d={`M${cx - 13},${cy - 2} A13,13 0 0 1 ${cx + 13},${cy - 2} Z`} fill="#2d2d2d" />
          <circle cx={cx} cy={cy + 5} r={5} fill="#2d2d2d" />
        </g>
      );
    case "coracao":
      return (
        <path
          d={`M${cx},${cy + 9} C${cx - 15},${cy - 5} ${cx - 8},${cy - 17} ${cx},${cy - 8} C${cx + 8},${cy - 17} ${cx + 15},${cy - 5} ${cx},${cy + 9} Z`}
          fill="#f43f5e"
        />
      );
    case "espiral":
      return (
        <g>
          <circle cx={cx} cy={cy} r={13} fill="white" />
          <polyline
            points={pontosDaEspiral(cx, cy)}
            fill="none"
            stroke="#2d2d2d"
            strokeWidth={2.2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      );
    case "x":
      return (
        <g stroke="#2d2d2d" strokeWidth={3.5} strokeLinecap="round">
          <line x1={cx - 9} y1={cy - 9} x2={cx + 9} y2={cy + 9} />
          <line x1={cx - 9} y1={cy + 9} x2={cx + 9} y2={cy - 9} />
        </g>
      );
    case "surpresa":
      return (
        <g>
          <circle cx={cx} cy={cy} r={15} fill="white" stroke="#2d2d2d" strokeWidth={2} />
          <circle cx={cx} cy={cy} r={6} fill="#2d2d2d" />
        </g>
      );
    case "aberto":
    default:
      return (
        <g>
          <circle cx={cx} cy={cy} r={13} fill="white" />
          <circle cx={cx + 2} cy={cy + 2} r={7} fill="#2d2d2d" />
          <circle cx={cx + 4.5} cy={cy - 1} r={2} fill="white" />
        </g>
      );
  }
}

function Boca({ cx, cy, tipo }: { cx: number; cy: number; tipo: FormaDaBoca }) {
  switch (tipo) {
    case "sorriso":
      return (
        <path
          d={`M${cx - 14},${cy - 2} Q${cx},${cy + 13} ${cx + 14},${cy - 2}`}
          stroke="#2d2d2d"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      );
    case "triste":
      return (
        <path
          d={`M${cx - 12},${cy + 7} Q${cx},${cy - 6} ${cx + 12},${cy + 7}`}
          stroke="#2d2d2d"
          strokeWidth={4}
          fill="none"
          strokeLinecap="round"
        />
      );
    case "aberta":
      return <ellipse cx={cx} cy={cy + 4} rx={11} ry={10} fill="#7a2e2e" />;
    case "o":
      return <ellipse cx={cx} cy={cy} rx={6} ry={7} fill="#7a2e2e" />;
    case "reta":
    default:
      return <line x1={cx - 12} y1={cy} x2={cx + 12} y2={cy} stroke="#2d2d2d" strokeWidth={4} strokeLinecap="round" />;
  }
}

function Nuvem({ x, y, escala = 1 }: { x: number; y: number; escala?: number }) {
  return (
    <g transform={`translate(${x},${y}) scale(${escala})`} fill="white" opacity={0.9}>
      <ellipse cx={0} cy={0} rx={26} ry={14} />
      <ellipse cx={-20} cy={4} rx={16} ry={10} />
      <ellipse cx={20} cy={4} rx={18} ry={11} />
    </g>
  );
}

function MoitaComOlhos({ x, espelhado = false }: { x: number; espelhado?: boolean }) {
  const dx = espelhado ? -1 : 1;
  return (
    <g transform={`translate(${x},198)`}>
      <ellipse cx={0} cy={10} rx={22} ry={16} fill="#1f6f4a" />
      <circle cx={-6 * dx} cy={-4} r={7} fill="#eafff3" />
      <circle cx={8 * dx} cy={-2} r={6} fill="#eafff3" />
      <circle cx={-6 * dx} cy={-3} r={3} fill="#12331f" />
      <circle cx={8 * dx} cy={-1} r={2.6} fill="#12331f" />
    </g>
  );
}

function Chuva() {
  const gotas = [-70, -40, -10, 20, 55, 85];
  return (
    <g stroke="#60a5fa" strokeWidth={3} strokeLinecap="round" opacity={0.75}>
      {gotas.map((x, i) => (
        <line
          key={x}
          x1={x}
          y1={20}
          x2={x - 6}
          y2={40}
          className="animate-pulse"
          style={{ animationDelay: `${i * 120}ms` }}
        />
      ))}
    </g>
  );
}

function CeuNoturno() {
  return (
    <g>
      <path d="M250,40 a22,22 0 1 0 4,42 a28,28 0 0 1 -4,-42 Z" fill="#fef9c3" />
      <circle cx={80} cy={35} r={2.4} fill="white" className="animate-pulse" />
      <circle cx={110} cy={55} r={1.8} fill="white" className="animate-pulse" style={{ animationDelay: "300ms" }} />
      <circle cx={200} cy={30} r={2} fill="white" className="animate-pulse" style={{ animationDelay: "600ms" }} />
    </g>
  );
}

function CocoNoChao({ x, y, onLimpar }: { x: number; y: number; onLimpar: () => void }) {
  return (
    <text
      x={x}
      y={y}
      textAnchor="middle"
      fontSize={26}
      onClick={onLimpar}
      role="button"
      aria-label="Limpar cocô"
      style={{ cursor: "pointer" }}
      className="transition-transform active:scale-75"
    >
      💩
    </text>
  );
}

function Brilhos() {
  return (
    <g>
      <text x={70} y={130} fontSize={20} className="animate-pulse">
        ✨
      </text>
      <text x={250} y={165} fontSize={16} className="animate-pulse" style={{ animationDelay: "500ms" }}>
        ✨
      </text>
    </g>
  );
}

function Ovo({ estatico, corDestaque }: { estatico: boolean; corDestaque: string }) {
  return (
    <g transform="translate(160,262)">
      <g
        style={{ transformBox: "fill-box", transformOrigin: "center bottom" }}
        className={estatico ? "" : "animate-[idle-sway_2.6s_ease-in-out_infinite]"}
      >
        <path
          d="M0,-92 C46,-92 58,-20 58,18 C58,58 32,84 0,84 C-32,84 -58,58 -58,18 C-58,-20 -46,-92 0,-92 Z"
          fill="#fdf6e3"
          stroke="#e4d3a1"
          strokeWidth={3}
        />
        <ellipse cx={-18} cy={-40} rx={18} ry={11} fill="white" opacity={0.55} />
        <circle cx={16} cy={-10} r={4.5} fill={corDestaque} opacity={0.55} />
        <circle cx={-22} cy={22} r={3.5} fill={corDestaque} opacity={0.55} />
        <circle cx={20} cy={42} r={4} fill={corDestaque} opacity={0.55} />
        <path
          d="M-14,-42 L-2,-18 L-10,-16 L4,10"
          stroke={corDestaque}
          strokeWidth={3}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </g>
  );
}

/** Orelhas, chifres ou espinhos no topo da cabeça — o traço que diferencia cada espécie. */
function DecoracaoDaCabeca({ especie, corEscura, quantidadeDeEspinhos }: { especie: Especie; corEscura: string; quantidadeDeEspinhos: number }) {
  switch (especie) {
    case "gato":
      return (
        <g fill={corEscura}>
          <polygon points="-58,-212 -70,-268 -28,-228" />
          <polygon points="28,-228 70,-268 58,-212" />
          <g stroke="#2d2d2d" strokeWidth={2} strokeLinecap="round" opacity={0.5}>
            <line x1={-30} y1={-118} x2={-64} y2={-124} />
            <line x1={-30} y1={-112} x2={-64} y2={-112} />
            <line x1={22} y1={-118} x2={56} y2={-124} />
            <line x1={22} y1={-112} x2={56} y2={-112} />
          </g>
        </g>
      );
    case "urso":
      return (
        <g>
          <circle cx={-58} cy={-222} r={20} fill={corEscura} />
          <circle cx={54} cy={-222} r={20} fill={corEscura} />
          <circle cx={-58} cy={-222} r={10} fill="#7a5230" opacity={0.4} />
          <circle cx={54} cy={-222} r={10} fill="#7a5230" opacity={0.4} />
        </g>
      );
    case "coelho":
      return (
        <g>
          <g transform="rotate(-8 -34 -230)">
            <ellipse cx={-34} cy={-270} rx={15} ry={48} fill={corEscura} />
            <ellipse cx={-34} cy={-268} rx={7} ry={36} fill="#f9c9e0" />
          </g>
          <g transform="rotate(8 34 -230)">
            <ellipse cx={34} cy={-270} rx={15} ry={48} fill={corEscura} />
            <ellipse cx={34} cy={-268} rx={7} ry={36} fill="#f9c9e0" />
          </g>
        </g>
      );
    case "dino":
    default:
      return (
        <g fill={corEscura}>
          {POSICAO_DOS_ESPINHOS.slice(0, quantidadeDeEspinhos).map((p) => (
            <polygon key={`${p.x}-${p.y}`} points={`${p.x - 10},${p.y + 12} ${p.x + 12},${p.y + 6} ${p.x - 4},${p.y - 14}`} />
          ))}
        </g>
      );
  }
}

interface CriaturaProps {
  estagio: Exclude<EvolutionStage, "ovo">;
  especie: Especie;
  corEscura: string;
  expressao: Expressao;
  animacaoCorpo: string;
  sujo: boolean;
  filtro?: string;
  itemSegurado?: { texto: string; chave: number } | null;
  acessorioIcone?: string | null;
}

function Criatura({
  estagio,
  especie,
  corEscura,
  expressao,
  animacaoCorpo,
  sujo,
  filtro,
  itemSegurado,
  acessorioIcone,
}: CriaturaProps) {
  const escala = ESCALA_DO_ESTAGIO[estagio] ?? 1;

  return (
    <g transform={`translate(160,300) scale(${escala})`} style={{ filter: filtro }}>
      <g style={{ transformBox: "fill-box", transformOrigin: "center" }} className={animacaoCorpo}>
        {/* pernas */}
        <ellipse cx={-32} cy={4} rx={20} ry={11} fill={corEscura} />
        <ellipse cx={32} cy={4} rx={20} ry={11} fill={corEscura} />

        {/* corpo */}
        <path
          d="M-80,-140 C-80,-190 -40,-230 0,-230 C40,-230 80,-190 80,-140 L80,-40 Q80,0 40,0 L-40,0 Q-80,0 -80,-40 Z"
          fill="url(#corpoGradiente)"
        />

        <DecoracaoDaCabeca especie={especie} corEscura={corEscura} quantidadeDeEspinhos={ESPINHOS_DO_ESTAGIO[estagio] ?? 3} />

        {/* barriga */}
        <ellipse cx={0} cy={-52} rx={50} ry={46} fill="#fdf6e3" />

        {/* manchas de sujeira */}
        {sujo && (
          <>
            <ellipse cx={-40} cy={-90} rx={9} ry={6} fill="#7a5230" opacity={0.6} />
            <ellipse cx={45} cy={-60} rx={7} ry={5} fill="#7a5230" opacity={0.5} />
          </>
        )}

        {/* braços */}
        <ellipse cx={-76} cy={-72} rx={16} ry={22} fill={corEscura} transform="rotate(-12 -76 -72)" />
        <ellipse cx={76} cy={-72} rx={16} ry={22} fill={corEscura} transform="rotate(12 76 -72)" />

        {/* bochechas */}
        <ellipse cx={-44} cy={-138} rx={10} ry={6} fill="#f472b6" opacity={0.55} />
        <ellipse cx={36} cy={-138} rx={10} ry={6} fill="#f472b6" opacity={0.55} />

        {/* rosto */}
        <Olho cx={-28} cy={-163} tipo={expressao.olhos} />
        <Olho cx={22} cy={-163} tipo={expressao.olhos} />
        <Boca cx={-3} cy={-122} tipo={expressao.boca} />

        {acessorioIcone && (
          <text x={-3} y={-158} textAnchor="middle" fontSize={30} style={{ filter: "drop-shadow(0 1px 1px rgb(0 0 0 / 0.3))" }}>
            {acessorioIcone}
          </text>
        )}

        {itemSegurado && (
          <text
            key={itemSegurado.chave}
            x={40}
            y={-90}
            textAnchor="middle"
            fontSize={30}
            className="animate-[float-up-svg_1s_ease-out_forwards]"
          >
            {itemSegurado.texto}
          </text>
        )}
      </g>
    </g>
  );
}

export function PetAvatar({
  estagio,
  humor,
  nome,
  especie,
  acessorioIcone,
  acaoVisual,
  cocos = 0,
  onLimparCoco,
}: PetAvatarProps) {
  const expressao = acaoVisual ? EXPRESSAO_POR_ACAO[acaoVisual.tipo] : EXPRESSAO_POR_HUMOR[humor];
  const animacaoCorpo = acaoVisual
    ? ANIMACAO_DO_AVATAR_POR_ACAO[acaoVisual.tipo]
    : ANIMACAO_IDLE_POR_HUMOR[humor];
  const configDaEspecie = CATALOGO_DE_ESPECIES.find((e) => e.id === especie) ?? CATALOGO_DE_ESPECIES[0];

  const filtro =
    humor === "morto"
      ? "grayscale(1) brightness(0.85)"
      : humor === "doente"
        ? "saturate(0.7) hue-rotate(35deg)"
        : undefined;

  return (
    <div className="flex flex-col items-center gap-1">
      <svg viewBox="0 0 320 340" className="w-full max-w-[190px]" role="img" aria-label={`${nome} está ${humor}`}>
        <defs>
          <linearGradient id="ceuGradiente" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={humor === "dormindo" ? "#1e3a5f" : "#7dd3fc"} />
            <stop offset="100%" stopColor={humor === "dormindo" ? "#334155" : "#e0f2fe"} />
          </linearGradient>
          <linearGradient id="chaoGradiente" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34a068" />
            <stop offset="100%" stopColor="#1f7a4d" />
          </linearGradient>
          <linearGradient id="corpoGradiente" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={configDaEspecie.corClara} />
            <stop offset="100%" stopColor={configDaEspecie.corEscura} />
          </linearGradient>
        </defs>

        <rect x={0} y={0} width={320} height={215} fill="url(#ceuGradiente)" />
        <rect x={0} y={195} width={320} height={145} fill="url(#chaoGradiente)" />

        {humor === "dormindo" ? <CeuNoturno /> : null}
        {humor === "triste" ? <Chuva /> : null}
        {(humor === "feliz" || humor === "animado") && !acaoVisual ? <Brilhos /> : null}

        <Nuvem x={65} y={50} />
        <Nuvem x={235} y={70} escala={0.85} />

        <MoitaComOlhos x={40} />
        <MoitaComOlhos x={280} espelhado />
        <ellipse cx={150} cy={210} rx={30} ry={16} fill="#1f6f4a" />
        <ellipse cx={230} cy={205} rx={26} ry={14} fill="#1f6f4a" />

        <ellipse cx={160} cy={312} rx={72} ry={16} fill="#12331f" opacity={0.35} />

        {estagio === "ovo" ? (
          <Ovo estatico={humor === "morto"} corDestaque={configDaEspecie.corEscura} />
        ) : (
          <Criatura
            estagio={estagio}
            especie={especie}
            corEscura={configDaEspecie.corEscura}
            expressao={expressao}
            animacaoCorpo={animacaoCorpo}
            sujo={humor === "sujo" && !acaoVisual}
            filtro={filtro}
            itemSegurado={acaoVisual ? { texto: acaoVisual.emoji, chave: acaoVisual.chave } : null}
            acessorioIcone={acessorioIcone}
          />
        )}

        {onLimparCoco &&
          POSICAO_DOS_COCOS.slice(0, cocos).map((p) => (
            <CocoNoChao key={`${p.x}-${p.y}`} x={p.x} y={p.y} onLimpar={onLimparCoco} />
          ))}
      </svg>

      {cocos > 0 && (
        <p className="text-xs text-stone-400 dark:text-stone-500">Toque nos cocôs para limpar</p>
      )}

      <div className="flex flex-col items-center gap-0.5">
        <p className="text-base font-bold leading-tight text-stone-800 dark:text-stone-100">{nome}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${TEMA_DO_ESTAGIO[estagio]}`}
        >
          {NOME_DO_ESTAGIO[estagio]}
        </span>
      </div>
    </div>
  );
}
