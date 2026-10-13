import React from "react";
import { Easing } from "remotion";
import { Caixa } from "./primitivas";
import { COR, D, H, JAN, MURETA, PAREDE_VELHA, PORTA, T, W, rnd } from "./dims";
import { EstadoMaquete, rampa } from "./tempo";

const clamp = (n: number) => Math.min(1, Math.max(0, n));

/** Paredes externas com aberturas (4 peças ao redor do vão, para oclusão real). */
const ParedesExternas: React.FC = () => {
  const cor = COR.reboco;
  const zN = -D / 2;
  const xO = -W / 2;
  const px = (xa: number, xb: number, ya: number, yb: number) => ({
    pos: [(xa + xb) / 2, (ya + yb) / 2, zN] as [number, number, number],
    tam: [xb - xa, yb - ya, T] as [number, number, number],
  });
  const pz = (za: number, zb: number, ya: number, yb: number) => ({
    pos: [xO, (ya + yb) / 2, (za + zb) / 2] as [number, number, number],
    tam: [T, yb - ya, zb - za] as [number, number, number],
  });
  const norte = [
    px(-W / 2 - T / 2, JAN.x0, 0, H),
    px(JAN.x1, W / 2 + T / 2, 0, H),
    px(JAN.x0, JAN.x1, 0, JAN.y0),
    px(JAN.x0, JAN.x1, JAN.y1, H),
  ];
  const oeste = [
    pz(-D / 2 + T / 2, PORTA.z0, 0, H),
    pz(PORTA.z1, D / 2 + T / 2, 0, H),
    pz(PORTA.z0, PORTA.z1, PORTA.y1, H),
  ];
  return (
    <group>
      {[...norte, ...oeste].map((p, i) => (
        <Caixa key={i} pos={p.pos} tam={p.tam} cor={cor} />
      ))}
      {/* paredes baixas (corte para enxergar o interior) */}
      <Caixa pos={[W / 2, MURETA / 2, 0]} tam={[T, MURETA, D]} cor={COR.reboco} />
      <Caixa pos={[0, MURETA / 2, D / 2]} tam={[W, MURETA, T]} cor={COR.reboco} />
    </group>
  );
};

/** Parede interna marcada: fragmenta em blocos que saem de lado, caem e se recolhem. */
const ParedeVelha: React.FC<{ e: EstadoMaquete }> = ({ e }) => {
  const { x, z0, z1, cols, rows } = PAREDE_VELHA;
  const bl = (z1 - z0) / cols;
  const bh = H / rows;
  const pulso = 0.55 + 0.45 * Math.sin(e.t * 7);
  const blocos: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const i = r * cols + c;
      const delay = (rows - 1 - r) * 0.11 + c * 0.025;
      const tb = clamp((e.queda - delay) / 0.5);
      const slide = Easing.out(Easing.quad)(clamp(tb / 0.35));
      const fall = Easing.in(Easing.quad)(clamp((tb - 0.35) / 0.65));
      const lado = (r + c) % 2 === 0 ? 1 : -1;
      const lane = 0.25 + 0.23 * r;
      const y0 = (r + 0.5) * bh;
      const yRepouso = bh / 2;
      const px = lado * lane * slide;
      const py = y0 + (yRepouso - y0) * fall;
      const pz = z0 + (c + 0.5) * bl;
      const encolhe = 1 - rampa(e.queda, 0.84 + 0.01 * c + 0.01 * r, 0.99);
      if (encolhe < 0.02) continue;
      const tilt = lado * 0.22 * Math.sin(Math.PI * slide) * (1 - fall);
      const marcado = e.marca * (1 - clamp(tb * 3));
      blocos.push(
        <group key={i} position={[x + px, py, pz]} rotation={[0, 0, tilt]} scale={encolhe}>
          <Caixa
            pos={[0, 0, 0]}
            tam={[T, bh - 0.012, bl - 0.012]}
            cor={rnd(i) > 0.5 ? "#d4c9b6" : "#cbbfab"}
            emissivo={COR.terracota}
            emissivoInt={marcado * (0.25 + 0.35 * pulso)}
          />
        </group>,
      );
    }
  }
  const compr = z1 - z0;
  const fitaOp = 1 - clamp(e.queda * 12);
  return (
    <group>
      {blocos}
      {/* fita de demolição em X nas duas faces */}
      {[1, -1].map((lado) =>
        [0.62, -0.62].map((ang, k) => (
          <Caixa
            key={`${lado}${k}`}
            pos={[x + lado * (T / 2 + 0.012), H / 2, (z0 + z1) / 2]}
            tam={[0.014, Math.hypot(compr, H) * 0.88, 0.1]}
            rot={[ang, 0, 0]}
            cor={COR.amarelo}
            op={e.marca * fitaOp}
            sombra={false}
          />
        )),
      )}
    </group>
  );
};

/** Escora de obra ao lado da parede marcada; sai junto do revestimento antigo. */
const Escora: React.FC<{ op: number }> = ({ op }) => (
  <group position={[0.2, 0, 0.9]} visible={op > 0.01}>
    <Caixa pos={[0, H * 0.46, 0]} tam={[0.08, H * 0.92, 0.08]} cor={COR.madeira} op={op} />
    <Caixa pos={[0, 0.02, 0]} tam={[0.3, 0.04, 0.3]} cor={COR.madeiraEscura} op={op} />
    <Caixa pos={[0, H * 0.93, 0]} tam={[0.34, 0.05, 0.14]} cor={COR.madeiraEscura} op={op} />
    <Caixa pos={[0.2, H * 0.4, 0]} tam={[0.05, H * 0.75, 0.05]} rot={[0, 0, -0.5]} cor={COR.madeira} op={op} />
  </group>
);

/** Revestimentos antigos (somem na fase de demolição). */
const RevestimentoAntigo: React.FC<{ op: number }> = ({ op }) => (
  <group visible={op > 0.01}>
    <Caixa
      pos={[0, H / 2, -D / 2 + T / 2 + 0.012]}
      tam={[W - T * 2, H - 0.06, 0.024]}
      cor="#b9ab95"
      op={op}
      sombra={false}
    />
    <Caixa
      pos={[-W / 2 + T / 2 + 0.012, H / 2 + 0.0, 0]}
      tam={[0.024, H - 0.06, D - 0.5]}
      cor="#b9ab95"
      op={op}
      sombra={false}
    />
    <Caixa pos={[0, 0.012, 0]} tam={[W - 0.3, 0.024, D - 0.3]} cor={COR.pisoAntigo} op={op} sombra={false} />
  </group>
);

type P2 = [number, number];
/** Linhas tracejadas sobre o que sai: paredes e piso. */
const Tracejado: React.FC<{ p: number; op: number }> = ({ p, op }) => {
  const caminhos: { a: [number, number, number]; b: [number, number, number] }[] = [];
  const y = 0.03;
  const ix = W / 2 - 0.3;
  const iz = D / 2 - 0.3;
  const pts: P2[] = [
    [-ix, -iz],
    [ix, -iz],
    [ix, iz],
    [-ix, iz],
    [-ix, -iz],
  ];
  for (let i = 0; i < 4; i++) {
    caminhos.push({ a: [pts[i][0], y, pts[i][1]], b: [pts[i + 1][0], y, pts[i + 1][1]] });
  }
  caminhos.push({
    a: [-W / 2 + 0.3, 0.7, -D / 2 + T / 2 + 0.03],
    b: [W / 2 - 0.3, 0.7, -D / 2 + T / 2 + 0.03],
  });
  caminhos.push({
    a: [-W / 2 + T / 2 + 0.03, 0.7, -D / 2 + 0.3],
    b: [-W / 2 + T / 2 + 0.03, 0.7, D / 2 - 0.3],
  });
  const dashes: { pos: [number, number, number]; yaw: number }[] = [];
  caminhos.forEach(({ a, b }) => {
    const dx = b[0] - a[0];
    const dz = b[2] - a[2];
    const len = Math.hypot(dx, dz);
    const n = Math.max(2, Math.floor(len / 0.3));
    const yaw = Math.atan2(-dz, dx);
    for (let i = 0; i < n; i++) {
      const f = (i + 0.5) / n;
      dashes.push({ pos: [a[0] + dx * f, a[1], a[2] + dz * f], yaw });
    }
  });
  const total = dashes.length;
  return (
    <group>
      {dashes.map((d, i) => {
        const vis = clamp((p * (total + 6) - i) / 2);
        if (vis <= 0 || op <= 0.01) return null;
        return (
          <mesh key={i} position={d.pos} rotation={[0, d.yaw, 0]} scale={[vis, 1, 1]}>
            <boxGeometry args={[0.17, 0.03, 0.03]} />
            <meshStandardMaterial
              color={COR.amarelo}
              emissive={COR.amarelo}
              emissiveIntensity={0.45}
              transparent
              opacity={op}
            />
          </mesh>
        );
      })}
    </group>
  );
};

export const CamadaDemolicao: React.FC<{ e: EstadoMaquete }> = ({ e }) => {
  const sobeY = 0.02 + 0.98 * e.sobe;
  const escala = 0.9 + 0.1 * rampa(e.sobe, 0, 0.4);
  const opRev = 1 - e.remove;
  return (
    <group>
      {/* contrapiso */}
      <Caixa pos={[0, -0.08, 0]} tam={[W + T * 2, 0.16, D + T * 2]} cor={COR.concreto} sombra={false} />
      <group scale={[escala, sobeY, escala]}>
        <ParedesExternas />
        <ParedeVelha e={e} />
        <RevestimentoAntigo op={opRev} />
        <Escora op={opRev} />
        <Tracejado p={e.tracejado} op={1 - rampa(e.remove, 0.5, 1)} />
      </group>
    </group>
  );
};
