import { loadFont as loadPoppins } from "@remotion/google-fonts/Poppins";
import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import type { Cartao } from "./types";

export const poppins = loadPoppins("normal", { weights: ["400", "800"] }).fontFamily;
export const poppinsItalico = loadPoppins("italic", { weights: ["400"] }).fontFamily;

const ENTRADA = 9; // quadros de fade/subida
const SAIDA = 6;

/** Cartão creme arredondado com borda dourada embaixo (como o reel de referência). */
export const CartaoInfo: React.FC<{
  cartao: Cartao;
  inicio: number; // quadro em que entra
  fim: number; // quadro em que sai
  topo: number;
  corDestaque: string;
}> = ({ cartao, inicio, fim, topo, corDestaque }) => {
  const frame = useCurrentFrame();
  useVideoConfig();
  if (frame < inicio || frame >= fim) return null;

  const entra = interpolate(frame, [inicio, inicio + ENTRADA], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const sai = interpolate(frame, [fim - SAIDA, fim], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacidade = Math.min(entra, sai);
  const sobe = (1 - entra) * 24;

  const linhas = cartao.destaque.split("\n");
  const grande = linhas.length > 1 || cartao.destaque.length > 12 ? 62 : 92;

  return (
    <div
      style={{
        position: "absolute",
        top: topo,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity: opacidade,
        transform: `translateY(${sobe}px)`,
      }}
    >
      <div
        style={{
          width: 615,
          minHeight: 258,
          boxSizing: "border-box",
          padding: "28px 24px",
          background: "#F4EFEA",
          borderRadius: 30,
          borderBottom: "6px solid #E3C478",
          boxShadow: "0 10px 32px rgba(0,0,0,0.28)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          whiteSpace: "pre-line",
        }}
      >
        {cartao.rotulo ? (
          <div
            style={{
              fontFamily: poppinsItalico,
              fontStyle: "italic",
              fontSize: 34,
              color: "#6E6A6B",
              lineHeight: 1.25,
              marginBottom: 4,
            }}
          >
            {cartao.rotulo}
          </div>
        ) : null}
        <div
          style={{
            fontFamily: poppins,
            fontWeight: 800,
            fontSize: grande,
            color: corDestaque,
            lineHeight: 1.08,
            textShadow: "0 3px 0 rgba(120,90,20,0.35)",
          }}
        >
          {cartao.destaque}
        </div>
      </div>
    </div>
  );
};
