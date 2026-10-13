import React, { useLayoutEffect, useMemo } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";
import { CamadaDemolicao } from "./CamadaDemolicao";
import { CamadaEstrutura } from "./CamadaEstrutura";
import { CamadaAcabamento } from "./CamadaAcabamento";
import { COR, D, GAP, W } from "./dims";
import { CameraPose, EstadoMaquete, FOV } from "./tempo";

/** Posição de câmera calculada só a partir do `CameraPose` (também usada para projetar rótulos). */
export const posicaoCamera = (c: CameraPose) => {
  const az = (c.az * Math.PI) / 180;
  const el = (c.el * Math.PI) / 180;
  return new THREE.Vector3(
    c.tx + c.r * Math.cos(el) * Math.sin(az),
    c.ty + c.r * Math.sin(el),
    c.r * Math.cos(el) * Math.cos(az),
  );
};

export const configurarCamera = (
  camera: THREE.PerspectiveCamera,
  c: CameraPose,
  largura: number,
  altura: number,
) => {
  camera.fov = FOV;
  camera.aspect = largura / altura;
  camera.position.copy(posicaoCamera(c));
  camera.lookAt(c.tx, c.ty, 0);
  camera.setViewOffset(largura, altura, c.ox, c.oy, largura, altura);
  camera.updateProjectionMatrix();
  camera.updateMatrixWorld();
};

const CameraRig: React.FC<{ pose: CameraPose; largura: number; altura: number }> = ({
  pose,
  largura,
  altura,
}) => {
  const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera;
  useLayoutEffect(() => {
    configurarCamera(camera, pose, largura, altura);
  }, [camera, pose, largura, altura]);
  return null;
};

const Luzes: React.FC = () => (
  <>
    <ambientLight intensity={0.55} color="#fff3e2" />
    <hemisphereLight args={["#fff1dc", "#59554f", 0.6]} />
    {/* luz dourada suave, de frente-esquerda e de cima */}
    <directionalLight
      position={[-7, 14, 9]}
      intensity={2.4}
      color="#fff0dc"
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-camera-left={-9}
      shadow-camera-right={9}
      shadow-camera-top={9}
      shadow-camera-bottom={-9}
      shadow-camera-near={1}
      shadow-camera-far={40}
      shadow-bias={-0.0004}
      shadow-normalBias={0.03}
    />
    <directionalLight position={[8, 6, -6]} intensity={0.45} color="#9fb4d6" />
  </>
);

/** Sombra de contato suave sob a maquete. */
const SombraChao: React.FC<{ explode: number }> = ({ explode }) => {
  const tex = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = c.height = 256;
    const g = c.getContext("2d")!;
    const gr = g.createRadialGradient(128, 128, 20, 128, 128, 128);
    gr.addColorStop(0, "rgba(0,0,0,0.6)");
    gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }, []);
  return (
    <mesh position={[0, -0.62, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[W * 2.1, D * 2.6]} />
      <meshBasicMaterial map={tex} transparent opacity={0.85 - 0.25 * explode} depthWrite={false} />
    </mesh>
  );
};

/** Prancha de planta: papel escuro com malha, some quando a casa já subiu. */
const Planta: React.FC<{ op: number }> = ({ op }) => {
  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const lx = W / 2 + 1.0;
    const lz = D / 2 + 1.0;
    for (let x = -lx; x <= lx + 0.001; x += 0.4) pts.push(new THREE.Vector3(x, 0, -lz), new THREE.Vector3(x, 0, lz));
    for (let z = -lz; z <= lz + 0.001; z += 0.4) pts.push(new THREE.Vector3(-lx, 0, z), new THREE.Vector3(lx, 0, z));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  if (op <= 0.01) return null;
  return (
    <group position={[0, -0.2, 0]}>
      <mesh receiveShadow>
        <boxGeometry args={[W + 2.2, 0.04, D + 2.2]} />
        <meshStandardMaterial color="#2f3944" transparent opacity={0.92 * op} roughness={1} />
      </mesh>
      <lineSegments geometry={geo} position={[0, 0.03, 0]}>
        <lineBasicMaterial color={COR.dourada} transparent opacity={0.28 * op} />
      </lineSegments>
    </group>
  );
};

/**
 * A maquete: UMA casa, três camadas (uma por fase). Cada camada é um componente
 * próprio, para o próximo episódio evoluir só a fase correspondente.
 */
export const Maquete: React.FC<{
  e: EstadoMaquete;
  pose: CameraPose;
  largura: number;
  altura: number;
}> = ({ e, pose, largura, altura }) => {
  const off1 = GAP * e.explode;
  const off2 = GAP * 2 * e.explode;
  return (
    <>
      <CameraRig pose={pose} largura={largura} altura={altura} />
      <Luzes />
      <SombraChao explode={e.explode} />
      <Planta op={e.planta} />
      <group>
        <CamadaDemolicao e={e} />
      </group>
      <group position={[0, off1, 0]}>
        <CamadaEstrutura e={e} dim={1 - 0.6 * e.foco[0]} />
      </group>
      <group position={[0, off2, 0]}>
        <CamadaAcabamento e={e} dim={1 - 0.6 * e.foco[0]} />
      </group>
    </>
  );
};
