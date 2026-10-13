import React, { useLayoutEffect } from "react";
import {
  AbsoluteFill,
  Easing,
  OffthreadVideo,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import * as THREE from "three";

export const LARGURA = 1080;
export const ALTURA = 1920;
export const FPS = 30;
export const DURACAO_FRAMES = 150; // 5 s

// Linha do tempo (em frames). Tudo abaixo deriva de useCurrentFrame().
const ABRE_INICIO = 30;
const ABRE_FIM = 70;
const REUNE_INICIO = 90;
const REUNE_FIM = 130;

const ease = Easing.inOut(Easing.cubic);

/** 0 = camadas reunidas na sala, 1 = camadas totalmente abertas. */
const useAbertura = (frame: number) => {
  const abre = interpolate(frame, [ABRE_INICIO, ABRE_FIM], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const reune = interpolate(frame, [REUNE_INICIO, REUNE_FIM], [0, 1], {
    easing: ease,
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return abre * (1 - reune);
};

const CameraRig: React.FC<{ frame: number }> = ({ frame }) => {
  const camera = useThree((s) => s.camera);
  useLayoutEffect(() => {
    const k = [0, 40, 75, 110, 150];
    const az = interpolate(frame, k, [40, 34, 26, 18, 12]) * (Math.PI / 180);
    const raio = interpolate(frame, k, [17, 18, 21, 19, 16.5], {
      easing: Easing.inOut(Easing.quad),
    });
    const alt = interpolate(frame, k, [5, 6, 8, 7, 6.5]);
    const alvoY = interpolate(frame, k, [1.2, 1.8, 3.0, 1.8, 1.0]);
    camera.position.set(Math.sin(az) * raio, alt, Math.cos(az) * raio);
    camera.lookAt(0, alvoY, 0);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }, [camera, frame]);
  return null;
};

const Caixa: React.FC<{
  pos: [number, number, number];
  tam: [number, number, number];
  cor: string;
  sombra?: boolean;
  recebe?: boolean;
}> = ({ pos, tam, cor, sombra = true, recebe = true }) => (
  <mesh position={pos} castShadow={sombra} receiveShadow={recebe}>
    <boxGeometry args={tam} />
    <meshStandardMaterial color={cor} roughness={0.85} />
  </mesh>
);

/** Camada de apoio translucida para tornar visivel a separacao das camadas. */
const Placa: React.FC<{
  largura: number;
  profundidade: number;
  aberta: number;
  cor: string;
}> = ({ largura, profundidade, aberta, cor }) => (
  <mesh position={[0, -0.03, 0]}>
    <boxGeometry args={[largura, 0.04, profundidade]} />
    <meshStandardMaterial
      color={cor}
      transparent
      opacity={0.55 * aberta}
      emissive={cor}
      emissiveIntensity={0.5}
      depthWrite={false}
    />
  </mesh>
);

// ---------- Camada 1: casca (piso, duas paredes, janela) ----------
const PAREDE_ESP = 0.16;
const ALTURA_PAREDE = 3.2;
const JAN = { cx: 1.5, cy: 1.75, w: 1.6, h: 1.35 };

const Casca: React.FC = () => {
  const zFundo = -3 - PAREDE_ESP / 2;
  const xEsq = -3 - PAREDE_ESP / 2;
  const jx0 = JAN.cx - JAN.w / 2;
  const jx1 = JAN.cx + JAN.w / 2;
  const jy0 = JAN.cy - JAN.h / 2;
  const jy1 = JAN.cy + JAN.h / 2;
  const cor = "#e9e2d4";
  return (
    <group>
      {/* piso */}
      <Caixa pos={[0, -0.1, 0]} tam={[6.4, 0.2, 6.4]} cor="#b98a5a" sombra={false} />
      {/* parede esquerda (inteira) */}
      <Caixa
        pos={[xEsq, ALTURA_PAREDE / 2, 0]}
        tam={[PAREDE_ESP, ALTURA_PAREDE, 6.3]}
        cor="#d8cfbf"
      />
      {/* parede do fundo: 4 pecas ao redor do vao da janela (oclusao real) */}
      <Caixa pos={[(-3.15 + jx0) / 2, ALTURA_PAREDE / 2, zFundo]} tam={[jx0 + 3.15, ALTURA_PAREDE, PAREDE_ESP]} cor={cor} />
      <Caixa pos={[(jx1 + 3) / 2, ALTURA_PAREDE / 2, zFundo]} tam={[3 - jx1, ALTURA_PAREDE, PAREDE_ESP]} cor={cor} />
      <Caixa pos={[JAN.cx, jy0 / 2, zFundo]} tam={[JAN.w, jy0, PAREDE_ESP]} cor={cor} />
      <Caixa pos={[JAN.cx, (jy1 + ALTURA_PAREDE) / 2, zFundo]} tam={[JAN.w, ALTURA_PAREDE - jy1, PAREDE_ESP]} cor={cor} />
      {/* moldura da janela */}
      <Caixa pos={[JAN.cx, jy0, zFundo + 0.06]} tam={[JAN.w + 0.16, 0.1, 0.2]} cor="#fbfaf6" />
      <Caixa pos={[JAN.cx, jy1, zFundo + 0.06]} tam={[JAN.w + 0.16, 0.1, 0.2]} cor="#fbfaf6" />
      <Caixa pos={[jx0, JAN.cy, zFundo + 0.06]} tam={[0.1, JAN.h, 0.2]} cor="#fbfaf6" />
      <Caixa pos={[jx1, JAN.cy, zFundo + 0.06]} tam={[0.1, JAN.h, 0.2]} cor="#fbfaf6" />
      <Caixa pos={[JAN.cx, JAN.cy, zFundo + 0.06]} tam={[0.06, JAN.h, 0.12]} cor="#fbfaf6" />
      {/* vidro (nao projeta sombra) */}
      <mesh position={[JAN.cx, JAN.cy, zFundo]}>
        <planeGeometry args={[JAN.w, JAN.h]} />
        <meshStandardMaterial
          color="#bfe3ff"
          transparent
          opacity={0.25}
          emissive="#9fd2ff"
          emissiveIntensity={0.6}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

// ---------- Camada 2: sofa ----------
const Sofa: React.FC = () => (
  // encosta na parede esquerda, de frente para +x
  <group position={[-1.95, 0, -0.2]} rotation={[0, Math.PI / 2, 0]}>
    <Caixa pos={[0, 0.25, 0]} tam={[2.6, 0.5, 1.1]} cor="#3f5b7a" />
    <Caixa pos={[-0.65, 0.62, 0.1]} tam={[1.2, 0.25, 0.85]} cor="#4d6d91" />
    <Caixa pos={[0.65, 0.62, 0.1]} tam={[1.2, 0.25, 0.85]} cor="#4d6d91" />
    <Caixa pos={[0, 0.85, -0.45]} tam={[2.6, 0.7, 0.22]} cor="#3f5b7a" />
    <Caixa pos={[-1.2, 0.6, 0]} tam={[0.2, 0.5, 1.1]} cor="#365069" />
    <Caixa pos={[1.2, 0.6, 0]} tam={[0.2, 0.5, 1.1]} cor="#365069" />
  </group>
);

// ---------- Camada 3: mesa + tapete + vaso ----------
const Mesa: React.FC = () => (
  <group position={[1.9, 0, 1.2]}>
    <Caixa pos={[0, 0.011, 0]} tam={[2.8, 0.022, 1.9]} cor="#a8483f" sombra={false} />
    <Caixa pos={[0, 0.52, 0]} tam={[1.3, 0.08, 0.75]} cor="#6b4a2f" />
    {[-0.55, 0.55].flatMap((x) =>
      [-0.28, 0.28].map((z) => (
        <Caixa key={`${x}${z}`} pos={[x, 0.24, z]} tam={[0.09, 0.48, 0.09]} cor="#4e3521" />
      )),
    )}
    <mesh position={[0.25, 0.8, 0.05]} castShadow receiveShadow>
      <cylinderGeometry args={[0.1, 0.14, 0.5, 20]} />
      <meshStandardMaterial color="#e8e1d2" roughness={0.5} />
    </mesh>
  </group>
);

const Sala: React.FC<{ frame: number }> = ({ frame }) => {
  const a = useAbertura(frame);
  return (
    <group>
      {/* camada 1 desce um pouco; 2 e 3 sobem e se afastam em z */}
      <group position={[0, -1.2 * a, 0]}>
        <Casca />
      </group>
      <group position={[0, 3.4 * a, 1.2 * a]}>
        <Sofa />
        <Placa largura={2.2} profundidade={3} aberta={a} cor="#6fb1ff" />
      </group>
      <group position={[0, 6.6 * a, 2.4 * a]}>
        <Mesa />
        <group position={[1.9, 0, 1.2]}>
          <Placa largura={2.9} profundidade={2} aberta={a} cor="#ffb86f" />
        </group>
      </group>
    </group>
  );
};

const Luzes: React.FC = () => (
  <>
    <ambientLight intensity={0.8} />
    <hemisphereLight args={["#ffffff", "#8a7a66", 0.55]} />
    {/* sol entrando pela janela (vem de tras da parede do fundo) */}
    <directionalLight
      position={[3.9, 4.55, -7.8]}
      intensity={2.6}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-camera-near={0.5}
      shadow-camera-far={25}
      shadow-bias={-0.0005}
      shadow-normalBias={0.02}
    />
    {/* preenchimento frontal sem sombra */}
    <directionalLight position={[6, 7, 10]} intensity={0.55} />
  </>
);

// ---------- Moldura chanfrada com o apresentador ----------
const chanfro = (c: number) =>
  `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`;

const MolduraApresentador: React.FC<{ frame: number }> = ({ frame }) => {
  const { fps } = useVideoConfig();
  const FW = 400;
  const FH = 680;
  const B = 14;
  const entra = interpolate(frame, [0, 0.6 * fps], [0.92, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateRight: "clamp",
  });
  const op = interpolate(frame, [0, 0.4 * fps], [0, 1], { extrapolateRight: "clamp" });
  return (
    <div
      style={{
        position: "absolute",
        left: (LARGURA - FW) / 2,
        top: (ALTURA - FH) / 2,
        width: FW,
        height: FH,
        transform: `scale(${entra})`,
        opacity: op,
        filter: "drop-shadow(0 24px 40px rgba(0,0,0,0.55))",
      }}
    >
      <div style={{ position: "absolute", inset: 0, clipPath: chanfro(56), background: "linear-gradient(135deg,#fff1b8 0%,#c79a2c 40%,#6d4f0f 62%,#f1d27a 100%)" }} />
      <div style={{ position: "absolute", inset: B / 2, clipPath: chanfro(50), background: "#1b1409" }} />
      <div style={{ position: "absolute", inset: B, clipPath: chanfro(44), background: "#000" }}>
        <OffthreadVideo
          src={staticFile("videos/teste-3d/apresentador.mp4")}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </div>
    </div>
  );
};

export const Teste3D: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg,#1d2a3a 0%,#0e141c 100%)" }}>
      <ThreeCanvas
        width={width}
        height={height}
        shadows
        camera={{ fov: 42, near: 0.1, far: 80, position: [6, 4, 12] }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
        }}
      >
        <CameraRig frame={frame} />
        <Luzes />
        <Sala frame={frame} />
      </ThreeCanvas>
      <MolduraApresentador frame={frame} />
    </AbsoluteFill>
  );
};
