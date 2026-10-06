import { loadFont as loadEmoji } from "@remotion/google-fonts/NotoColorEmoji";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSerifa } from "@remotion/google-fonts/PlayfairDisplay";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import type { Bloco, CorBloco } from "./types";

const inter = loadInter("normal", { weights: ["500", "800"] }).fontFamily;
const serifa = loadSerifa("normal", { weights: ["600"] }).fontFamily;
// Emoji da mesma familia em qualquer computador (Windows nao desenha bandeira).
const emoji = loadEmoji("normal", { weights: ["400"], subsets: ["emoji"] }).fontFamily;

const CORES: Record<CorBloco, { fundo: string; texto: string }> = {
  branco: { fundo: "#FFFFFF", texto: "#0A0A0A" },
  preto: { fundo: "#0A0A0A", texto: "#FFFFFF" },
  vermelho: { fundo: "#E8161B", texto: "#FFFFFF" },
};

export const CaixaTexto: React.FC<{ bloco: Bloco; tamanhoFonte: number }> = ({
  bloco,
  tamanhoFonte,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cor = CORES[bloco.cor];
  const entra = bloco.entra ?? 0;
  const inicio = Math.round(entra * fps);

  // Sem "entra": aparece pronto no primeiro quadro. Com "entra": pop rapido.
  const t =
    entra > 0
      ? spring({
          frame: frame - inicio,
          fps,
          config: { damping: 14, stiffness: 180 },
          durationInFrames: 12,
        })
      : 1;
  const visivel = entra > 0 ? frame >= inicio : true;
  const serif = bloco.fonte === "serifa";
  const peso = bloco.cor === "vermelho" ? 800 : 500;

  return (
    <div
      style={{
        // o espaco do bloco fica reservado desde o inicio: nada pula de lugar
        opacity: visivel ? Math.min(1, t * 1.4) : 0,
        transform: `scale(${0.88 + 0.12 * t})`,
        background: cor.fundo,
        color: cor.texto,
        borderRadius: tamanhoFonte * 0.55,
        padding: `${tamanhoFonte * 0.3}px ${tamanhoFonte * 0.5}px`,
        fontFamily: `${serif ? serifa : inter}, ${emoji}`,
        fontSize: tamanhoFonte,
        fontWeight: serif ? 600 : peso,
        lineHeight: 1.22,
        textAlign: "center",
        maxWidth: 860,
        boxShadow: "0 6px 24px rgba(0,0,0,0.25)",
        whiteSpace: "pre-line",
      }}
    >
      {bloco.texto}
    </div>
  );
};
