import {
  AbsoluteFill,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;

// Três estilos de teste montados só em edição, com os 8 clipes do Cinema
// Studio da Temple Dr (A = começo do clipe, B = punch-in na continuação).
// Modelo 1: texto serif elegante fixo · Modelo 2: título amarelo + whips ·
// Modelo 3: ritmo calmo com fachada longa, sem texto.

type P = {
  src: string;
  inicio: number;
  dur: number;
  zoom: number;
  dx: number;
  whip?: boolean;
};

const C = (n: string) => `tour-temple/${n}.mp4`;
const FACHADA = C("cinema-01-fachada");
const ENTRADA = C("cinema-02-entrada");
const SALA = C("cinema-03-sala");
const COZINHA = C("cinema-04-cozinha");
const QUARTO = C("cinema-05-quarto");
const QUARTO2 = C("cinema-06-quarto-escada");
const HALL = C("cinema-07-hall-escada");
const PISCINA = C("cinema-08-piscina");

const A = (src: string, dur: number, whip = false): P => ({ src, inicio: 0.2, dur, zoom: 1, dx: 0, whip });
const B = (src: string, dur: number, whip = false): P => ({ src, inicio: 1.8, dur, zoom: 1.3, dx: 50, whip });

const WHIP = 0.15;

const Plano: React.FC<{ p: P; whipOut: boolean }> = ({ p, whipOut }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const tFim = durationInFrames / fps - t;
  let x = 0;
  let blur = 0;
  if (p.whip && t < WHIP) {
    const k = t / WHIP;
    x = interpolate(k, [0, 1], [LARGURA * 0.7, 0]);
    blur = interpolate(k, [0, 1], [34, 0]);
  }
  if (whipOut && tFim < WHIP) {
    const k = 1 - tFim / WHIP;
    x = interpolate(k, [0, 1], [0, -LARGURA * 0.7]);
    blur = interpolate(k, [0, 1], [0, 34]);
  }
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile(p.src)}
        startFrom={Math.round(p.inicio * fps)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translate(${x + p.dx * (p.zoom > 1 ? 1 : 0)}px, 0) scale(${p.zoom})`,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

const Linha: React.FC<{ planos: P[] }> = ({ planos }) => {
  let cursor = 0;
  return (
    <>
      {planos.map((p, i) => {
        const from = Math.round(cursor * FPS);
        cursor += p.dur;
        const durFrames = Math.round(cursor * FPS) - from;
        const whipOut = i + 1 < planos.length && Boolean(planos[i + 1].whip);
        return (
          <Sequence key={i} from={from} durationInFrames={durFrames} name={p.src}>
            <Plano p={p} whipOut={whipOut} />
          </Sequence>
        );
      })}
    </>
  );
};

export const somaDur = (planos: P[]): number => planos.reduce((s, p) => s + p.dur, 0);

// ---------- Modelo 1: mansão com texto serif elegante ----------

export const planosM1: P[] = [
  A(FACHADA, 1.6),
  B(FACHADA, 1.4),
  A(ENTRADA, 1.4),
  B(ENTRADA, 1.4),
  A(SALA, 1.4),
  A(COZINHA, 1.4),
  B(COZINHA, 1.4),
  B(SALA, 1.4),
  A(QUARTO, 1.4),
  A(QUARTO2, 1.4),
  A(HALL, 1.4),
  A(PISCINA, 1.4),
  B(PISCINA, 1.6),
];

const TextoSerif: React.FC<{ texto: string }> = ({ texto }) => (
  <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
    <div
      style={{
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#fff",
        fontSize: 54,
        letterSpacing: 10,
        textAlign: "center",
        whiteSpace: "pre-line",
        textShadow: "0 2px 18px rgba(0,0,0,0.6)",
      }}
    >
      {texto}
    </div>
  </AbsoluteFill>
);

export const TourModelo1: React.FC = () => {
  const total = somaDur(planosM1);
  const corte = 3.0; // "A ENTRADA VS." enquanto mostra fachada+portão, depois "A CASA"
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Linha planos={planosM1} />
      <Sequence from={0} durationInFrames={Math.round(corte * FPS)} name="Texto 1">
        <TextoSerif texto={"A ENTRADA\nVS."} />
      </Sequence>
      <Sequence
        from={Math.round(corte * FPS)}
        durationInFrames={Math.round((total - corte) * FPS)}
        name="Texto 2"
      >
        <TextoSerif texto="A CASA" />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------- Modelo 2: título amarelo fixo + whips ----------

export const planosM2: P[] = [
  A(SALA, 1.6),
  A(QUARTO, 1.6, true),
  A(COZINHA, 1.6, true),
  B(ENTRADA, 1.6, true),
  A(HALL, 1.6, true),
  A(QUARTO2, 1.6, true),
  B(SALA, 1.6, true),
  B(COZINHA, 1.6, true),
  A(PISCINA, 1.6, true),
  B(PISCINA, 1.6, true),
];

const TituloAmarelo: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 11, stiffness: 150 }, durationInFrames: 14 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <div style={{ transform: `scale(${0.8 + entra * 0.2})`, textAlign: "center" }}>
        <div style={{ fontFamily: "Arial, sans-serif", color: "#fff", fontSize: 30, letterSpacing: 8, fontWeight: 700, textShadow: "0 2px 10px rgba(0,0,0,0.6)" }}>
          · WELCOME ·
        </div>
        <div
          style={{
            fontFamily: "'Arial Black', Arial, sans-serif",
            color: "#F5C518",
            fontSize: 130,
            fontWeight: 900,
            lineHeight: 0.95,
            textShadow: "0 5px 0 rgba(120,80,0,0.55), 0 10px 26px rgba(0,0,0,0.55)",
          }}
        >
          HOUSE
        </div>
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            color: "#F5C518",
            fontSize: 92,
            marginTop: -18,
            textShadow: "0 4px 0 rgba(120,80,0,0.55), 0 8px 22px rgba(0,0,0,0.55)",
          }}
        >
          tour
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const TourModelo2: React.FC = () => {
  const total = somaDur(planosM2);
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Linha planos={planosM2} />
      <Sequence from={0} durationInFrames={Math.round((total - 1.6) * FPS)} name="Título">
        <TituloAmarelo />
      </Sequence>
    </AbsoluteFill>
  );
};

// ---------- Modelo 3: calmo, fachada longa, sem texto ----------

export const planosM3: P[] = [
  { src: FACHADA, inicio: 0.2, dur: 3.5, zoom: 1, dx: 0 },
  A(ENTRADA, 2),
  A(SALA, 2),
  B(SALA, 2),
  A(COZINHA, 2),
  A(HALL, 2),
  A(QUARTO, 2),
  A(QUARTO2, 2),
  A(PISCINA, 2),
  B(PISCINA, 2),
];

export const TourModelo3: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000" }}>
    <Linha planos={planosM3} />
  </AbsoluteFill>
);
