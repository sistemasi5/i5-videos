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
import type { PlanoViral, TourViralProps } from "./types";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;

const OURO = "#E0B94E";

// Estilo viral 2026: gancho de curiosidade nos 2 primeiros segundos,
// cortes secos a cada ~1,3s, punch-ins, legenda curta por cômodo e
// revelação do preço no card final. Cada clipe de 4s vira 2 planos
// contíguos (sem quadro repetido): A inteiro, B punch-in.
const CLIPES: { src: string; legenda: string }[] = [
  { src: "tour-temple/cinema-01-fachada.mp4", legenda: "Winter Park · Flórida" },
  { src: "tour-temple/cinema-02-entrada.mp4", legenda: "" },
  { src: "tour-temple/cinema-03-sala.mp4", legenda: "sala com lareira" },
  { src: "tour-temple/cinema-04-cozinha.mp4", legenda: "cozinha com ilha" },
  { src: "tour-temple/cinema-05-quarto.mp4", legenda: "4 quartos · 5 banheiros" },
  { src: "tour-temple/cinema-06-quarto-escada.mp4", legenda: "" },
  { src: "tour-temple/cinema-07-hall-escada.mp4", legenda: "340 m² de casa" },
  { src: "tour-temple/cinema-08-piscina.mp4", legenda: "piscina privativa" },
];

const planosDefault: PlanoViral[] = CLIPES.flatMap(({ src, legenda }, i) => [
  { src, inicio: 0.2, dur: 1.4, zoom: 1, dx: 0, dy: 0, legenda },
  { src, inicio: 1.6, dur: 1.2, zoom: 1.32, dx: i % 2 === 0 ? -60 : 60, dy: -40, legenda: "" },
]);

export const viralDefaults: TourViralProps = {
  planos: planosDefault,
  gancho: "QUANTO CUSTA ESSA\nCASA EM WINTER PARK?",
  segundosGancho: 2.6,
  preco: "US$ 3.695.999",
  specs: "4 quartos · 5 banheiros · 340 m² · piscina",
  segundosPreco: 3,
  logoSrc: "",
};

export const duracaoViral = (p: TourViralProps): number =>
  p.planos.reduce((s, pl) => s + pl.dur, 0) + Math.max(0, p.segundosPreco);

const Plano: React.FC<{ plano: PlanoViral }> = ({ plano }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  // micro punch-in contínuo dentro do plano, para dar vida ao corte seco
  const cresce = 1 + (frame / fps) * 0.02;
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
          transform: `translate(${plano.dx}px, ${plano.dy}px) scale(${plano.zoom * cresce})`,
        }}
      />
    </AbsoluteFill>
  );
};

const Legenda: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 200 }, durationInFrames: 12 });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-end", paddingBottom: 470 }}>
      <div
        style={{
          transform: `translateY(${(1 - entra) * 30}px)`,
          opacity: entra,
          padding: "12px 30px",
          borderRadius: 999,
          backgroundColor: "rgba(10,10,10,0.68)",
          color: "#fff",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

const Gancho: React.FC<{ texto: string }> = ({ texto }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const entra = spring({ frame, fps, config: { damping: 14, stiffness: 160 }, durationInFrames: 14 });
  const sai = interpolate(frame, [durationInFrames - 8, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "flex-start", paddingTop: 300, opacity: sai }}>
      <div
        style={{
          transform: `scale(${0.8 + entra * 0.2})`,
          textAlign: "center",
          fontFamily: "Arial, Helvetica, sans-serif",
          fontSize: 68,
          fontWeight: 900,
          lineHeight: 1.15,
          color: "#fff",
          whiteSpace: "pre-line",
          textShadow: "0 4px 26px rgba(0,0,0,0.85)",
          padding: "0 90px",
        }}
      >
        {texto}
      </div>
    </AbsoluteFill>
  );
};

const CardPreco: React.FC<{ preco: string; specs: string; logoSrc: string }> = ({
  preco,
  specs,
  logoSrc,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const op = interpolate(frame, [0, fps * 0.25], [0, 1], { extrapolateRight: "clamp" });
  const pop = spring({ frame: frame - 4, fps, config: { damping: 12, stiffness: 170 }, durationInFrames: 16 });
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "rgba(10,10,10,0.94)",
        alignItems: "center",
        justifyContent: "center",
        opacity: op,
        fontFamily: "Arial, Helvetica, sans-serif",
        textAlign: "center",
      }}
    >
      <div style={{ color: "#bbb", fontSize: 40, fontWeight: 700, letterSpacing: 4 }}>
        ESSA CASA CUSTA
      </div>
      <div
        style={{
          marginTop: 24,
          color: OURO,
          fontSize: 108,
          fontWeight: 900,
          transform: `scale(${0.7 + pop * 0.3})`,
        }}
      >
        {preco}
      </div>
      <div style={{ marginTop: 30, color: "#fff", fontSize: 38, fontWeight: 600 }}>{specs}</div>
      {logoSrc ? <Img src={staticFile(logoSrc)} style={{ width: 380, marginTop: 70 }} /> : null}
    </AbsoluteFill>
  );
};

export const TourViral: React.FC<TourViralProps> = (props) => {
  const { planos, gancho, segundosGancho, preco, specs, segundosPreco, logoSrc } = props;

  let cursor = 0;
  const seqs: React.ReactNode[] = [];
  planos.forEach((plano, i) => {
    const from = Math.round(cursor * FPS);
    cursor += plano.dur;
    const durFrames = Math.round(cursor * FPS) - from;
    seqs.push(
      <Sequence key={i} from={from} durationInFrames={durFrames} name={plano.src}>
        <Plano plano={plano} />
      </Sequence>,
    );
    if (plano.legenda && from / FPS >= segundosGancho - 0.5) {
      seqs.push(
        <Sequence key={"l" + i} from={from} durationInFrames={durFrames} name={"Legenda: " + plano.legenda}>
          <Legenda texto={plano.legenda} />
        </Sequence>,
      );
    }
  });
  const inicioPreco = Math.round(cursor * FPS);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {seqs}
      {gancho ? (
        <Sequence from={0} durationInFrames={Math.round(segundosGancho * FPS)} name="Gancho">
          <Gancho texto={gancho} />
        </Sequence>
      ) : null}
      {segundosPreco > 0 ? (
        <Sequence from={inicioPreco} durationInFrames={Math.round(segundosPreco * FPS)} name="Preço">
          <CardPreco preco={preco} specs={specs} logoSrc={logoSrc} />
        </Sequence>
      ) : null}
    </AbsoluteFill>
  );
};
