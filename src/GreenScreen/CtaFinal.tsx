import { loadFont } from "@remotion/google-fonts/Inter";
import {
  AbsoluteFill,
  Img,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Cta } from "./types";

const { fontFamily } = loadFont("normal", { weights: ["600", "800"] });

export const CtaFinal: React.FC<{
  cta: Cta;
  inicio: number;
  logoSrc: string;
  corDestaque: string;
}> = ({ cta, inicio, logoSrc, corDestaque }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entrada = spring({
    frame: frame - Math.round(inicio * fps),
    fps,
    config: { damping: 14, stiffness: 120 },
  });
  if (frame < Math.round(inicio * fps)) return null;

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        paddingTop: 180,
        opacity: entrada,
        transform: `translateY(${(1 - entrada) * -60}px) scale(${0.9 + 0.1 * entrada})`,
      }}
    >
      <div
        style={{
          background: "#0A0A0A",
          border: `4px solid ${corDestaque}`,
          borderRadius: 90,
          padding: "34px 70px",
          textAlign: "center",
          fontFamily,
          boxShadow: "0 18px 50px rgba(0,0,0,0.45)",
        }}
      >
        <div style={{ color: "white", fontSize: 46, fontWeight: 600 }}>
          {cta.linha1}
        </div>
        <div
          style={{
            color: corDestaque,
            fontSize: 96,
            fontWeight: 800,
            lineHeight: 1.05,
          }}
        >
          {cta.linha2}
        </div>
      </div>
      <Img
        src={staticFile(logoSrc)}
        style={{
          marginTop: 36,
          width: 230,
          height: 230,
          borderRadius: 40,
          boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
        }}
      />
    </AbsoluteFill>
  );
};
