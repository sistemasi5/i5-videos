import { Easing, interpolate } from "remotion";

export const FPS = 30;
export const LARGURA = 1080;
export const ALTURA = 1920;
/** Gravação real (felipe_a_cortes.mp4): 21,15 s. */
export const FRAMES_TOTAIS = 635;
/** Amostra: da frase "essa é a casa que a gente comprou" até o fim da fala (1,7 s – 15,8 s). */
export const AMOSTRA = { inicio: 51, fim: 474 };

const suave = Easing.inOut(Easing.cubic);

export const rampa = (
  t: number,
  a: number,
  b: number,
  easing: (n: number) => number = suave,
) =>
  interpolate(t, [a, b], [0, 1], {
    easing,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

/** Tudo o que a maquete precisa saber num instante. Só depende do tempo (frame). */
export type EstadoMaquete = {
  t: number;
  /** 0→1: a casa entra (planta desenhada, paredes crescem em altura). */
  sobe: number;
  /** opacidade da prancha/planta de fundo. */
  planta: number;
  /** destaque pulsante da parede marcada. */
  marca: number;
  /** 0→1: fragmentação e queda da parede interna. */
  queda: number;
  /** 0→1: vista explodida em três planos. */
  explode: number;
  /** 0→1: entrada dos rótulos. */
  rotulos: number;
  /** destaque de cada fase (demolição, estrutura, acabamento). */
  foco: [number, number, number];
  /** linhas tracejadas que percorrem paredes e piso. */
  tracejado: number;
  /** revestimento antigo some. */
  remove: number;
  /** blocos da parede nova. */
  estrutura: number;
  /** conduítes/tubulação. */
  conduite: number;
  /** varredura reboco→pintura, contrapiso→piso. */
  acabamento: number;
  /** móveis e objetos entram. */
  moveis: number;
  /** varredura antes/depois (0→1 da esquerda p/ direita), null = desligado. */
  antesDepois: number | null;
};

export const estadoNoTempo = (t: number): EstadoMaquete => ({
  t,
  sobe: rampa(t, 2.9, 4.2),
  planta: rampa(t, 1.9, 2.5) * (1 - rampa(t, 3.7, 4.4)),
  marca: rampa(t, 4.5, 5.1),
  queda: rampa(t, 5.15, 6.5, (n) => n),
  explode: rampa(t, 6.7, 8.3),
  rotulos: rampa(t, 7.6, 8.4),
  foco: [
    rampa(t, 8.3, 9.0) * (1 - rampa(t, 12.4, 13.0)),
    rampa(t, 13.2, 13.8),
    0,
  ],
  tracejado: rampa(t, 8.9, 10.6, (n) => n),
  remove: rampa(t, 10.4, 11.6),
  estrutura: rampa(t, 13.9, 15.8, (n) => n),
  conduite: 0,
  acabamento: 0,
  moveis: 0,
  antesDepois: null,
});

/** Casa já reformada (usada só para o quadro de estado final; não faz parte da amostra). */
export const ESTADO_REFORMADA: EstadoMaquete = {
  t: 20,
  sobe: 1,
  planta: 0,
  marca: 0,
  queda: 1,
  explode: 0,
  rotulos: 0,
  foco: [0, 0, 0],
  tracejado: 0,
  remove: 1,
  estrutura: 1,
  conduite: 1,
  acabamento: 1,
  moveis: 1,
  antesDepois: null,
};

export type CameraPose = {
  az: number; // graus
  el: number; // graus
  r: number;
  tx: number;
  ty: number;
  ox: number; // deslocamento da imagem em px (positivo = para a esquerda)
  oy: number;
};

const K_T = [1.7, 2.6, 3.6, 4.4, 5.2, 6.3, 6.9, 8.2, 9.0, 11.6, 12.5, 13.4, 15.8];
const K = {
  az: [10, 14, 26, 34, 40, 46, 42, 34, 30, 28, 32, 34, 36],
  el: [72, 62, 38, 30, 28, 27, 27, 24, 22, 20, 24, 24, 26],
  r: [37, 36, 35, 34, 33, 32, 35, 37, 32, 32, 35, 37, 37],
  tx: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ty: [0, 0.2, 0.5, 0.55, 0.55, 0.5, 1.3, 2.4, 0.9, 0.9, 1.4, 2.4, 2.5],
  ox: [-170, -170, -170, -170, -170, -170, -170, -170, -170, -170, -170, -170, -170],
  oy: [300, 300, 300, 300, 300, 300, 300, 300, 310, 310, 300, 300, 300],
};

const q = Easing.inOut(Easing.quad);
const kf = (arr: number[], t: number) =>
  interpolate(t, K_T, arr, { easing: q, extrapolateLeft: "clamp", extrapolateRight: "clamp" });

export const cameraNoTempo = (t: number): CameraPose => ({
  az: kf(K.az, t),
  el: kf(K.el, t),
  r: kf(K.r, t),
  tx: kf(K.tx, t),
  ty: kf(K.ty, t),
  ox: kf(K.ox, t),
  oy: kf(K.oy, t),
});

export const CAMERA_REFORMADA: CameraPose = {
  az: 34,
  el: 28,
  r: 29,
  tx: 0,
  ty: 0.55,
  ox: -170,
  oy: 300,
};

export const FOV = 32;
