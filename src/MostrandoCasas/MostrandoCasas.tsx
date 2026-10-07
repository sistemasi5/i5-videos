import { AbsoluteFill, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame } from "remotion";
import { AberturaTexto } from "./AberturaTexto";
import { CartaoInfo } from "./CartaoInfo";
import { LegendaFala } from "./LegendaFala";
import type { CasasProps } from "./types";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;

// Area segura do Reels/Stories (o app cobre topo, base e lateral direita).
export const SAFE = { topo: 140, base: 420, direita: 140 };

export const casasDefaults: CasasProps = {
  fundoSrc: "videos/teste-casas/fundo.mp4",
  fundoInicio: 0,
  duracaoSegundos: 30,
  comAudio: false,
  legendas: [],
  legendaTopo: 1330,
  abertura: {
    linhaTopo: "olha essa",
    destaque: "oportunidade",
    linhaBase: "que está indo a leilão",
    local: "Pennsylvania",
    sai: 5,
  },
  cartoes: [
    { rotulo: "valor inicial", destaque: "$8,500" },
    { destaque: "2 quartos e\n1 banheiro" },
    { destaque: "1512 sqft" },
    { rotulo: "valor de mercado pós reforma:", destaque: "$120k" },
    { rotulo: "potencial de aluguel mensal", destaque: "$1200" },
    { rotulo: "Me conta aqui.", destaque: "Você arremataria\nessa casa?" },
  ],
  telaFinalSegundos: 0, // sem logo por padrão: só entra quando pedirem
  logoSrc: "",
  corTelaFinal: "#000",
  corDestaque: "#E0B94E",
  cartaoTopo: 1225,
  escurecer: 0,
  mostrarGuias: false,
};

export const MostrandoCasas: React.FC<CasasProps> = (props) => {
  const frame = useCurrentFrame();
  const totalFrames = Math.round(props.duracaoSegundos * FPS);
  const finalFrames = Math.round(props.telaFinalSegundos * FPS);
  const inicioFinal = totalFrames - finalFrames;
  const fimAbertura = Math.round((props.abertura?.sai ?? 5) * FPS);

  // Cartões sem "entra" dividem por igual o tempo entre a abertura e a tela final.
  const livre = Math.max(inicioFinal - (props.abertura ? fimAbertura : 0), FPS);
  const base = props.abertura ? fimAbertura : 0;
  const passo = livre / props.cartoes.length;
  const tempos = props.cartoes.map((c, i) => {
    const entra = c.entra !== undefined ? Math.round(c.entra * FPS) : Math.round(base + passo * i);
    const proximo = props.cartoes[i + 1];
    const sai =
      c.sai !== undefined
        ? Math.round(c.sai * FPS)
        : proximo?.entra !== undefined
          ? Math.round(proximo.entra * FPS) - 4
          : Math.round(base + passo * (i + 1)) - 4;
    return { entra, sai: Math.min(sai, inicioFinal) };
  });

  const noFinal = frame >= inicioFinal;
  const fadeLogo = interpolate(frame, [inicioFinal, inicioFinal + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* Tour pelo imóvel, sem som: a música é escolhida no Instagram. */}
      {!noFinal || fadeLogo < 1 ? (
        <OffthreadVideo
          src={staticFile(props.fundoSrc)}
          muted={!props.comAudio}
          startFrom={Math.round(props.fundoInicio * FPS)}
          style={{ width: LARGURA, height: ALTURA, objectFit: "cover" }}
        />
      ) : null}
      {props.escurecer > 0 ? <AbsoluteFill style={{ background: `rgba(0,0,0,${props.escurecer})` }} /> : null}

      {props.abertura ? (
        <AberturaTexto
          abertura={props.abertura}
          fimFrame={fimAbertura}
          topo={props.cartaoTopo - 20}
          corDestaque={props.corDestaque}
        />
      ) : null}

      {props.cartoes.map((c, i) => (
        <CartaoInfo
          key={i}
          cartao={c}
          inicio={tempos[i].entra}
          fim={tempos[i].sai}
          topo={props.cartaoTopo}
          corDestaque={props.corDestaque}
        />
      ))}

      {props.legendas.length > 0 ? (
        <LegendaFala legendas={props.legendas} topo={props.legendaTopo} limiteFrame={inicioFinal} />
      ) : null}

      {finalFrames > 0 && props.logoSrc ? (
        <AbsoluteFill style={{ background: props.corTelaFinal, opacity: fadeLogo, alignItems: "center", justifyContent: "center" }}>
          <Img src={staticFile(props.logoSrc)} style={{ width: 760, height: 760, objectFit: "contain" }} />
        </AbsoluteFill>
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
