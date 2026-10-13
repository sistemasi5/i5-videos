import React from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { Maquete } from "./Maquete";
import { Rotulos, bebas } from "./Rotulos";
import { Apresentador, progressoMoldura } from "./Apresentador";
import { Legenda, useFala } from "./Legenda";
import { COR } from "./dims";
import {
  CAMERA_REFORMADA,
  ESTADO_REFORMADA,
  cameraNoTempo,
  estadoNoTempo,
  rampa,
} from "./tempo";

export type DiarioProps = {
  /** Quadro de estado: casa já reformada (não faz parte da linha do tempo da amostra). */
  estadoFixo?: "reformada";
};

export const DiarioReforma: React.FC<DiarioProps> = ({ estadoFixo }) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const fala = useFala();
  const fixo = estadoFixo === "reformada";
  const t = fixo ? ESTADO_REFORMADA.t : frame / fps;
  const e = fixo ? ESTADO_REFORMADA : estadoNoTempo(t);
  const pose = fixo ? CAMERA_REFORMADA : cameraNoTempo(t);
  const pf = fixo ? 1 : progressoMoldura(t);
  const kicker = rampa(t, 2.6, 3.4);

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(ellipse at 65% 30%, #3a3f46 0%, ${COR.grafite} 55%, #15171a 100%)`,
      }}
    >
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        gl={{ antialias: true }}
        camera={{ fov: 32, near: 0.1, far: 120, position: [8, 8, 20] }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.localClippingEnabled = true;
        }}
      >
        <Maquete e={e} pose={pose} largura={width} altura={height} />
      </ThreeCanvas>
      <Rotulos e={e} pose={pose} />
      <Apresentador pf={pf} t={fixo ? 15 : t} startFrom={fixo ? 450 : undefined} />
      {/* selo discreto do episódio */}
      <div
        style={{
          position: "absolute",
          left: 56,
          top: 150,
          opacity: kicker,
          fontFamily: bebas,
          fontSize: 34,
          letterSpacing: 6,
          color: COR.offwhite,
          textShadow: "0 2px 8px rgba(0,0,0,0.7)",
          transform: `translateY(${interpolate(kicker, [0, 1], [10, 0])}px)`,
        }}
      >
        <span style={{ color: COR.terracota }}>EP. 01</span> · DIÁRIO DE UMA REFORMA
      </div>
      {fala && !fixo ? <Legenda fala={fala} pf={pf} /> : null}
    </AbsoluteFill>
  );
};
