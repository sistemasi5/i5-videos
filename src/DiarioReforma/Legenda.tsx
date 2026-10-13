import React from "react";
import { staticFile, useDelayRender, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { COR } from "./dims";

const { fontFamily: inter } = loadInter("normal", { weights: ["800"], subsets: ["latin"] });

export type Palavra = { texto: string; inicio: number; fim: number };

/** Agrupa as palavras reais em frases curtas (até 2 linhas na faixa). */
export const agrupar = (palavras: Palavra[]): Palavra[][] => {
  const grupos: Palavra[][] = [];
  let atual: Palavra[] = [];
  palavras.forEach((p) => {
    atual.push(p);
    const chars = atual.map((x) => x.texto).join(" ").length;
    if (/[.,!?]$/.test(p.texto) || chars >= 26) {
      grupos.push(atual);
      atual = [];
    }
  });
  if (atual.length) grupos.push(atual);
  return grupos;
};

/** Carrega a transcrição real (palavras com tempo). */
export const useFala = () => {
  const { delayRender, continueRender } = useDelayRender();
  const [fala, setFala] = React.useState<Palavra[] | null>(null);
  const [handle] = React.useState(() => delayRender("fala"));
  React.useEffect(() => {
    fetch(staticFile("videos/diario-reforma/fala.json"))
      .then((r) => r.json())
      .then((j: Palavra[]) => {
        setFala(j);
        continueRender(handle);
      });
  }, [handle, continueRender]);
  return fala;
};

/** Legenda de até duas linhas em faixa livre, longe da borda inferior. */
export const Legenda: React.FC<{ fala: Palavra[]; pf: number }> = ({ fala, pf }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const grupos = React.useMemo(() => agrupar(fala), [fala]);
  const idx = grupos.findIndex((g, i) => {
    const prox = grupos[i + 1];
    const fim = prox ? prox[0].inicio : g[g.length - 1].fim + 0.4;
    return t >= g[0].inicio - 0.05 && t < Math.min(fim, g[g.length - 1].fim + 0.6);
  });
  if (idx < 0) return null;
  const g = grupos[idx];
  const left = interpolate(pf, [0, 1], [90, 520]);
  const largura = interpolate(pf, [0, 1], [900, 506]);
  const op = interpolate(t, [g[0].inicio - 0.05, g[0].inicio + 0.08], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return (
    <div
      style={{
        position: "absolute",
        left,
        width: largura,
        top: 1330,
        opacity: op,
        padding: "16px 22px",
        borderRadius: 14,
        background: "rgba(24,26,30,0.72)",
        borderLeft: `6px solid ${COR.terracota}`,
        fontFamily: inter,
        fontWeight: 800,
        fontSize: 42,
        lineHeight: 1.18,
        color: COR.offwhite,
        textAlign: "left",
      }}
    >
      {g.map((p, i) => {
        const ativa = t >= p.inicio && t < p.fim;
        return (
          <span key={i} style={{ color: ativa ? COR.dourada : COR.offwhite }}>
            {p.texto}{" "}
          </span>
        );
      })}
    </div>
  );
};
