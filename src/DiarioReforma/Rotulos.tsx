import React from "react";
import * as THREE from "three";
import { loadFont as loadBebas } from "@remotion/google-fonts/BebasNeue";
import { configurarCamera } from "./Maquete";
import { COR, D, GAP, W } from "./dims";
import { CameraPose, EstadoMaquete, LARGURA, ALTURA, rampa } from "./tempo";

export const { fontFamily: bebas } = loadBebas();

const FASES = [
  { n: "01", nome: "DEMOLIÇÃO" },
  { n: "02", nome: "ESTRUTURA" },
  { n: "03", nome: "ACABAMENTO" },
];

const cam = new THREE.PerspectiveCamera();

/** Projeta um ponto do mundo (cena 3D) para pixels da tela, usando a MESMA câmera do render. */
const projetar = (pose: CameraPose, p: [number, number, number]) => {
  configurarCamera(cam, pose, LARGURA, ALTURA);
  const v = new THREE.Vector3(...p).project(cam);
  return { x: ((v.x + 1) / 2) * LARGURA, y: ((1 - v.y) / 2) * ALTURA };
};

/* ---------- ícones vetoriais animados pelo frame ---------- */

const IconeMarreta: React.FC<{ t: number; ativo: number }> = ({ t, ativo }) => {
  const ang = -30 + 62 * Math.max(0, Math.sin(t * 9)) * ativo;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <g transform={`rotate(${ang} 14 52)`}>
        <rect x="11" y="14" width="6" height="40" rx="2" fill="#c9a06b" />
        <rect x="2" y="6" width="34" height="14" rx="3" fill={COR.offwhite} />
        <rect x="2" y="6" width="9" height="14" rx="3" fill={COR.terracota} />
      </g>
    </svg>
  );
};

const IconeTijolo: React.FC<{ t: number; ativo: number }> = ({ t, ativo }) => {
  const queda = (i: number) => {
    const f = Math.min(1, Math.max(0, ((t * 1.6) % 2) - i * 0.25));
    return (1 - Math.min(1, f * 2.2)) * -14 * ativo;
  };
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      {[0, 1, 2].map((i) => (
        <rect
          key={i}
          x={i % 2 === 0 ? 8 : 20}
          y={40 - i * 16 + queda(i)}
          width="36"
          height="13"
          rx="2"
          fill={i === 1 ? COR.terracotaEscura : COR.terracota}
        />
      ))}
    </svg>
  );
};

const IconeRolo: React.FC<{ t: number; ativo: number }> = ({ t, ativo }) => {
  const dx = Math.sin(t * 5) * 6 * ativo;
  return (
    <svg width="64" height="64" viewBox="0 0 64 64">
      <g transform={`translate(${dx} 0)`}>
        <rect x="8" y="8" width="42" height="16" rx="5" fill={COR.terracota} />
        <path d="M50 16 H58 V34 H32 V44" fill="none" stroke={COR.offwhite} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="28" y="44" width="8" height="14" rx="3" fill="#c9a06b" />
      </g>
    </svg>
  );
};

const ICONES = [IconeMarreta, IconeTijolo, IconeRolo];

/** Rótulos DEMOLIÇÃO / ESTRUTURA / ACABAMENTO ligados às camadas por linhas de chamada. */
export const Rotulos: React.FC<{ e: EstadoMaquete; pose: CameraPose }> = ({ e, pose }) => {
  if (e.rotulos <= 0.001) return null;
  return (
    <svg
      width={LARGURA}
      height={ALTURA}
      style={{ position: "absolute", left: 0, top: 0, pointerEvents: "none" }}
    >
      {FASES.map((f, i) => {
        const ini = i * 0.22;
        const p = rampa(e.rotulos, ini, ini + 0.55);
        if (p <= 0.001) return null;
        const yCamada = GAP * i * e.explode;
        const ancora = projetar(pose, [-W / 2 - 0.05, yCamada + 0.45, D / 2 + 0.05]);
        const foco = e.foco[i];
        const labelX = 52;
        const labelY = Math.min(650, Math.max(300, ancora.y));
        const letras = Math.round(f.nome.length * rampa(p, 0.15, 1));
        const Icone = ICONES[i];
        const largura = 430;
        const fim = { x: labelX + 380, y: labelY + 44 };
        const linhaP = rampa(p, 0.4, 1);
        const cx = fim.x + (ancora.x - fim.x) * linhaP;
        const cy = fim.y + (ancora.y - fim.y) * linhaP;
        const opac = 0.62 + 0.38 * foco;
        return (
          <g key={f.n} opacity={opac * Math.min(1, p * 3)}>
            <line
              x1={fim.x}
              y1={fim.y}
              x2={cx}
              y2={cy}
              stroke={foco > 0.3 ? COR.amarelo : COR.offwhite}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray="1 0"
            />
            <circle cx={ancora.x} cy={ancora.y} r={7 * linhaP} fill={COR.amarelo} />
            <circle cx={ancora.x} cy={ancora.y} r={14 * linhaP} fill="none" stroke={COR.offwhite} strokeWidth={2} />
            <foreignObject x={labelX - 4} y={labelY - 70} width={largura} height={110}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 64, height: 64, flex: "none" }}>
                  <Icone t={e.t} ativo={foco} />
                </div>
                <div>
                  <div style={{ fontFamily: bebas, fontSize: 28, letterSpacing: 4, color: COR.terracota, lineHeight: 1, textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
                    FASE {f.n}
                  </div>
                  <div style={{ fontFamily: bebas, fontSize: 62, letterSpacing: 2, color: COR.offwhite, lineHeight: 1, whiteSpace: "nowrap", textShadow: "0 3px 10px rgba(0,0,0,0.75)" }}>
                    {f.nome.slice(0, letras)}
                  </div>
                </div>
              </div>
            </foreignObject>
            <line
              x1={labelX}
              y1={labelY + 44}
              x2={labelX + 380 * rampa(p, 0.1, 0.9)}
              y2={labelY + 44}
              stroke={foco > 0.3 ? COR.amarelo : COR.terracota}
              strokeWidth={5}
            />
          </g>
        );
      })}
    </svg>
  );
};
