import React from "react";
import { Easing } from "remotion";
import { Caixa, ContornoCaixa, Tubo } from "./primitivas";
import { COR, D, H, PAREDE_NOVA, T, W, rnd } from "./dims";
import { EstadoMaquete } from "./tempo";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

const TIJOLOS = ["#b8573a", COR.terracota, "#a94e34", "#bf5c3d"];

/** Prancha translúcida que marca o plano da camada na vista explodida. */
export const Prancha: React.FC<{ op: number; cor: string }> = ({ op, cor }) => {
  const tam: [number, number, number] = [W + 0.5, 0.04, D + 0.5];
  return (
    <group>
      <mesh position={[0, -0.03, 0]} receiveShadow visible={op > 0.01}>
        <boxGeometry args={tam} />
        <meshStandardMaterial
          color={COR.offwhite}
          transparent
          opacity={0.32 * op}
          depthWrite={false}
          roughness={0.9}
        />
      </mesh>
      <group position={[0, -0.03, 0]}>
        <ContornoCaixa tam={tam} cor={cor} op={op} />
      </group>
    </group>
  );
};

/** Parede nova: sobe bloco a bloco. */
const ParedeNova: React.FC<{ p: number }> = ({ p }) => {
  const { x0, x1, z, cols, rows } = PAREDE_NOVA;
  const bw = (x1 - x0) / cols;
  const bh = H / rows;
  const total = cols * rows;
  const out: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const ini = (i / total) * 0.72;
      const f = Easing.out(Easing.cubic)(clamp((p - ini) / 0.28));
      if (f <= 0.001) continue;
      out.push(
        <group key={i} position={[x0 + (c + 0.5) * bw, (r + 0.5) * bh + (1 - f) * 0.7, z]} scale={0.7 + 0.3 * f}>
          <Caixa
            pos={[0, 0, 0]}
            tam={[bw - 0.014, bh - 0.014, T]}
            cor={TIJOLOS[Math.floor(rnd(i + 7) * TIJOLOS.length)]}
            op={f}
          />
        </group>,
      );
    }
  }
  return <group>{out}</group>;
};

/** Pilha de blocos de obra. */
const PilhaBlocos: React.FC<{ op: number }> = ({ op }) => {
  const itens: React.ReactNode[] = [];
  let k = 0;
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4 - r; c++) {
      itens.push(
        <Caixa
          key={k}
          pos={[-W / 2 + 0.55 + (c + r * 0.5) * 0.3, 0.07 + r * 0.14, D / 2 - 0.5]}
          tam={[0.28, 0.13, 0.17]}
          cor={TIJOLOS[k % TIJOLOS.length]}
          op={op}
        />,
      );
      k++;
    }
  }
  return <group>{itens}</group>;
};

/** Conduíte e tubulação simplificados, desenhados como traço ilustrativo. */
const Instalacoes: React.FC<{ p: number }> = ({ p }) => {
  const zN = -D / 2 + T / 2 + 0.035;
  const xO = -W / 2 + T / 2 + 0.035;
  const zNova = PAREDE_NOVA.z + T / 2 + 0.035;
  const seg = (a: number, b: number) => clamp((p - a) / (b - a));
  return (
    <group>
      {/* conduíte elétrico na parede norte */}
      <Tubo a={[-2.2, 0.3, zN]} b={[-2.2, 1.05, zN]} p={seg(0, 0.2)} cor={COR.amarelo} />
      <Tubo a={[-2.2, 0.3, zN]} b={[0.3, 0.3, zN]} p={seg(0.1, 0.4)} cor={COR.amarelo} />
      <Tubo a={[0.3, 0.3, zN]} b={[0.3, 0.9, zN]} p={seg(0.35, 0.5)} cor={COR.amarelo} />
      {/* tubulação na parede oeste */}
      <Tubo a={[xO, 0.18, -1.4]} b={[xO, 0.18, 0.15]} p={seg(0.4, 0.62)} cor="#9db4c9" />
      <Tubo a={[xO, 0.18, 0.15]} b={[xO, 1.0, 0.15]} p={seg(0.58, 0.75)} cor="#9db4c9" />
      {/* na parede nova */}
      <Tubo a={[0.95, 0.4, zNova]} b={[2.4, 0.4, zNova]} p={seg(0.7, 0.9)} cor={COR.amarelo} />
      <Tubo a={[2.4, 0.4, zNova]} b={[2.4, 0.95, zNova]} p={seg(0.88, 1)} cor={COR.amarelo} />
    </group>
  );
};

export const CamadaEstrutura: React.FC<{ e: EstadoMaquete; dim?: number }> = ({ e, dim = 1 }) => {
  const opObra = clamp(e.explode * 1.2);
  return (
    <group>
      <Prancha op={e.explode * dim} cor={COR.terracota} />
      <PilhaBlocos op={opObra} />
      <ParedeNova p={e.estrutura} />
      <Instalacoes p={e.conduite} />
      {/* marca de locação da parede nova no piso da camada */}
      <Caixa
        pos={[(PAREDE_NOVA.x0 + PAREDE_NOVA.x1) / 2, 0.005, PAREDE_NOVA.z]}
        tam={[PAREDE_NOVA.x1 - PAREDE_NOVA.x0, 0.01, 0.1]}
        cor={COR.amarelo}
        op={opObra * (1 - clamp(e.estrutura * 3))}
        sombra={false}
      />
    </group>
  );
};
