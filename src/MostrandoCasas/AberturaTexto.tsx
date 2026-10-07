import { interpolate, useCurrentFrame } from "remotion";
import { poppins, poppinsItalico } from "./CartaoInfo";
import type { Abertura } from "./types";

const SOMBRA = "0 2px 10px rgba(0,0,0,0.55), 0 0 2px rgba(0,0,0,0.6)";

/** Texto da abertura: sem caixa, direto sobre o vídeo, com sombra para ler bem. */
export const AberturaTexto: React.FC<{
  abertura: Abertura;
  fimFrame: number;
  topo: number;
  corDestaque: string;
}> = ({ abertura, fimFrame, topo, corDestaque }) => {
  const frame = useCurrentFrame();
  if (frame >= fimFrame) return null;
  const entra = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const sai = interpolate(frame, [fimFrame - 8, fimFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: topo,
        left: 0,
        right: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        opacity: Math.min(entra, sai),
        transform: `translateY(${(1 - entra) * 20}px)`,
        textShadow: SOMBRA,
        textAlign: "center",
      }}
    >
      {abertura.linhaTopo ? (
        <div style={{ fontFamily: poppinsItalico, fontStyle: "italic", fontSize: 40, color: "#fff" }}>
          {abertura.linhaTopo}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: poppins,
          fontWeight: 800,
          fontSize: 98,
          color: corDestaque,
          lineHeight: 1.05,
          whiteSpace: "pre-line",
        }}
      >
        {abertura.destaque}
      </div>
      {abertura.linhaBase ? (
        <div style={{ fontFamily: poppinsItalico, fontStyle: "italic", fontSize: 44, color: "#fff", marginTop: 2 }}>
          {abertura.linhaBase}
        </div>
      ) : null}
      {abertura.local ? (
        <div
          style={{
            marginTop: 18,
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: poppins,
            fontWeight: 800,
            fontSize: 34,
            letterSpacing: 2,
            color: "#fff",
          }}
        >
          <svg width="34" height="40" viewBox="0 0 24 28" fill="none">
            <path
              d="M12 1C6.5 1 2.5 5 2.5 10.3c0 6.7 9.5 16.2 9.5 16.2s9.5-9.5 9.5-16.2C21.5 5 17.5 1 12 1Z"
              stroke="#fff"
              strokeWidth="2.4"
            />
            <circle cx="12" cy="10.3" r="3.3" fill="#fff" />
          </svg>
          {abertura.local.toUpperCase()}
        </div>
      ) : null}
    </div>
  );
};
