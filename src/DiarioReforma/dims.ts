// Geometria paramétrica da maquete do Diário de uma Reforma.
// Unidades de cena (não são medidas reais de obra). Origem no centro do piso.
export const W = 5.2; // largura (x)
export const D = 3.4; // profundidade (z)
export const H = 1.3; // pé-direito da maquete
export const T = 0.12; // espessura das paredes
export const MURETA = 0.28; // altura das paredes baixas (corte para ver dentro)

export const JAN = { x0: 0.55, x1: 1.75, y0: 0.45, y1: 1.0 }; // janela na parede norte
export const PORTA = { z0: 0.35, z1: 1.15, y1: 1.0 }; // porta na parede oeste

// Parede interna que será demolida (blocos que caem).
export const PAREDE_VELHA = { x: 0.2, z0: -D / 2 + T / 2, z1: 0.55, cols: 5, rows: 4 };
// Parede nova que sobe na fase de estrutura.
export const PAREDE_NOVA = { x0: 0.7, x1: W / 2 - T / 2, z: 0.75, cols: 4, rows: 4 };

// Distância vertical entre camadas na vista explodida.
export const GAP = 2.15;

export const COR = {
  grafite: "#23262b",
  grafiteClaro: "#3a3f46",
  offwhite: "#efe9dd",
  reboco: "#e0d9cb",
  terracota: "#c4623f",
  terracotaEscura: "#9d4a2f",
  dourada: "#ffd9a8",
  amarelo: "#f2b705",
  concreto: "#a29f98",
  pisoAntigo: "#b9aa95",
  madeira: "#b88a5c",
  madeiraEscura: "#6b4a2f",
  vidro: "#bcd7e6",
};

/** Pseudo-aleatório determinístico (depende só do índice). */
export const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
