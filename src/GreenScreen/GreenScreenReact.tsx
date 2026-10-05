import {
  AbsoluteFill,
  Audio,
  Img,
  Loop,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CtaFinal } from "./CtaFinal";
import { Legendas } from "./Legendas";
import type { GreenScreenProps } from "./types";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;

const CTA_ULTIMOS_SEGUNDOS = 6;

export const greenScreenDefaults: GreenScreenProps = {
  fundoSrc: "videos/teste/fundo.mp4",
  apresentadorQuadros: "videos/teste/quadros",
  audioSrc: "videos/teste/apresentador.mp4",
  duracaoSegundos: 25,
  fundoDuracaoSegundos: 26.3,
  apresentadorLargura: 0.57,
  apresentadorBase: 100,
  palavras: [],
  legendaY: 850,
  cta: null,
  logoSrc: "brand/traction-logo.png",
  corDestaque: "#F96830",
  mostrarGuias: false,
};

// Area segura do Reels/Stories: o app cobre o topo, a base (legenda, botoes)
// e a lateral direita (curtir, comentar).
export const SAFE = { topo: 140, base: 420, direita: 140 };

export const GreenScreenReact: React.FC<GreenScreenProps> = (props) => {
  const frame = useCurrentFrame();
  const quadro = String(frame + 1).padStart(5, "0");
  const largura = LARGURA * props.apresentadorLargura;
  // O quadro do apresentador e 9:16.
  const altura = (largura * 16) / 9;
  const ctaInicio =
    props.cta?.inicio ?? props.duracaoSegundos - CTA_ULTIMOS_SEGUNDOS;

  return (
    <AbsoluteFill style={{ background: "#0A0A0A" }}>
      {/* 1. Fundo */}
      <Loop
        durationInFrames={Math.max(1, Math.floor(props.fundoDuracaoSegundos * FPS) - 1)}
      >
        <OffthreadVideo
          src={staticFile(props.fundoSrc)}
          muted
          style={{ width: LARGURA, height: ALTURA, objectFit: "cover" }}
        />
      </Loop>

      {/* 2. Degrade escuro atras do apresentador */}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to top, rgba(10,10,10,0.96) 0%, rgba(10,10,10,0.85) 22%, rgba(10,10,10,0) 52%)",
        }}
      />

      {/* 3. Apresentador recortado, centrado, acima da zona dos botoes do Reels */}
      <div
        style={{
          position: "absolute",
          left: (LARGURA - largura) / 2,
          bottom: props.apresentadorBase,
          width: largura,
          height: altura,
          // esfuma as laterais e a base: o corpo some, nao fica cortado seco
          WebkitMaskImage:
            "linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%), linear-gradient(to bottom, black 0%, black 88%, transparent 100%)",
          WebkitMaskComposite: "source-in",
          maskComposite: "intersect",
        }}
      >
        {/* Sequencia de imagens: video com transparencia (WebM) falha de forma
            intermitente no render (quadros fora de ordem / "No frame found"). */}
        <Img
          src={staticFile(`${props.apresentadorQuadros}/${quadro}.webp`)}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
      <Audio src={staticFile(props.audioSrc)} />

      {/* 4. Legendas palavra por palavra */}
      <Legendas
        palavras={props.palavras}
        y={props.legendaY}
        corDestaque={props.corDestaque}
      />

      {props.mostrarGuias ? (
        <AbsoluteFill style={{ pointerEvents: "none" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SAFE.topo, background: "rgba(255,0,0,0.25)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: SAFE.base, background: "rgba(255,0,0,0.25)" }} />
          <div style={{ position: "absolute", top: 0, bottom: 0, right: 0, width: SAFE.direita, background: "rgba(255,0,0,0.25)" }} />
        </AbsoluteFill>
      ) : null}

      {/* 5. CTA final */}
      {props.cta ? (
        <CtaFinal
          cta={props.cta}
          inicio={ctaInicio}
          logoSrc={props.logoSrc}
          corDestaque={props.corDestaque}
        />
      ) : null}
    </AbsoluteFill>
  );
};
