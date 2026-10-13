import React from "react";
import { OffthreadVideo, interpolate, staticFile } from "remotion";
import { COR } from "./dims";
import { ALTURA, LARGURA, rampa } from "./tempo";

export const VIDEO_ORIGINAL = "videos/diario-reforma/original.mp4";

// Moldura final: lado inferior esquerdo, vertical 9:16, acima da área de interface do Reels.
const FINAL = { left: 44, top: 730, w: 450, h: 800, chanfro: 44 };
// O rosto fica no terço esquerdo do quadro original; com o zoom ele cai no centro da moldura.
const ZOOM_ROSTO = 1.1;
// Posição horizontal aproximada do rosto no quadro original (0–1), medida nos quadros da gravação.
const ROSTO_T = [1.7, 3, 4.5, 6, 8, 9, 10, 11.5, 13, 14.5, 15.8, 19];
const ROSTO_X = [0.25, 0.36, 0.28, 0.25, 0.28, 0.28, 0.25, 0.22, 0.25, 0.19, 0.17, 0.3];

const poligono = (c: number) =>
  `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`;

export const progressoMoldura = (t: number) => rampa(t, 1.9, 3.0);

/** Apresentador: tela cheia → moldura chanfrada com contorno duplo e leve perspectiva. */
export const Apresentador: React.FC<{
  pf: number; // 0 = tela cheia, 1 = moldura
  startFrom?: number;
  t: number;
}> = ({ pf, startFrom, t }) => {
  const lerp = (a: number, b: number) => interpolate(pf, [0, 1], [a, b]);
  const w = lerp(LARGURA, FINAL.w);
  const h = lerp(ALTURA, FINAL.h);
  const left = lerp(0, FINAL.left);
  const top = lerp(0, FINAL.top);
  const c = lerp(0, FINAL.chanfro);
  const zoom = lerp(1, ZOOM_ROSTO);
  const xr = interpolate(t, ROSTO_T, ROSTO_X, { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // desloca o vídeo para o rosto ficar no centro da moldura, sem mostrar borda vazia
  const deslocX = Math.min(0, Math.max(-(zoom - 1) * w, 0.5 * w - xr * zoom * w));
  const inset = (i: number) => i * pf;
  const cc = (i: number) => Math.max(0, c - 0.41 * inset(i));
  const camada = (i: number, extra: React.CSSProperties): React.CSSProperties => ({
    position: "absolute",
    inset: inset(i),
    clipPath: poligono(cc(i)),
    ...extra,
  });
  return (
    <div
      style={{
        position: "absolute",
        left,
        top,
        width: w,
        height: h,
        transform: `perspective(1800px) rotateY(${lerp(0, 8)}deg) rotateX(${lerp(0, -1.5)}deg)`,
        transformOrigin: "left center",
        filter: `drop-shadow(0 ${22 * pf}px ${38 * pf}px rgba(0,0,0,0.6))`,
      }}
    >
      <div style={camada(0, { background: COR.offwhite, opacity: pf })} />
      <div style={camada(2, { background: COR.grafite, opacity: pf })} />
      <div style={camada(6, { background: COR.terracota, opacity: pf })} />
      <div style={camada(8, { background: "#000", overflow: "hidden" })}>
        <OffthreadVideo
          src={staticFile(VIDEO_ORIGINAL)}
          startFrom={startFrom}
          style={{
            position: "absolute",
            left: deslocX,
            top: 0,
            width: w * zoom,
            height: h * zoom,
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
};
