import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const inter = loadInter("normal", { weights: ["500", "800"] }).fontFamily;

/** Caixinha de perguntas do Instagram: cabeçalho escuro + corpo branco com a pergunta. */
export const CaixaPergunta: React.FC<{ titulo: string; pergunta: string; topo: number }> = ({
  titulo,
  pergunta,
  topo,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame, fps, config: { damping: 16, stiffness: 160 }, durationInFrames: 12 });
  return (
    <div
      style={{
        position: "absolute",
        top: topo,
        left: 108,
        width: 864,
        borderRadius: 36,
        overflow: "hidden",
        boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
        opacity: Math.min(1, t * 1.5),
        transform: `scale(${0.94 + 0.06 * t})`,
        fontFamily: inter,
      }}
    >
      <div
        style={{
          background: "#1B1E23",
          color: "#fff",
          fontSize: 34,
          fontWeight: 500,
          textAlign: "center",
          padding: "30px 0",
        }}
      >
        {titulo}
      </div>
      <div
        style={{
          background: "#fff",
          color: "#262626",
          fontSize: 44,
          fontWeight: 500,
          lineHeight: 1.35,
          textAlign: "center",
          padding: "44px 48px 52px",
          whiteSpace: "pre-line",
        }}
      >
        {pergunta}
      </div>
    </div>
  );
};
