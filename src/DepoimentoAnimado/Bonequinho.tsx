import { useCurrentFrame } from "remotion";
import { poppins } from "../MostrandoCasas/CartaoInfo";

export const COR = {
  laranja: "#F96830",
  preto: "#161616",
  branco: "#FFFFFF",
  fundo: "#FFF5EA",
  creme: "#FBE6D2",
  cinza: "#9A9A9A",
  vermelho: "#E23B2E",
  verde: "#21A366",
};

/**
 * Ângulos em graus: 0 = para baixo, 90 = para a direita da tela, -90 = para a esquerda,
 * 180 = para cima. Cada membro tem [segmento de cima, segmento de baixo], em ângulo absoluto.
 */
export type Pose = {
  bracoE: [number, number];
  bracoD: [number, number];
  pernaE: [number, number];
  pernaD: [number, number];
};

export const POSES = {
  neutro: { bracoE: [-18, -8], bracoD: [18, 8], pernaE: [-10, -4], pernaD: [10, 4] },
  acenando: { bracoE: [-18, -8], bracoD: [125, 170], pernaE: [-10, -4], pernaD: [10, 4] },
  apontando: { bracoE: [-18, -8], bracoD: [95, 95], pernaE: [-10, -4], pernaD: [10, 4] },
  apontandoEsq: { bracoE: [-95, -95], bracoD: [18, 8], pernaE: [-10, -4], pernaD: [10, 4] },
  pensando: { bracoE: [-25, 70], bracoD: [35, -150], pernaE: [-10, -4], pernaD: [10, 4] },
  comemorando: { bracoE: [-145, -165], bracoD: [145, 165], pernaE: [-14, -6], pernaD: [14, 6] },
  triste: { bracoE: [-6, -3], bracoD: [6, 3], pernaE: [-7, -3], pernaD: [7, 3] },
  surpreso: { bracoE: [-60, -160], bracoD: [60, 160], pernaE: [-12, -5], pernaD: [12, 5] },
  segurando: { bracoE: [-30, 55], bracoD: [30, -55], pernaE: [-10, -4], pernaD: [10, 4] },
  digitando: { bracoE: [20, 80], bracoD: [35, 88], pernaE: [-10, -4], pernaD: [10, 4] },
  joinha: { bracoE: [-18, -8], bracoD: [55, 175], pernaE: [-10, -4], pernaD: [10, 4] },
  abracando: { bracoE: [-110, -135], bracoD: [110, 135], pernaE: [-14, -6], pernaD: [14, 6] },
} satisfies Record<string, Pose>;

const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const mix2 = (a: [number, number], b: [number, number], t: number): [number, number] => [
  mix(a[0], b[0], t),
  mix(a[1], b[1], t),
];

/** Mistura duas poses (t de 0 a 1) para a troca de pose ficar suave. */
export const misturar = (a: Pose, b: Pose, t: number): Pose => {
  const k = Math.max(0, Math.min(1, t));
  return {
    bracoE: mix2(a.bracoE, b.bracoE, k),
    bracoD: mix2(a.bracoD, b.bracoD, k),
    pernaE: mix2(a.pernaE, b.pernaE, k),
    pernaD: mix2(a.pernaD, b.pernaD, k),
  };
};

export type Expressao = "feliz" | "triste" | "surpreso" | "neutro" | "sorrisao";

const rad = (g: number) => (g * Math.PI) / 180;
const ponta = (x: number, y: number, ang: number, len: number) => ({
  x: x + Math.sin(rad(ang)) * len,
  y: y + Math.cos(rad(ang)) * len,
});

const Membro: React.FC<{ x: number; y: number; angs: [number, number]; l1: number; l2: number; mao?: boolean }> = ({
  x,
  y,
  angs,
  l1,
  l2,
  mao,
}) => {
  const j = ponta(x, y, angs[0], l1);
  const p = ponta(j.x, j.y, angs[1], l2);
  return (
    <g>
      <path
        d={`M ${x} ${y} L ${j.x} ${j.y} L ${p.x} ${p.y}`}
        stroke={COR.preto}
        strokeWidth={13}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {mao ? <circle cx={p.x} cy={p.y} r={11} fill={COR.branco} stroke={COR.preto} strokeWidth={6} /> : null}
    </g>
  );
};

/**
 * Bonequinho de traço, visto de frente. (x, y) = ponto entre os pés, no chão.
 * Altura total ≈ 400 × escala.
 */
export const Bonequinho: React.FC<{
  x: number;
  y: number;
  escala?: number;
  pose: Pose;
  expressao?: Expressao;
  /** 0 = boca fechada, 1 = bem aberta (falando) */
  boca?: number;
  corCamisa?: string;
  cabelo?: "curto" | "topete";
  nome?: string;
  /** inclina a cabeça (graus) */
  cabeca?: number;
  /** vira o rosto para um lado (-1 esquerda, 1 direita) */
  olhar?: number;
  /** pulo / respiração: desloca o corpo para cima (px) */
  pulo?: number;
}> = ({
  x,
  y,
  escala = 1,
  pose,
  expressao = "neutro",
  boca = 0,
  corCamisa = COR.laranja,
  cabelo = "curto",
  nome,
  cabeca = 0,
  olhar = 0,
  pulo = 0,
}) => {
  const frame = useCurrentFrame();
  const respira = Math.sin(frame / 9) * 2.5;
  const quadril = { x: 0, y: -150 };
  const ombro = { x: 0, y: -285 + respira };
  const cab = { x: 0, y: -350 + respira };
  const ox = olhar * 9;
  const piscar = frame % 97 < 3;

  const olho = (dx: number) =>
    expressao === "surpreso" ? (
      <circle cx={cab.x + dx + ox} cy={cab.y - 6} r={7} fill={COR.preto} />
    ) : piscar ? (
      <line x1={cab.x + dx + ox - 6} y1={cab.y - 6} x2={cab.x + dx + ox + 6} y2={cab.y - 6} stroke={COR.preto} strokeWidth={4} strokeLinecap="round" />
    ) : (
      <ellipse cx={cab.x + dx + ox} cy={cab.y - 6} rx={5} ry={7} fill={COR.preto} />
    );

  const bx = cab.x + ox;
  const by = cab.y + 22;
  let bocaEl: React.ReactNode;
  if (boca > 0.08 || expressao === "surpreso") {
    const ab = expressao === "surpreso" ? Math.max(0.8, boca) : boca;
    bocaEl = <ellipse cx={bx} cy={by} rx={11} ry={3 + ab * 10} fill={COR.preto} />;
  } else if (expressao === "feliz") {
    bocaEl = <path d={`M ${bx - 15} ${by - 4} Q ${bx} ${by + 12} ${bx + 15} ${by - 4}`} stroke={COR.preto} strokeWidth={5} fill="none" strokeLinecap="round" />;
  } else if (expressao === "sorrisao") {
    bocaEl = <path d={`M ${bx - 19} ${by - 6} Q ${bx} ${by + 22} ${bx + 19} ${by - 6} Z`} fill={COR.preto} />;
  } else if (expressao === "triste") {
    bocaEl = <path d={`M ${bx - 14} ${by + 8} Q ${bx} ${by - 6} ${bx + 14} ${by + 8}`} stroke={COR.preto} strokeWidth={5} fill="none" strokeLinecap="round" />;
  } else {
    bocaEl = <line x1={bx - 11} y1={by + 2} x2={bx + 11} y2={by + 2} stroke={COR.preto} strokeWidth={5} strokeLinecap="round" />;
  }

  return (
    <g transform={`translate(${x} ${y - pulo}) scale(${escala})`}>
      {/* sombra */}
      <ellipse cx={0} cy={4 + pulo / escala} rx={70 - pulo / 6} ry={10} fill="rgba(0,0,0,0.10)" />
      <Membro x={quadril.x - 14} y={quadril.y} angs={pose.pernaE} l1={78} l2={74} />
      <Membro x={quadril.x + 14} y={quadril.y} angs={pose.pernaD} l1={78} l2={74} />
      {/* tronco (camiseta) */}
      <path
        d={`M ${ombro.x - 40} ${ombro.y + 6} Q ${ombro.x} ${ombro.y - 10} ${ombro.x + 40} ${ombro.y + 6} L ${quadril.x + 34} ${quadril.y + 6} L ${quadril.x - 34} ${quadril.y + 6} Z`}
        fill={corCamisa}
        stroke={COR.preto}
        strokeWidth={7}
        strokeLinejoin="round"
      />
      <Membro x={ombro.x - 36} y={ombro.y + 10} angs={pose.bracoE} l1={72} l2={68} mao />
      <Membro x={ombro.x + 36} y={ombro.y + 10} angs={pose.bracoD} l1={72} l2={68} mao />
      {/* cabeça */}
      <g transform={`rotate(${cabeca} ${cab.x} ${cab.y + 40})`}>
        <circle cx={cab.x} cy={cab.y} r={52} fill={COR.branco} stroke={COR.preto} strokeWidth={8} />
        {cabelo === "curto" ? (
          <path d={`M ${cab.x - 50} ${cab.y - 8} Q ${cab.x - 46} ${cab.y - 60} ${cab.x} ${cab.y - 56} Q ${cab.x + 48} ${cab.y - 60} ${cab.x + 50} ${cab.y - 8} Q ${cab.x + 30} ${cab.y - 34} ${cab.x} ${cab.y - 32} Q ${cab.x - 30} ${cab.y - 34} ${cab.x - 50} ${cab.y - 8} Z`} fill={COR.preto} />
        ) : (
          <path d={`M ${cab.x - 48} ${cab.y - 14} Q ${cab.x - 40} ${cab.y - 66} ${cab.x + 8} ${cab.y - 68} Q ${cab.x + 52} ${cab.y - 62} ${cab.x + 48} ${cab.y - 14} Q ${cab.x + 22} ${cab.y - 38} ${cab.x - 6} ${cab.y - 30} Q ${cab.x - 30} ${cab.y - 30} ${cab.x - 48} ${cab.y - 14} Z`} fill="#3B2A20" />
        )}
        {olho(-18)}
        {olho(18)}
        {expressao === "triste" ? (
          <>
            <line x1={bx - 28} y1={cab.y - 24} x2={bx - 10} y2={cab.y - 18} stroke={COR.preto} strokeWidth={4} strokeLinecap="round" />
            <line x1={bx + 28} y1={cab.y - 24} x2={bx + 10} y2={cab.y - 18} stroke={COR.preto} strokeWidth={4} strokeLinecap="round" />
          </>
        ) : null}
        {bocaEl}
      </g>
      {nome ? (
        <g>
          <rect x={-70} y={22} width={140} height={44} rx={22} fill={COR.preto} />
          <text x={0} y={52} textAnchor="middle" fontFamily={poppins} fontWeight={800} fontSize={24} fill={COR.branco}>
            {nome}
          </text>
        </g>
      ) : null}
    </g>
  );
};

/** Ciclo de caminhada: devolve a pose das pernas e braços para o frame dado. */
export const poseAndando = (frame: number): Pose => {
  const s = Math.sin(frame / 3.2);
  return {
    bracoE: [-12 - s * 22, -6 - s * 18],
    bracoD: [12 + s * 22, 6 + s * 18],
    pernaE: [s * 26, s * 18 - 8],
    pernaD: [-s * 26, -s * 18 + 8],
  };
};
