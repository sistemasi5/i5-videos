import { useCurrentFrame, useVideoConfig } from "remotion";
import { poppins } from "../MostrandoCasas/CartaoInfo";
import { COR } from "./Bonequinho";
import type { Palavra } from "./types";

type Grupo = { palavras: Palavra[]; inicio: number; fim: number };

const MAX_PALAVRAS = 4;
const MAX_LETRAS = 24;

/** Junta as palavras em grupos curtos (quebra em pontuação, pausa ou troca de quem fala). */
export const agruparPalavras = (palavras: Palavra[]): Grupo[] => {
  const grupos: Grupo[] = [];
  let atual: Palavra[] = [];
  const fecha = () => {
    if (atual.length) grupos.push({ palavras: atual, inicio: atual[0].inicio, fim: atual[atual.length - 1].fim });
    atual = [];
  };
  palavras.forEach((p, i) => {
    const ant = palavras[i - 1];
    if (ant && (ant.quem !== p.quem || p.inicio - ant.fim > 0.5)) fecha();
    const letras = atual.map((a) => a.texto).join(" ").length + p.texto.length;
    if (atual.length >= MAX_PALAVRAS || letras > MAX_LETRAS) fecha();
    atual.push(p);
    if (/[.,!?…]$/.test(p.texto)) fecha();
  });
  fecha();
  // cada grupo fica na tela até o próximo começar (se a pausa for curta)
  return grupos.map((g, i) => {
    const prox = grupos[i + 1];
    const fim = prox && prox.inicio - g.fim < 0.6 ? prox.inicio : g.fim + 0.3;
    return { ...g, fim };
  });
};

export const LegendaKaraoke: React.FC<{ grupos: Grupo[]; topo: number; nomeMentor: string }> = ({ grupos, topo, nomeMentor }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const g = grupos.find((x) => t >= x.inicio && t < x.fim);
  if (!g) return null;
  const doMentor = g.palavras[0].quem === "mentor";
  return (
    <div style={{ position: "absolute", top: topo, left: 60, right: 200, textAlign: "center", fontFamily: poppins }}>
      {doMentor ? (
        <div
          style={{
            display: "inline-block",
            background: COR.preto,
            color: COR.branco,
            fontWeight: 800,
            fontSize: 28,
            padding: "4px 18px",
            borderRadius: 999,
            marginBottom: 10,
          }}
        >
          {nomeMentor}
        </div>
      ) : null}
      <div style={{ fontWeight: 800, fontSize: 62, lineHeight: 1.15, color: COR.preto }}>
        {g.palavras.map((p, i) => {
          const ativa = t >= p.inicio - 0.05;
          return (
            <span key={i} style={{ color: ativa ? (doMentor ? COR.preto : COR.laranja) : "rgba(22,22,22,0.35)" }}>
              {p.texto}
              {i < g.palavras.length - 1 ? " " : ""}
            </span>
          );
        })}
      </div>
    </div>
  );
};
