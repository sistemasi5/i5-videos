import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { LegendaFala } from "../MostrandoCasas/LegendaFala";
import { CaixaPergunta } from "./CaixaPergunta";
import { SeloVermelho } from "./SeloVermelho";
import type { CaixinhaProps } from "./types";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;

// Area segura do Reels/Stories: topo 140, base 420, direita 140.
export const SAFE = { topo: 140, base: 420, direita: 140 };

export const caixinhaDefaults: CaixinhaProps = {
  fundoSrc: "videos/teste-caixinha/fundo.mp4",
  fundoInicio: 0,
  duracaoSegundos: 20,
  pergunta: "Como você decide se um imóvel vale o flip ou não? Tem um processo definido?",
  tituloCaixa: "Faça uma pergunta",
  comAudio: true,
  legendas: [],
  selos: [],
  caixaTopo: 1110,
  legendaTopo: 1010,
  tamanhoLegenda: 44,
  escurecer: 0,
  mostrarGuias: false,
};

export const CaixinhaPerguntas: React.FC<CaixinhaProps> = (props) => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <OffthreadVideo
        src={staticFile(props.fundoSrc)}
        muted={!props.comAudio}
        startFrom={Math.round(props.fundoInicio * FPS)}
        style={{ width: LARGURA, height: ALTURA, objectFit: "cover" }}
      />
      {props.escurecer > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${props.escurecer})` }} /> : null}

      <CaixaPergunta titulo={props.tituloCaixa} pergunta={props.pergunta} topo={props.caixaTopo} />

      {props.legendas.length > 0 ? (
        <LegendaFala legendas={props.legendas} topo={props.legendaTopo} limiteFrame={Number.MAX_SAFE_INTEGER} tamanho={props.tamanhoLegenda} />
      ) : null}

      {props.selos.map((s, i) => (
        <SeloVermelho key={i} selo={s} topo={props.legendaTopo - 120} />
      ))}

      {props.mostrarGuias ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SAFE.topo, background: "rgba(255,0,0,0.25)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: SAFE.base, background: "rgba(255,0,0,0.25)" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: SAFE.direita, background: "rgba(255,0,0,0.25)" }} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
