import React from "react";
import * as THREE from "three";
import { Easing } from "remotion";
import { Caixa, Cilindro } from "./primitivas";
import { Prancha } from "./CamadaEstrutura";
import { COR, D, H, JAN, PAREDE_NOVA, PORTA, T, W } from "./dims";
import { EstadoMaquete } from "./tempo";

const clamp = (n: number) => Math.min(1, Math.max(0, n));
const mix = (a: string, b: string, t: number) =>
  "#" + new THREE.Color(a).lerp(new THREE.Color(b), clamp(t)).getHexString();

/** Peça de revestimento que troca de material conforme a varredura passa por ela. */
const Faixa: React.FC<{
  pos: [number, number, number];
  tam: [number, number, number];
  de: string;
  para: string;
  /** 0→1: posição desta peça ao longo da varredura. */
  ordem: number;
  s: number;
  planos?: THREE.Plane[];
}> = ({ pos, tam, de, para, ordem, s, planos }) => {
  const entra = clamp((s * 1.5 - ordem * 0.5) * 6);
  if (entra <= 0.01) return null;
  const pintura = clamp((s * 1.6 - 0.35 - ordem * 0.6) * 5);
  return <Caixa pos={pos} tam={tam} cor={mix(de, para, pintura)} sombra={false} planos={planos} />;
};

const Revestimentos: React.FC<{ s: number; planos?: THREE.Plane[] }> = ({ s, planos }) => {
  const itens: React.ReactNode[] = [];
  const n = 16;
  const larg = (W - T) / n;
  const zN = -D / 2 + T / 2 + 0.011 + 0.01;
  // parede norte (pintura off-white), com o vão da janela livre
  for (let i = 0; i < n; i++) {
    const xa = -W / 2 + T / 2 + i * larg;
    const xb = xa + larg;
    const ordem = i / n;
    const cor = "#f1ece2";
    if (xb <= JAN.x0 || xa >= JAN.x1) {
      itens.push(
        <Faixa key={`n${i}`} pos={[(xa + xb) / 2, H / 2, zN]} tam={[larg - 0.004, H - 0.04, 0.02]} de={COR.reboco} para={cor} ordem={ordem} s={s} planos={planos} />,
      );
    } else {
      itens.push(
        <Faixa key={`nb${i}`} pos={[(xa + xb) / 2, JAN.y0 / 2, zN]} tam={[larg - 0.004, JAN.y0 - 0.02, 0.02]} de={COR.reboco} para={cor} ordem={ordem} s={s} planos={planos} />,
        <Faixa key={`nt${i}`} pos={[(xa + xb) / 2, (JAN.y1 + H) / 2, zN]} tam={[larg - 0.004, H - JAN.y1 - 0.02, 0.02]} de={COR.reboco} para={cor} ordem={ordem} s={s} planos={planos} />,
      );
    }
  }
  // parede oeste (pintura terracota), com o vão da porta livre
  const m = 10;
  const lz = (D - T) / m;
  const xO = -W / 2 + T / 2 + 0.011 + 0.01;
  for (let i = 0; i < m; i++) {
    const za = -D / 2 + T / 2 + i * lz;
    const zb = za + lz;
    const ordem = i / m;
    const cor = COR.terracota;
    if (zb <= PORTA.z0 || za >= PORTA.z1) {
      itens.push(
        <Faixa key={`o${i}`} pos={[xO, H / 2, (za + zb) / 2]} tam={[0.02, H - 0.04, lz - 0.004]} de={COR.reboco} para={cor} ordem={ordem} s={s} planos={planos} />,
      );
    } else {
      itens.push(
        <Faixa key={`ot${i}`} pos={[xO, (PORTA.y1 + H) / 2, (za + zb) / 2]} tam={[0.02, H - PORTA.y1 - 0.02, lz - 0.004]} de={COR.reboco} para={cor} ordem={ordem} s={s} planos={planos} />,
      );
    }
  }
  // parede nova, face frontal
  const k = 6;
  const lx = (PAREDE_NOVA.x1 - PAREDE_NOVA.x0) / k;
  for (let i = 0; i < k; i++) {
    const xa = PAREDE_NOVA.x0 + i * lx;
    itens.push(
      <Faixa key={`w${i}`} pos={[xa + lx / 2, H / 2, PAREDE_NOVA.z + T / 2 + 0.021]} tam={[lx - 0.004, H - 0.04, 0.02]} de={COR.reboco} para="#f1ece2" ordem={i / k} s={s} planos={planos} />,
    );
  }
  return <group>{itens}</group>;
};

/** Piso: contrapiso → piso de madeira, em ladrilhos. */
const Piso: React.FC<{ s: number; planos?: THREE.Plane[] }> = ({ s, planos }) => {
  const nx = 10;
  const nz = 7;
  const lx = (W - T) / nx;
  const lz = (D - T) / nz;
  const itens: React.ReactNode[] = [];
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < nz; j++) {
      const ordem = i / nx;
      const entra = clamp((s * 1.5 - ordem * 0.5) * 6);
      if (entra <= 0.01) continue;
      const madeira = clamp((s * 1.6 - 0.35 - ordem * 0.6) * 5);
      const tom = (i * 7 + j * 13) % 3 === 0 ? "#a97c50" : COR.madeira;
      itens.push(
        <Caixa
          key={`${i}-${j}`}
          pos={[-W / 2 + T / 2 + (i + 0.5) * lx, 0.015, -D / 2 + T / 2 + (j + 0.5) * lz]}
          tam={[lx - 0.01, 0.03, lz - 0.01]}
          cor={mix(COR.concreto, tom, madeira)}
          sombra={false}
          planos={planos}
        />,
      );
    }
  }
  return <group>{itens}</group>;
};

const Esquadrias: React.FC<{ p: number }> = ({ p }) => {
  if (p <= 0.01) return null;
  const cx = (JAN.x0 + JAN.x1) / 2;
  const cy = (JAN.y0 + JAN.y1) / 2;
  const zN = -D / 2;
  const cor = "#2b2e33";
  const e = 0.05;
  const w = JAN.x1 - JAN.x0;
  const h = JAN.y1 - JAN.y0;
  return (
    <group scale={[1, 1, 1]}>
      <group position={[cx, cy, zN]} scale={[p, p, 1]}>
        <Caixa pos={[0, h / 2 - e / 2, 0]} tam={[w, e, T + 0.04]} cor={cor} />
        <Caixa pos={[0, -h / 2 + e / 2, 0]} tam={[w, e, T + 0.04]} cor={cor} />
        <Caixa pos={[-w / 2 + e / 2, 0, 0]} tam={[e, h, T + 0.04]} cor={cor} />
        <Caixa pos={[w / 2 - e / 2, 0, 0]} tam={[e, h, T + 0.04]} cor={cor} />
        <Caixa pos={[0, 0, 0]} tam={[0.035, h - e, 0.05]} cor={cor} />
        <mesh>
          <planeGeometry args={[w - e, h - e]} />
          <meshStandardMaterial color={COR.vidro} transparent opacity={0.28} emissive={COR.vidro} emissiveIntensity={0.45} depthWrite={false} />
        </mesh>
      </group>
      {/* porta de madeira no vão oeste */}
      <group position={[-W / 2, PORTA.y1 / 2, (PORTA.z0 + PORTA.z1) / 2]} scale={[1, p, p]}>
        <Caixa pos={[0, 0, 0]} tam={[0.05, PORTA.y1 - 0.03, PORTA.z1 - PORTA.z0 - 0.1]} cor={COR.madeiraEscura} />
        <Caixa pos={[0, PORTA.y1 / 2 - 0.02, 0]} tam={[T + 0.03, 0.05, PORTA.z1 - PORTA.z0]} cor={cor} />
      </group>
    </group>
  );
};

const Sofa: React.FC = () => (
  <group>
    <Caixa pos={[0, 0.15, 0]} tam={[1.5, 0.3, 0.62]} cor="#d9cdb8" />
    <Caixa pos={[-0.37, 0.34, 0.05]} tam={[0.7, 0.14, 0.5]} cor="#e6dcc8" />
    <Caixa pos={[0.37, 0.34, 0.05]} tam={[0.7, 0.14, 0.5]} cor="#e6dcc8" />
    <Caixa pos={[0, 0.5, -0.26]} tam={[1.5, 0.42, 0.14]} cor="#c8bba3" />
    <Caixa pos={[-0.72, 0.36, 0]} tam={[0.14, 0.34, 0.62]} cor="#b9ab92" />
    <Caixa pos={[0.72, 0.36, 0]} tam={[0.14, 0.34, 0.62]} cor="#b9ab92" />
  </group>
);

const Mesa: React.FC = () => (
  <group>
    <Caixa pos={[0, 0.3, 0]} tam={[0.8, 0.05, 0.5]} cor={COR.madeiraEscura} />
    {[-0.34, 0.34].flatMap((x) =>
      [-0.2, 0.2].map((z) => <Caixa key={`${x}${z}`} pos={[x, 0.14, z]} tam={[0.05, 0.28, 0.05]} cor="#4e3521" />),
    )}
  </group>
);

/** Lata de tinta com rolo. */
const LataTinta: React.FC = () => (
  <group>
    <Cilindro pos={[0, 0.12, 0]} raio={0.12} altura={0.24} cor={COR.terracota} />
    <Cilindro pos={[0, 0.245, 0]} raio={0.125} altura={0.02} cor="#d9d2c4" />
    <Cilindro pos={[0, 0.12, 0]} raio={0.123} altura={0.07} cor={COR.offwhite} />
    <Caixa pos={[0.28, 0.05, 0.05]} tam={[0.2, 0.1, 0.07]} cor={COR.offwhite} rot={[0, 0.4, 0]} />
    <Caixa pos={[0.45, 0.1, 0.12]} tam={[0.22, 0.015, 0.015]} cor={COR.grafiteClaro} rot={[0, 0.4, 0.5]} />
  </group>
);

const Entrada: React.FC<{
  pos: [number, number, number];
  rotY?: number;
  p: number;
  children: React.ReactNode;
}> = ({ pos, rotY = 0, p, children }) => {
  if (p <= 0.01) return null;
  const f = Easing.out(Easing.back(1.6))(clamp(p));
  return (
    <group position={[pos[0], pos[1] + (1 - clamp(p)) * 0.6, pos[2]]} rotation={[0, rotY, 0]} scale={Math.max(0.001, f)}>
      {children}
    </group>
  );
};

export const CamadaAcabamento: React.FC<{ e: EstadoMaquete; planos?: THREE.Plane[]; dim?: number }> = ({ e, planos, dim = 1 }) => {
  const s = e.acabamento;
  return (
    <group>
      <Prancha op={e.explode * dim} cor={COR.dourada} />
      <Piso s={s} planos={planos} />
      <Revestimentos s={s} planos={planos} />
      <Esquadrias p={clamp((s - 0.5) * 3)} />
      <Entrada pos={[-1.5, 0.03, -D / 2 + 0.55]} p={clamp((e.moveis - 0.0) * 3)}>
        <Sofa />
      </Entrada>
      <Entrada pos={[-0.35, 0.03, 0.15]} p={clamp((e.moveis - 0.25) * 3)}>
        <Mesa />
      </Entrada>
      <Entrada pos={[1.45, 0.03, 1.35]} p={clamp((e.moveis - 0.5) * 3)} rotY={-0.5}>
        <LataTinta />
      </Entrada>
    </group>
  );
};
