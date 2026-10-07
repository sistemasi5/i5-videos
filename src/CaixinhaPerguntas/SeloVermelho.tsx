import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { inter } from "./CaixaPergunta";
import type { Selo } from "./types";

/** Selo em caixa vermelha (ex.: "AULA") que destaca a palavra-chave da chamada. */
export const SeloVermelho: React.FC<{ selo: Selo; topo: number }> = ({ selo, topo }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const inicio = Math.round(selo.entra * fps);
  const fim = selo.sai !== undefined ? Math.round(selo.sai * fps) : durationInFrames;
  if (frame < inicio || frame >= fim) return null;
  const t = spring({ frame: frame - inicio, fps, config: { damping: 12, stiffness: 200 }, durationInFrames: 10 });
  return (
    <div style={{ position: "absolute", top: topo, left: 0, right: 140, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          background: "#E8161B",
          color: "#fff",
          fontFamily: inter,
          fontWeight: 800,
          fontSize: 64,
          letterSpacing: 2,
          padding: "14px 40px",
          opacity: Math.min(1, t * 1.5),
          transform: `scale(${0.8 + 0.2 * t})`,
          boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
        }}
      >
        {selo.texto}
      </div>
    </div>
  );
};
