import { loadFont } from "@remotion/google-fonts/Inter";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import type { Palavra } from "./types";

const { fontFamily } = loadFont("normal", { weights: ["800"] });

const MAX_PALAVRAS = 6;
const PAUSA_MAX = 0.6;

/** Agrupa as palavras em frases curtas, cortando em pausa ou pontuacao. */
const agrupar = (palavras: Palavra[]): Palavra[][] => {
  const grupos: Palavra[][] = [];
  let atual: Palavra[] = [];
  palavras.forEach((p, i) => {
    atual.push(p);
    const prox = palavras[i + 1];
    const quebra =
      !prox ||
      atual.length >= MAX_PALAVRAS ||
      prox.inicio - p.fim > PAUSA_MAX ||
      /[.!?]$/.test(p.texto);
    if (quebra) {
      grupos.push(atual);
      atual = [];
    }
  });
  return grupos;
};

export const Legendas: React.FC<{
  palavras: Palavra[];
  y: number;
  corDestaque: string;
}> = ({ palavras, y, corDestaque }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const grupos = agrupar(palavras);
  const idx = grupos.findIndex((g, i) => {
    const fim = grupos[i + 1]?.[0].inicio ?? g[g.length - 1].fim + 0.3;
    return t >= g[0].inicio && t < Math.min(fim, g[g.length - 1].fim + 0.3);
  });
  if (idx < 0) return null;

  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          position: "absolute",
          top: y,
          transform: "translateY(-50%)",
          gap: 10,
          padding: "0 150px 0 100px",
          fontFamily,
          fontWeight: 800,
          fontSize: 42,
          lineHeight: 1.15,
          color: "white",
          WebkitTextStroke: "7px #000",
          paintOrder: "stroke fill",
        }}
      >
        {grupos[idx].map((p, i) => {
          const ativa = t >= p.inicio && t < p.fim;
          return (
            <span
              key={`${idx}-${i}`}
              style={{
                padding: "0 14px",
                borderRadius: 12,
                background: ativa ? corDestaque : "transparent",
                WebkitTextStroke: ativa ? "0" : undefined,
              }}
            >
              {p.texto}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
