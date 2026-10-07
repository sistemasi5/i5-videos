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
    </>
  );
};
