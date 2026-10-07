import { useCurrentFrame, useVideoConfig } from "remotion";
import { poppins } from "./CartaoInfo";
import type { Legenda } from "./types";

/** Legenda de fala: grupos curtos em branco, negrito, com sombra (como o reel de referência). */
export const LegendaFala: React.FC<{ legendas: Legenda[]; topo: number; limiteFrame: number }> = ({
  legendas,
  topo,
  limiteFrame,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame >= limiteFrame) return null;
  const atual = legendas.find((l) => frame >= Math.round(l.inicio * fps) && frame < Math.round(l.fim * fps));
  if (!atual) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: topo,
        left: 60,
        right: 200, // fora da coluna de botões do Reels
        textAlign: "center",
        fontFamily: poppins,
        fontWeight: 800,
        fontSize: 58,
        lineHeight: 1.15,
        color: "#fff",
        textShadow: "0 3px 12px rgba(0,0,0,0.75), 0 0 3px rgba(0,0,0,0.8)",
      }}
    >
      {atual.texto}
    </div>
  );
};
