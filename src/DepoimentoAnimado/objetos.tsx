import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { poppins } from "../MostrandoCasas/CartaoInfo";
import { COR } from "./Bonequinho";

/** 0→1 com mola, começando no segundo `em` (contado do início da cena). */
export const useAparece = (em: number, amortecimento = 12) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - Math.round(em * fps), fps, config: { damping: amortecimento, mass: 0.7 } });
};

/** 0→1 linear entre dois segundos da cena. */
export const useProgresso = (de: number, ate: number) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return interpolate(frame / fps, [de, ate], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
};

/** Envolve um elemento SVG para ele "pular" para dentro (escala de 0 a 1) a partir do ponto (x, y). */
export const Pop: React.FC<{ x: number; y: number; t: number; children: React.ReactNode }> = ({ x, y, t, children }) => {
  if (t <= 0.001) return null;
  return (
    <g transform={`translate(${x} ${y}) scale(${t}) translate(${-x} ${-y})`} opacity={Math.min(1, t * 1.5)}>
      {children}
    </g>
  );
};

const T: React.FC<{
  x: number;
  y: number;
  tam: number;
  cor?: string;
  peso?: number;
  ancora?: "start" | "middle" | "end";
  children: React.ReactNode;
}> = ({ x, y, tam, cor = COR.preto, peso = 800, ancora = "middle", children }) => (
  <text x={x} y={y} textAnchor={ancora} fontFamily={poppins} fontWeight={peso} fontSize={tam} fill={cor}>
    {children}
  </text>
);
export { T as Texto };

/** Etiqueta arredondada com texto (ex.: "NEGÓCIO RUIM"). Centro em (x, y). */
export const Rotulo: React.FC<{ x: number; y: number; texto: string; fundo?: string; cor?: string; tam?: number; giro?: number }> = ({
  x,
  y,
  texto,
  fundo = COR.preto,
  cor = COR.branco,
  tam = 40,
  giro = 0,
}) => {
  const w = texto.length * tam * 0.66 + tam * 1.4;
  const h = tam * 1.8;
  return (
    <g transform={`rotate(${giro} ${x} ${y})`}>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={h / 2.4} fill={fundo} stroke={COR.preto} strokeWidth={5} />
      <T x={x} y={y + tam * 0.36} tam={tam} cor={cor}>
        {texto}
      </T>
    </g>
  );
};

/** Casa simples. (x, y) = canto de baixo à esquerda; w = largura. */
export const Casa: React.FC<{ x: number; y: number; w: number; telhado?: string; parede?: string; rachada?: boolean }> = ({
  x,
  y,
  w,
  telhado = COR.laranja,
  parede = COR.branco,
  rachada,
}) => {
  const h = w * 0.62;
  const th = w * 0.42;
  return (
    <g strokeLinejoin="round">
      <rect x={x + w * 0.66} y={y - h - th * 0.75} width={w * 0.1} height={th * 0.5} fill={COR.preto} />
      <rect x={x} y={y - h} width={w} height={h} fill={parede} stroke={COR.preto} strokeWidth={8} />
      <path d={`M ${x - w * 0.08} ${y - h + 4} L ${x + w / 2} ${y - h - th} L ${x + w * 1.08} ${y - h + 4} Z`} fill={telhado} stroke={COR.preto} strokeWidth={8} />
      <rect x={x + w * 0.4} y={y - h * 0.58} width={w * 0.2} height={h * 0.58} fill={COR.preto} />
      <rect x={x + w * 0.1} y={y - h * 0.72} width={w * 0.2} height={w * 0.16} fill="#BFE3F2" stroke={COR.preto} strokeWidth={6} />
      <rect x={x + w * 0.7} y={y - h * 0.72} width={w * 0.2} height={w * 0.16} fill="#BFE3F2" stroke={COR.preto} strokeWidth={6} />
      {rachada ? (
        <path
          d={`M ${x + w * 0.3} ${y - h} L ${x + w * 0.36} ${y - h * 0.8} L ${x + w * 0.28} ${y - h * 0.62} L ${x + w * 0.35} ${y - h * 0.4}`}
          stroke={COR.preto}
          strokeWidth={5}
          fill="none"
        />
      ) : null}
    </g>
  );
};

/** Prédio da Traction com placa. (x, y) = canto de baixo à esquerda. */
export const Predio: React.FC<{ x: number; y: number; w: number; h: number; placa: string; porta: number }> = ({ x, y, w, h, placa, porta }) => (
  <g>
    <rect x={x} y={y - h} width={w} height={h} fill={COR.preto} rx={10} />
    {[0, 1, 2].map((l) =>
      [0, 1, 2].map((c) => (
        <rect key={`${l}-${c}`} x={x + 30 + c * ((w - 60) / 3)} y={y - h + 120 + l * 80} width={(w - 60) / 3 - 22} height={50} rx={6} fill="#2E2E2E" />
      )),
    )}
    <rect x={x + 20} y={y - h + 26} width={w - 40} height={70} rx={14} fill={COR.laranja} />
    <T x={x + w / 2} y={y - h + 74} tam={40} cor={COR.branco}>
      {placa}
    </T>
    {/* porta abrindo */}
    <rect x={x + w / 2 - 60} y={y - 170} width={120} height={170} fill="#FFE2B8" />
    <rect x={x + w / 2 - 60} y={y - 170} width={120 * (1 - porta * 0.8)} height={170} fill={COR.laranja} stroke={COR.preto} strokeWidth={5} />
  </g>
);

/** Folhinha de calendário. Centro em (x, y). */
export const Calendario: React.FC<{ x: number; y: number; texto: string }> = ({ x, y, texto }) => (
  <g>
    <rect x={x - 95} y={y - 90} width={190} height={180} rx={18} fill={COR.branco} stroke={COR.preto} strokeWidth={7} />
    <rect x={x - 95} y={y - 90} width={190} height={56} rx={18} fill={COR.laranja} stroke={COR.preto} strokeWidth={7} />
    <circle cx={x - 45} cy={y - 92} r={9} fill={COR.preto} />
    <circle cx={x + 45} cy={y - 92} r={9} fill={COR.preto} />
    <T x={x} y={y + 50} tam={52}>
      {texto}
    </T>
  </g>
);

/** Relógio com ponteiro girando. Centro em (x, y). */
export const Relogio: React.FC<{ x: number; y: number; r: number; giro: number; texto?: string }> = ({ x, y, r, giro, texto }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={COR.branco} stroke={COR.preto} strokeWidth={8} />
    {Array.from({ length: 12 }).map((_, i) => {
      const a = (i * Math.PI) / 6;
      return <line key={i} x1={x + Math.sin(a) * r * 0.78} y1={y - Math.cos(a) * r * 0.78} x2={x + Math.sin(a) * r * 0.9} y2={y - Math.cos(a) * r * 0.9} stroke={COR.preto} strokeWidth={5} strokeLinecap="round" />;
    })}
    <line x1={x} y1={y} x2={x + Math.sin((giro * Math.PI) / 180) * r * 0.7} y2={y - Math.cos((giro * Math.PI) / 180) * r * 0.7} stroke={COR.laranja} strokeWidth={9} strokeLinecap="round" />
    <line x1={x} y1={y} x2={x + Math.sin((giro * Math.PI) / 2160) * r * 0.45} y2={y - Math.cos((giro * Math.PI) / 2160) * r * 0.45} stroke={COR.preto} strokeWidth={10} strokeLinecap="round" />
    <circle cx={x} cy={y} r={9} fill={COR.preto} />
    {texto ? (
      <T x={x} y={y + r + 56} tam={42}>
        {texto}
      </T>
    ) : null}
  </g>
);

/** Balão de fala. (x, y) = canto de cima à esquerda; ponta aponta para (px, py). */
export const Balao: React.FC<{ x: number; y: number; w: number; h: number; px: number; py: number; children: React.ReactNode; fundo?: string }> = ({
  x,
  y,
  w,
  h,
  px,
  py,
  children,
  fundo = COR.branco,
}) => {
  const bx = Math.max(x + 50, Math.min(x + w - 90, px - 20));
  return (
    <g>
      <path d={`M ${bx} ${y + h - 4} L ${px} ${py} L ${bx + 60} ${y + h - 4} Z`} fill={fundo} stroke={COR.preto} strokeWidth={7} strokeLinejoin="round" />
      <rect x={x} y={y} width={w} height={h} rx={36} fill={fundo} stroke={COR.preto} strokeWidth={7} />
      <rect x={bx + 4} y={y + h - 12} width={52} height={14} fill={fundo} />
      {children}
    </g>
  );
};

/** Balão de pensamento (nuvem com bolinhas). Centro em (x, y). */
export const Pensamento: React.FC<{ x: number; y: number; r: number; px: number; py: number; children: React.ReactNode }> = ({ x, y, r, px, py, children }) => (
  <g>
    <circle cx={px} cy={py} r={9} fill={COR.branco} stroke={COR.preto} strokeWidth={5} />
    <circle cx={(px * 2 + x) / 3} cy={(py * 2 + y + r) / 3} r={15} fill={COR.branco} stroke={COR.preto} strokeWidth={5} />
    {[-0.7, -0.25, 0.25, 0.7].map((d, i) => (
      <circle key={i} cx={x + d * r} cy={y - (i % 2 ? r * 0.35 : r * 0.1)} r={r * 0.48} fill={COR.branco} stroke={COR.preto} strokeWidth={6} />
    ))}
    <ellipse cx={x} cy={y + r * 0.1} rx={r * 1.05} ry={r * 0.55} fill={COR.branco} stroke={COR.preto} strokeWidth={6} />
    <ellipse cx={x} cy={y - r * 0.05} rx={r * 1.0} ry={r * 0.5} fill={COR.branco} />
    {[-0.7, -0.25, 0.25, 0.7].map((d, i) => (
      <circle key={`c${i}`} cx={x + d * r} cy={y - (i % 2 ? r * 0.35 : r * 0.1)} r={r * 0.48 - 3} fill={COR.branco} />
    ))}
    {children}
  </g>
);

/** Notebook visto de frente. (x, y) = centro da base. */
export const Notebook: React.FC<{ x: number; y: number; w: number; children?: React.ReactNode }> = ({ x, y, w, children }) => {
  const h = w * 0.62;
  return (
    <g>
      <rect x={x - w / 2} y={y - h - 14} width={w} height={h} rx={16} fill={COR.preto} />
      <rect x={x - w / 2 + 16} y={y - h + 2} width={w - 32} height={h - 32} rx={6} fill={COR.branco} />
      <g>{children}</g>
      <path d={`M ${x - w / 2 - 40} ${y - 14} L ${x + w / 2 + 40} ${y - 14} L ${x + w / 2 + 20} ${y + 6} L ${x - w / 2 - 20} ${y + 6} Z`} fill="#3A3A3A" />
    </g>
  );
};

/** Card de anúncio de casa (miniatura dentro de uma tela). (x, y) = canto de cima à esquerda. */
export const CardCasa: React.FC<{ x: number; y: number; w: number; preco: string; destaque?: boolean }> = ({ x, y, w, preco, destaque }) => (
  <g>
    <rect x={x} y={y} width={w} height={w * 0.42} rx={10} fill={destaque ? "#FFF0E6" : "#F3F3F3"} stroke={destaque ? COR.laranja : "#CFCFCF"} strokeWidth={4} />
    <g transform={`translate(${x + 14} ${y + w * 0.36}) scale(${(w * 0.3) / 200})`}>
      <Casa x={0} y={0} w={200} />
    </g>
    <T x={x + w * 0.42} y={y + w * 0.17} tam={w * 0.09} ancora="start">
      {preco}
    </T>
    <rect x={x + w * 0.42} y={y + w * 0.23} width={w * 0.45} height={w * 0.035} rx={4} fill="#CFCFCF" />
    <rect x={x + w * 0.42} y={y + w * 0.3} width={w * 0.3} height={w * 0.035} rx={4} fill="#CFCFCF" />
  </g>
);

/** Envelope com a palavra OFERTA. Centro em (x, y). */
export const Envelope: React.FC<{ x: number; y: number; giro?: number; texto?: string }> = ({ x, y, giro = 0, texto = "OFERTA" }) => (
  <g transform={`rotate(${giro} ${x} ${y})`}>
    <rect x={x - 90} y={y - 58} width={180} height={116} rx={10} fill={COR.branco} stroke={COR.preto} strokeWidth={6} />
    <path d={`M ${x - 90} ${y - 58} L ${x} ${y + 6} L ${x + 90} ${y - 58}`} fill="none" stroke={COR.preto} strokeWidth={6} strokeLinejoin="round" />
    <rect x={x - 62} y={y + 18} width={124} height={32} rx={8} fill={COR.laranja} />
    <T x={x} y={y + 44} tam={24} cor={COR.branco}>
      {texto}
    </T>
  </g>
);

/** Folha de contrato. Centro em (x, y). */
export const Contrato: React.FC<{ x: number; y: number; w: number; titulo: string; assinatura: number }> = ({ x, y, w, titulo, assinatura }) => {
  const h = w * 1.3;
  return (
    <g>
      <rect x={x - w / 2} y={y - h / 2} width={w} height={h} rx={10} fill={COR.branco} stroke={COR.preto} strokeWidth={7} />
      <T x={x} y={y - h / 2 + 62} tam={w * 0.13}>
        {titulo}
      </T>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x - w / 2 + 34} y={y - h / 2 + 100 + i * 34} width={w - 68 - (i % 2) * 50} height={12} rx={6} fill="#D6D6D6" />
      ))}
      <line x1={x - w / 2 + 34} y1={y + h / 2 - 50} x2={x + w / 2 - 34} y2={y + h / 2 - 50} stroke={COR.preto} strokeWidth={4} />
      <path
        d={`M ${x - w / 2 + 44} ${y + h / 2 - 62} q 20 -40 40 0 t 40 0 t 40 -10 t 40 6`}
        fill="none"
        stroke="#1F4FD1"
        strokeWidth={6}
        strokeLinecap="round"
        strokeDasharray={260}
        strokeDashoffset={260 * (1 - assinatura)}
      />
    </g>
  );
};

/** Carimbo inclinado (ex.: "SOB CONTRATO"). Centro em (x, y). */
export const Carimbo: React.FC<{ x: number; y: number; texto: string; cor?: string; tam?: number; giro?: number }> = ({
  x,
  y,
  texto,
  cor = COR.laranja,
  tam = 44,
  giro = -12,
}) => {
  const w = texto.length * tam * 0.66 + tam;
  return (
    <g transform={`rotate(${giro} ${x} ${y})`}>
      <rect x={x - w / 2} y={y - tam} width={w} height={tam * 2} rx={12} fill="rgba(255,255,255,0.92)" stroke={cor} strokeWidth={8} />
      <T x={x} y={y + tam * 0.36} tam={tam} cor={cor}>
        {texto}
      </T>
    </g>
  );
};

/** Cadeado; `abre` de 0 (fechado) a 1 (aberto e a alça voando). Centro do corpo em (x, y). */
export const Cadeado: React.FC<{ x: number; y: number; abre: number; tremor: number; texto: string }> = ({ x, y, abre, tremor, texto }) => {
  const dx = Math.sin(tremor * 60) * 10 * (abre < 0.05 ? tremor : 0);
  const alca = abre * 70;
  return (
    <g transform={`translate(${dx} 0)`}>
      <path
        d={`M ${x - 70} ${y - 60 - alca} L ${x - 70} ${y - 130 - alca} A 70 70 0 0 1 ${x + 70} ${y - 130 - alca} L ${x + 70} ${y - 60 - alca * 0.2}`}
        fill="none"
        stroke={COR.cinza}
        strokeWidth={26}
        strokeLinecap="round"
        transform={`rotate(${abre * 28} ${x + 70} ${y - 60})`}
      />
      <rect x={x - 120} y={y - 70} width={240} height={190} rx={28} fill={COR.preto} />
      <circle cx={x} cy={y + 10} r={18} fill={COR.fundo} />
      <rect x={x - 7} y={y + 10} width={14} height={44} rx={6} fill={COR.fundo} />
      <T x={x} y={y + 102} tam={28} cor={COR.laranja}>
        {texto}
      </T>
    </g>
  );
};

/** Capelo de formatura. (x, y) = centro do topo. */
export const Capelo: React.FC<{ x: number; y: number; w: number }> = ({ x, y, w }) => (
  <g>
    <rect x={x - w * 0.28} y={y} width={w * 0.56} height={w * 0.22} fill={COR.preto} />
    <path d={`M ${x - w / 2} ${y} L ${x} ${y - w * 0.22} L ${x + w / 2} ${y} L ${x} ${y + w * 0.2} Z`} fill={COR.preto} />
    <path d={`M ${x} ${y} L ${x + w * 0.42} ${y + w * 0.06} L ${x + w * 0.42} ${y + w * 0.3}`} stroke={COR.laranja} strokeWidth={6} fill="none" />
    <circle cx={x + w * 0.42} cy={y + w * 0.32} r={8} fill={COR.laranja} />
  </g>
);

/** Pilha de livros. (x, y) = centro da base. */
export const Livros: React.FC<{ x: number; y: number }> = ({ x, y }) => (
  <g>
    {[
      { c: COR.laranja, w: 200, d: 0 },
      { c: COR.preto, w: 180, d: 14 },
      { c: "#F2B48F", w: 190, d: -8 },
    ].map((l, i) => (
      <g key={i}>
        <rect x={x - l.w / 2 + l.d} y={y - 46 * (i + 1)} width={l.w} height={44} rx={6} fill={l.c} stroke={COR.preto} strokeWidth={5} />
        <rect x={x - l.w / 2 + l.d + 14} y={y - 46 * (i + 1) + 16} width={l.w - 28} height={8} rx={4} fill="rgba(255,255,255,0.6)" />
      </g>
    ))}
  </g>
);

/** X vermelho grande. Centro em (x, y). */
export const Xis: React.FC<{ x: number; y: number; r: number }> = ({ x, y, r }) => (
  <g stroke={COR.vermelho} strokeWidth={r * 0.28} strokeLinecap="round">
    <line x1={x - r} y1={y - r} x2={x + r} y2={y + r} />
    <line x1={x + r} y1={y - r} x2={x - r} y2={y + r} />
  </g>
);

/** Círculo com check. Centro em (x, y). */
export const Check: React.FC<{ x: number; y: number; r: number; t: number }> = ({ x, y, r, t }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={COR.verde} stroke={COR.preto} strokeWidth={7} />
    <path
      d={`M ${x - r * 0.45} ${y + r * 0.02} L ${x - r * 0.1} ${y + r * 0.36} L ${x + r * 0.5} ${y - r * 0.3}`}
      fill="none"
      stroke={COR.branco}
      strokeWidth={r * 0.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={r * 2}
      strokeDashoffset={r * 2 * (1 - t)}
    />
  </g>
);

/** Moeda com cifrão. Centro em (x, y). */
export const Moeda: React.FC<{ x: number; y: number; r?: number }> = ({ x, y, r = 34 }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill="#F7C548" stroke={COR.preto} strokeWidth={5} />
    <T x={x} y={y + r * 0.42} tam={r * 1.2} cor={COR.preto}>
      $
    </T>
  </g>
);

/** Estrela de "explosão" de quadrinho. Centro em (x, y). */
export const Explosao: React.FC<{ x: number; y: number; r: number; fundo?: string }> = ({ x, y, r, fundo = "#FFD23F" }) => {
  const pts = Array.from({ length: 24 }).map((_, i) => {
    const a = (i * Math.PI) / 12;
    const rr = i % 2 ? r * 0.72 : r;
    return `${x + Math.cos(a) * rr * 1.5},${y + Math.sin(a) * rr}`;
  });
  return <polygon points={pts.join(" ")} fill={fundo} stroke={COR.preto} strokeWidth={7} strokeLinejoin="round" />;
};

/** Confete caindo. `t` em segundos desde que começou. */
export const Confete: React.FC<{ t: number; largura: number; altura: number }> = ({ t, largura, altura }) => {
  if (t <= 0) return null;
  const cores = [COR.laranja, COR.preto, "#F7C548", COR.verde, "#F2B48F"];
  return (
    <g>
      {Array.from({ length: 46 }).map((_, i) => {
        const sx = ((i * 137) % largura) + 10;
        const vel = 260 + ((i * 53) % 220);
        const y = -40 + t * vel - ((i * 71) % 300);
        const x = sx + Math.sin(t * 3 + i) * 30;
        if (y < -40 || y > altura) return null;
        return <rect key={i} x={x} y={y} width={16} height={26} rx={3} fill={cores[i % cores.length]} transform={`rotate(${t * 200 + i * 40} ${x + 8} ${y + 13})`} />;
      })}
    </g>
  );
};
