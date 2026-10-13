import "./index.css";
import { Composition } from "remotion";
import {
  ALTURA,
  FPS,
  GreenScreenReact,
  LARGURA,
  greenScreenDefaults,
} from "./GreenScreen/GreenScreenReact";
import type { GreenScreenProps } from "./GreenScreen/types";
import {
  ALTURA as BROLL_ALTURA,
  BrollInformativo,
  FPS as BROLL_FPS,
  LARGURA as BROLL_LARGURA,
  brollDefaults,
} from "./BrollInformativo/BrollInformativo";
import type { BrollProps } from "./BrollInformativo/types";
import {
  ALTURA as CASAS_ALTURA,
  FPS as CASAS_FPS,
  LARGURA as CASAS_LARGURA,
  MostrandoCasas,
  casasDefaults,
} from "./MostrandoCasas/MostrandoCasas";
import type { CasasProps } from "./MostrandoCasas/types";
import {
  ALTURA as CAIXA_ALTURA,
  CaixinhaPerguntas,
  FPS as CAIXA_FPS,
  LARGURA as CAIXA_LARGURA,
  caixinhaDefaults,
} from "./CaixinhaPerguntas/CaixinhaPerguntas";
import type { CaixinhaProps } from "./CaixinhaPerguntas/types";

import { ALTURA as T3_ALTURA, DURACAO_FRAMES as T3_DUR, FPS as T3_FPS, LARGURA as T3_LARGURA, Teste3D } from "./Teste3D/Teste3D";

import {
  ALTURA as TOUR_ALTURA,
  FPS as TOUR_FPS,
  LARGURA as TOUR_LARGURA,
  TourImovel,
  duracaoTour,
  tourDefaults,
} from "./TourImovel/TourImovel";
import type { TourImovelProps } from "./TourImovel/types";
import { TourViral, duracaoViral, viralDefaults } from "./TourViral/TourViral";
import {
  TourModelo1,
  TourModelo2,
  TourModelo3,
  planosM1,
  planosM2,
  planosM3,
  somaDur,
} from "./TourModelos/TourModelos";
import type { TourViralProps } from "./TourViral/types";

import { DiarioReforma } from "./DiarioReforma/DiarioReforma";
import { ALTURA as DR_ALTURA, FPS as DR_FPS, FRAMES_TOTAIS as DR_FRAMES, LARGURA as DR_LARGURA } from "./DiarioReforma/tempo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="GreenScreenReact"
        component={GreenScreenReact}
        width={LARGURA}
        height={ALTURA}
        fps={FPS}
        durationInFrames={FPS * greenScreenDefaults.duracaoSegundos}
        defaultProps={greenScreenDefaults}
        calculateMetadata={({ props }: { props: GreenScreenProps }) => ({
          durationInFrames: Math.round(props.duracaoSegundos * FPS),
        })}
      />
      <Composition
        id="BrollInformativo"
        component={BrollInformativo}
        width={BROLL_LARGURA}
        height={BROLL_ALTURA}
        fps={BROLL_FPS}
        durationInFrames={BROLL_FPS * brollDefaults.duracaoSegundos}
        defaultProps={brollDefaults}
        calculateMetadata={({ props }: { props: BrollProps }) => ({
          durationInFrames: Math.round(props.duracaoSegundos * BROLL_FPS),
        })}
      />
      <Composition
        id="MostrandoCasas"
        component={MostrandoCasas}
        width={CASAS_LARGURA}
        height={CASAS_ALTURA}
        fps={CASAS_FPS}
        durationInFrames={CASAS_FPS * casasDefaults.duracaoSegundos}
        defaultProps={casasDefaults}
        calculateMetadata={({ props }: { props: CasasProps }) => ({
          durationInFrames: Math.round(props.duracaoSegundos * CASAS_FPS),
        })}
      />
      <Composition
        id="CaixinhaPerguntas"
        component={CaixinhaPerguntas}
        width={CAIXA_LARGURA}
        height={CAIXA_ALTURA}
        fps={CAIXA_FPS}
        durationInFrames={CAIXA_FPS * caixinhaDefaults.duracaoSegundos}
        defaultProps={caixinhaDefaults}
        calculateMetadata={({ props }: { props: CaixinhaProps }) => ({
          durationInFrames: Math.round(props.duracaoSegundos * CAIXA_FPS),
        })}
      />
      <Composition
        id="TourImovel"
        component={TourImovel}
        width={TOUR_LARGURA}
        height={TOUR_ALTURA}
        fps={TOUR_FPS}
        durationInFrames={Math.round(duracaoTour(tourDefaults) * TOUR_FPS)}
        defaultProps={tourDefaults}
        calculateMetadata={({ props }: { props: TourImovelProps }) => ({
          durationInFrames: Math.round(duracaoTour(props) * TOUR_FPS),
        })}
      />
      <Composition
        id="TourViral"
        component={TourViral}
        width={TOUR_LARGURA}
        height={TOUR_ALTURA}
        fps={TOUR_FPS}
        durationInFrames={Math.round(duracaoViral(viralDefaults) * TOUR_FPS)}
        defaultProps={viralDefaults}
        calculateMetadata={({ props }: { props: TourViralProps }) => ({
          durationInFrames: Math.round(duracaoViral(props) * TOUR_FPS),
        })}
      />
      <Composition
        id="TourModelo1"
        component={TourModelo1}
        width={TOUR_LARGURA}
        height={TOUR_ALTURA}
        fps={TOUR_FPS}
        durationInFrames={Math.round(somaDur(planosM1) * TOUR_FPS)}
      />
      <Composition
        id="TourModelo2"
        component={TourModelo2}
        width={TOUR_LARGURA}
        height={TOUR_ALTURA}
        fps={TOUR_FPS}
        durationInFrames={Math.round(somaDur(planosM2) * TOUR_FPS)}
      />
      <Composition
        id="TourModelo3"
        component={TourModelo3}
        width={TOUR_LARGURA}
        height={TOUR_ALTURA}
        fps={TOUR_FPS}
        durationInFrames={Math.round(somaDur(planosM3) * TOUR_FPS)}
      />
      <Composition
        id="Teste3D"
        component={Teste3D}
        width={T3_LARGURA}
        height={T3_ALTURA}
        fps={T3_FPS}
        durationInFrames={T3_DUR}
      />
      <Composition
        id="DiarioReforma"
        component={DiarioReforma}
        width={DR_LARGURA}
        height={DR_ALTURA}
        fps={DR_FPS}
        durationInFrames={DR_FRAMES}
        defaultProps={{}}
      />
      <Composition
        id="DiarioReformaEstadoFinal"
        component={DiarioReforma}
        width={DR_LARGURA}
        height={DR_ALTURA}
        fps={DR_FPS}
        durationInFrames={DR_FRAMES}
        defaultProps={{ estadoFixo: "reformada" as const }}
      />
    </>
  );
};
