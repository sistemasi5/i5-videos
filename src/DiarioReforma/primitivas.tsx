import React, { useMemo } from "react";
import * as THREE from "three";

type V3 = [number, number, number];

/** Caixa com sombra; `op` < 1 faz a peça desaparecer (e some do render em 0). */
export const Caixa: React.FC<{
  pos: V3;
  tam: V3;
  cor: string;
  op?: number;
  rot?: V3;
  sombra?: boolean;
  recebe?: boolean;
  emissivo?: string;
  emissivoInt?: number;
  rugosidade?: number;
  planos?: THREE.Plane[];
}> = ({
  pos,
  tam,
  cor,
  op = 1,
  rot,
  sombra = true,
  recebe = true,
  emissivo,
  emissivoInt = 0,
  rugosidade = 0.85,
  planos,
}) => (
  <mesh
    position={pos}
    rotation={rot}
    castShadow={sombra && op > 0.5}
    receiveShadow={recebe}
    visible={op > 0.01}
  >
    <boxGeometry args={tam} />
    <meshStandardMaterial
      color={cor}
      roughness={rugosidade}
      transparent={op < 1}
      opacity={op}
      emissive={emissivo ?? "#000000"}
      emissiveIntensity={emissivoInt}
      depthWrite={op >= 1}
      clippingPlanes={planos}
    />
  </mesh>
);

/** Cilindro de eixo Y. */
export const Cilindro: React.FC<{
  pos: V3;
  raio: number;
  altura: number;
  cor: string;
  op?: number;
  segmentos?: number;
}> = ({ pos, raio, altura, cor, op = 1, segmentos = 20 }) => (
  <mesh position={pos} castShadow receiveShadow visible={op > 0.01}>
    <cylinderGeometry args={[raio, raio, altura, segmentos]} />
    <meshStandardMaterial color={cor} roughness={0.6} transparent={op < 1} opacity={op} />
  </mesh>
);

const EIXO_Y = new THREE.Vector3(0, 1, 0);

/** Tubo que "se desenha" de `a` até `b` conforme `p` (0→1). */
export const Tubo: React.FC<{
  a: V3;
  b: V3;
  p: number;
  raio?: number;
  cor: string;
}> = ({ a, b, p, raio = 0.028, cor }) => {
  const { centro, comp, quat } = useMemo(() => {
    const va = new THREE.Vector3(...a);
    const vb = new THREE.Vector3(...b);
    const dir = vb.clone().sub(va);
    const comp = dir.length();
    const quat = new THREE.Quaternion().setFromUnitVectors(EIXO_Y, dir.clone().normalize());
    return { centro: va, comp, quat, dir };
  }, [a, b]);
  const dir = useMemo(
    () => new THREE.Vector3(...b).sub(new THREE.Vector3(...a)).normalize(),
    [a, b],
  );
  if (p <= 0.001) return null;
  const c = centro.clone().add(dir.clone().multiplyScalar((comp * p) / 2));
  return (
    <mesh position={c} quaternion={quat} scale={[1, comp * p, 1]} castShadow>
      <cylinderGeometry args={[raio, raio, 1, 10]} />
      <meshStandardMaterial color={cor} roughness={0.45} />
    </mesh>
  );
};

/** Contorno de caixa em linhas (prancha de cada camada). */
export const ContornoCaixa: React.FC<{ tam: V3; cor: string; op: number }> = ({ tam, cor, op }) => {
  const geo = useMemo(() => new THREE.EdgesGeometry(new THREE.BoxGeometry(...tam)), [tam]);
  if (op <= 0.01) return null;
  return (
    <lineSegments geometry={geo}>
      <lineBasicMaterial color={cor} transparent opacity={op} />
    </lineSegments>
  );
};

/** Trechos de parede ao redor de uma abertura (oclusão real). */
export const clamp01 = (n: number) => Math.min(1, Math.max(0, n));
