import { useMemo } from "react";
import { AbsoluteFill, Audio, Img, interpolate, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { poppins } from "../MostrandoCasas/CartaoInfo";
import { COR } from "./Bonequinho";
import { CENAS, PALCO } from "./cenas";
import { LegendaKaraoke, agruparPalavras } from "./LegendaKaraoke";
import type { DepoimentoProps, Palavra, Quem } from "./types";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;

// Área segura do Reels: topo 140, base 420, direita 140.
const SAFE = { topo: 140, base: 420, direita: 140 };
const PALCO_TOPO = 330;
const LEGENDA_TOPO = 1280;

export const depoimentoDefaults: DepoimentoProps = {
  audioSrc: "videos/depoimento-rafael/audio.m4a",
  trechos: [],
  duracaoSegundos: 10,
  palavras: [],
  cenas: [
    { tipo: "chegada", inicio: 0, fim: 5, textos: {}, momentos: {} },
    { tipo: "desconto", inicio: 5, fim: 10, textos: {}, momentos: {} },
  ],
  nomeDepoente: "Rafael",
  nomeMentor: "Felipe",
  subtitulo: "aluno da Traction",
  telaFinalSegundos: 0,
  logoSrc: "brand/traction-logo.png",
  mostrarGuias: false,
};

/** Abertura da boca de quem está falando (0 a 1). */
const bocaDe = (palavras: Palavra[], quem: Quem, t: number, frame: number) => {
  const ativa = palavras.some((p) => p.quem === quem && t >= p.inicio && t < p.fim);
  return ativa ? 0.35 + 0.65 * Math.abs(Math.sin(frame * 0.85)) : 0;
};

const FADE = 3; // frames de fade em cada corte de áudio (evita estalo)

export const DepoimentoAnimado: React.FC<DepoimentoProps> = (props) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const grupos = useMemo(() => agruparPalavras(props.palavras), [props.palavras]);
  const bocaDepoente = bocaDe(props.palavras, "depoente", t, frame);
  const bocaMentor = bocaDe(props.palavras, "mentor", t, frame);
  const fimCenas = props.duracaoSegundos - props.telaFinalSegundos;
  const entrada = spring({ frame, fps, config: { damping: 14 } });

  return (
    <AbsoluteFill style={{ background: COR.fundo }}>
      {/* textura de pontinhos */}
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(249,104,48,0.13) 2.2px, transparent 2.6px)",
          backgroundSize: "44px 44px",
        }}
      />

      {props.trechos.map((tr, i) => {
        const dur = Math.round(tr.dur * fps);
        return (
          <Sequence key={i} from={Math.round(tr.inicio * fps)} durationInFrames={dur} layout="none">
            <Audio
              src={staticFile(props.audioSrc)}
              trimBefore={Math.round(tr.origem * fps)}
              volume={(f) => interpolate(f, [0, FADE, dur - FADE, dur], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
            />
          </Sequence>
        );
      })}

      {/* topo: selo e nome */}
      <div
        style={{
          position: "absolute",
          top: 170,
          left: 0,
          right: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          fontFamily: poppins,
          opacity: entrada,
          transform: `translateY(${(1 - entrada) * -30}px)`,
        }}
      >
        <div style={{ background: COR.laranja, color: COR.branco, fontWeight: 800, fontSize: 30, letterSpacing: 4, padding: "6px 24px", borderRadius: 999 }}>
          DEPOIMENTO
        </div>
        <div style={{ color: COR.preto, fontWeight: 800, fontSize: 40 }}>
          {props.nomeDepoente}
          <span style={{ fontWeight: 400 }}>{props.subtitulo ? `, ${props.subtitulo}` : ""}</span>
        </div>
      </div>

      {/* palco com as cenas */}
      <svg
        width={PALCO.largura}
        height={PALCO.altura}
        viewBox={`0 0 ${PALCO.largura} ${PALCO.altura}`}
        style={{ position: "absolute", top: PALCO_TOPO, left: 0, overflow: "visible" }}
      >
        <line x1={30} y1={PALCO.chao + 2} x2={1050} y2={PALCO.chao + 2} stroke="rgba(22,22,22,0.18)" strokeWidth={6} strokeLinecap="round" />
        {props.cenas.map((c, i) => {
          const Comp = CENAS[c.tipo];
          const de = Math.round(c.inicio * fps);
          const dur = Math.max(1, Math.round(c.fim * fps) - de);
          return (
            <Sequence key={i} from={de} durationInFrames={dur} layout="none">
              <Transicao dur={dur}>
                <Comp cena={c} bocaDepoente={bocaDepoente} bocaMentor={bocaMentor} nomeDepoente={props.nomeDepoente} nomeMentor={props.nomeMentor} />
              </Transicao>
            </Sequence>
          );
        })}
      </svg>

      {t < fimCenas ? <LegendaKaraoke grupos={grupos} topo={LEGENDA_TOPO} nomeMentor={props.nomeMentor} /> : null}

      {props.telaFinalSegundos > 0 ? (
        <Sequence from={Math.round(fimCenas * fps)}>
          <TelaFinal logoSrc={props.logoSrc} />
        </Sequence>
      ) : null}

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

/** Entrada de cada cena: sobe um pouco e aparece; sai sumindo rápido. */
const Transicao: React.FC<{ dur: number; children: React.ReactNode }> = ({ dur, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ent = spring({ frame, fps, config: { damping: 16 } });
  const sai = interpolate(frame, [dur - 5, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const esc = 0.94 + 0.06 * ent;
  return (
    <g opacity={Math.min(ent * 1.4, 1) * sai} transform={`translate(540 ${460 + (1 - ent) * 40}) scale(${esc}) translate(-540 -460)`}>
      {children}
    </g>
  );
};

const TelaFinal: React.FC<{ logoSrc: string }> = ({ logoSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame, fps, config: { damping: 13 } });
  return (
    <AbsoluteFill style={{ background: "#000", alignItems: "center", justifyContent: "center", opacity: Math.min(1, frame / 6) }}>
      <Img src={staticFile(logoSrc)} style={{ width: 760, transform: `scale(${0.85 + 0.15 * s})` }} />
    </AbsoluteFill>
  );
};
