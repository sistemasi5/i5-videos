import {
  AbsoluteFill,
  Img,
  OffthreadVideo,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { Plano, TourImovelProps } from "./types";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;

/** metade do whip, em segundos (saída do plano anterior + entrada do seguinte ≈ 0.3s) */
const WHIP = 0.15;

// Os 8 clipes do Cinema Studio 3.0 (4s cada) viram 2 planos cada:
// A = quadro inteiro no começo do clipe; B = reenquadrado, continuando EXATAMENTE
// de onde o A parou (nenhum quadro do clipe se repete). Só corte seco.
const planosDefault: Plano[] = [
  "tour-temple/cinema-01-fachada.mp4",
  "tour-temple/cinema-02-entrada.mp4",
  "tour-temple/cinema-03-sala.mp4",
  "tour-temple/cinema-04-cozinha.mp4",
  "tour-temple/cinema-05-quarto.mp4",
  "tour-temple/cinema-06-quarto-escada.mp4",
  "tour-temple/cinema-07-hall-escada.mp4",
  "tour-temple/cinema-08-piscina.mp4",
].flatMap((src, i) => {
  const corte = i === 0 ? 2.5 : 2;
  return [
    { src, inicio: 0, dur: corte, zoom: 1, dx: 0, dy: 0 },
    { src, inicio: corte, dur: 4 - corte, zoom: 1.28, dx: i % 2 === 0 ? -55 : 55, dy: -35 },
  ];
});

export const tourDefaults: TourImovelProps = {
  planos: planosDefault,
  titulo: "FLÓRIDA — WINTER PARK",
  chip: "Kraft Azalea Garden · a 1 km",
  segundosTitulo: 3,
  logoSrc: "",
  segundosLogo: 1.8,
};

export const duracaoTour = (p: TourImovelProps): number =>
  p.planos.reduce((s, pl) => s + pl.dur, 0) + (p.logoSrc ? p.segundosLogo : 0);

const PlanoVideo: React.FC<{ plano: Plano; temWhipOut: boolean }> = ({
  plano,
  temWhipOut,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const t = frame / fps;
  const tFim = durationInFrames / fps - t;

  let x = 0;
  let blur = 0;
  if (plano.whipIn && t < WHIP) {
    const p = t / WHIP;
    x = interpolate(p, [0, 1], [LARGURA * 0.6, 0]);
    blur = interpolate(p, [0, 1], [26, 0]);
  }
  if (temWhipOut && tFim < WHIP) {
    const p = 1 - tFim / WHIP;
    x = interpolate(p, [0, 1], [0, -LARGURA * 0.6]);
    blur = interpolate(p, [0, 1], [0, 26]);
  }

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <OffthreadVideo
        src={staticFile(plano.src)}
        startFrom={Math.round(plano.inicio * fps)}
        muted
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transform: `translate(${x + plano.dx}px, ${plano.dy}px) scale(${plano.zoom})`,
          filter: blur > 0 ? `blur(${blur}px)` : undefined,
        }}
      />
    </AbsoluteFill>
  );
};

const Titulo: React.FC<{ titulo: string; chip: string }> = ({ titulo, chip }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 20 });
  const sai = interpolate(frame, [durationInFrames - 12, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        paddingTop: 320,
        opacity: sai,
      }}
    >
      <div
        style={{
          transform: `translateY(${(1 - entra) * 40}px)`,
          textAlign: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            color: "#fff",
            fontSize: 72,
            fontWeight: 800,
            letterSpacing: 6,
            textShadow: "0 4px 24px rgba(0,0,0,0.75)",
          }}
        >
          {titulo}
        </div>
        {chip ? (
          <div
            style={{
              display: "inline-block",
              marginTop: 28,
              padding: "14px 34px",
              borderRadius: 999,
              backgroundColor: "rgba(10,10,10,0.62)",
              color: "#E0B94E",
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            {chip}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

const CardLogo: React.FC<{ logoSrc: string }> = ({ logoSrc }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = interpolate(frame, [0, fps * 0.4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill
      style={{ backgroundColor: "#0d0d0d", alignItems: "center", justifyContent: "center", opacity: op }}
    >
      <Img src={staticFile(logoSrc)} style={{ width: 560 }} />
    </AbsoluteFill>
  );
};

export const TourImovel: React.FC<TourImovelProps> = (props) => {
  const { planos, titulo, chip, segundosTitulo, logoSrc, segundosLogo } = props;

  let cursor = 0;
  const seqs = planos.map((plano, i) => {
    const from = Math.round(cursor * FPS);
    cursor += plano.dur;
    const durFrames = Math.round(cursor * FPS) - from;
    const temWhipOut = i + 1 < planos.length && Boolean(planos[i + 1].whipIn);
    return (
      <Sequence key={i} from={from} durationInFrames={durFrames} name={plano.src + " #" + (i % 2 ? "B" : "A")}>
        <PlanoVideo plano={plano} temWhipOut={temWhipOut} />
      </Sequence>
    );
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs}
      {titulo ? (
        <Sequence from={0} durationInFrames={Math.round(segundosTitulo * FPS)} name="Título">
          <Titulo titulo={titulo} chip={chip} />
        </Sequence>
      ) : null}
      {logoSrc ? (
        <Sequence
          from={Math.round(cursor * FPS)}
          durationInFrames={Math.round(segundosLogo * FPS)}
          name="Card da logo"
        >
          <CardLogo logoSrc={logoSrc} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
