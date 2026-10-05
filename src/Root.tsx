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
    </>
  );
};
