import { AbsoluteFill, OffthreadVideo, staticFile } from "remotion";
import { CaixaTexto } from "./CaixaTexto";
import type { BrollProps } from "./types";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;

// Area segura do Reels/Stories: o app cobre o topo, a base (legenda, botoes)
// e a lateral direita (curtir, comentar).
export const SAFE = { topo: 140, base: 420, direita: 140 };

export const brollDefaults: BrollProps = {
  fundoSrc: "videos/teste-broll/fundo.mp4",
  fundoInicio: 0,
  duracaoSegundos: 15,
  blocos: [
    { texto: "O governo americano 🇺🇸 vende\ncasas retomadas por bancos\nPOR MENOS de US$ 100 mil", cor: "preto" },
    { texto: "e ainda paga o aluguel delas\ndireto na sua conta! ✅", cor: "preto" },
    { texto: "Deixei os 5 passos\nna legenda 👇", cor: "vermelho", entra: 4 },
  ],
  areaTopo: 560,
  areaBase: ALTURA - SAFE.base,
  tamanhoFonte: 46,
  escurecer: 0,
  mostrarGuias: false,
};

export const BrollInformativo: React.FC<BrollProps> = (props) => {
  return (
    <AbsoluteFill style={{ background: "#0A0A0A" }}>
      {/* 1. Clipe de fundo, sem som: a musica e escolhida no Instagram. */}
      <OffthreadVideo
        src={staticFile(props.fundoSrc)}
        muted
        startFrom={Math.round(props.fundoInicio * FPS)}
        style={{ width: LARGURA, height: ALTURA, objectFit: "cover" }}
      />
      {props.escurecer > 0 ? (
        <AbsoluteFill style={{ background: `rgba(0,0,0,${props.escurecer})` }} />
      ) : null}

      {/* 2. Blocos de texto empilhados, centralizados na area escolhida */}
      <div
        style={{
          position: "absolute",
          left: 0,
          width: LARGURA - SAFE.direita,
          top: props.areaTopo,
          height: props.areaBase - props.areaTopo,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: props.tamanhoFonte * 0.55,
        }}
      >
        {props.blocos.map((bloco, i) => (
          <CaixaTexto key={i} bloco={bloco} tamanhoFonte={props.tamanhoFonte} />
        ))}
      </div>

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
