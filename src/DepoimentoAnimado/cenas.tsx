import { interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Bonequinho, COR, POSES, misturar, poseAndando, type Pose } from "./Bonequinho";
import {
  Balao,
  Cadeado,
  Calendario,
  Capelo,
  CardCasa,
  Carimbo,
  Casa,
  Check,
  Confete,
  Contrato,
  Envelope,
  Explosao,
  Livros,
  Moeda,
  Notebook,
  Pensamento,
  Pop,
  Predio,
  Relogio,
  Rotulo,
  Texto,
  Xis,
  useAparece,
  useProgresso,
} from "./objetos";
import type { Cena, TipoCena } from "./types";

/** Palco: SVG de 1080 × 920; o chão fica em y = 820. */
export const PALCO = { largura: 1080, altura: 920, chao: 820 };
const CHAO = PALCO.chao;

export type CenaProps = {
  cena: Cena;
  /** abertura da boca (0 a 1) de quem está falando agora */
  bocaDepoente: number;
  bocaMentor: number;
  nomeDepoente: string;
  nomeMentor: string;
};

const useTempo = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return { frame, t: frame / fps, fps };
};

/** Momento-chave da cena (segundos). Se o roteiro não trouxe, usa uma fração da duração. */
const mom = (cena: Cena, chave: string, fracao: number) => cena.momentos[chave] ?? (cena.fim - cena.inicio) * fracao;
const txt = (cena: Cena, chave: string, padrao: string) => cena.textos[chave] ?? padrao;

/** Troca suave de pose a partir do segundo `em`. */
const usePoseTroca = (de: Pose, para: Pose, em: number, dur = 0.35) => misturar(de, para, useProgresso(em, em + dur));

// ---------------------------------------------------------------- 1. chegada
const Chegada: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente }) => {
  const { frame, t } = useTempo();
  const chegou = 1.8;
  const x = interpolate(t, [0, chegou], [-120, 440], { extrapolateRight: "clamp" });
  const andando = t < chegou;
  const aceno = Math.sin(frame / 4) * 22;
  const pose = andando
    ? poseAndando(frame)
    : misturar(POSES.neutro, { ...POSES.acenando, bracoD: [125, 165 + aceno] }, (t - chegou) / 0.3);
  const cal = useAparece(mom(cena, "mes", 0.45));
  return (
    <g>
      <Predio x={650} y={CHAO} w={330} h={620} placa={txt(cena, "lugar", "TRACTION")} porta={useProgresso(0.6, 1.4)} />
      <Bonequinho x={x} y={CHAO} pose={pose} expressao="feliz" boca={bocaDepoente} nome={nomeDepoente} pulo={andando ? Math.abs(Math.sin(frame / 3.2)) * 8 : 0} />
      <Pop x={200} y={210} t={cal}>
        <Calendario x={200} y={210} texto={txt(cena, "tempo", "1 MÊS")} />
      </Pop>
    </g>
  );
};

// ---------------------------------------------------------------- 2. negócio ruim → aprender
const NegocioRuim: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente }) => {
  const { t } = useTempo();
  const ruim = mom(cena, "ruim", 0.3);
  const aprender = mom(cena, "aprender", 0.75);
  const pRuim = useAparece(ruim);
  const pAprender = useAparece(aprender);
  const capeloY = interpolate(useProgresso(aprender, aprender + 0.45), [0, 1], [80, 398]);
  const feliz = t >= aprender;
  const pose = usePoseTroca(POSES.triste, POSES.comemorando, aprender);
  return (
    <g>
      <Casa x={80} y={CHAO} w={330} telhado="#8E8E8E" parede="#E2E2E2" rachada />
      <Pop x={245} y={200} t={pRuim}>
        <polyline points="130,120 200,170 250,140 330,250" fill="none" stroke={COR.vermelho} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" />
        <polygon points="350,275 300,250 340,225" fill={COR.vermelho} />
        <Rotulo x={245} y={330} texto={txt(cena, "antes", "NEGÓCIO RUIM")} fundo={COR.vermelho} tam={36} giro={-4} />
      </Pop>
      <Bonequinho
        x={720}
        y={CHAO}
        pose={pose}
        expressao={feliz ? "sorrisao" : "triste"}
        boca={bocaDepoente}
        cabeca={feliz ? 0 : 8}
        nome={nomeDepoente}
        pulo={feliz ? pAprender * 14 : 0}
      />
      {t >= aprender ? <Capelo x={720} y={capeloY - pAprender * 14} w={150} /> : null}
      <Pop x={720} y={170} t={pAprender}>
        <Rotulo x={720} y={170} texto={txt(cena, "depois", "APRENDER")} fundo={COR.laranja} tam={44} giro={3} />
      </Pop>
      <Pop x={960} y={CHAO} t={pAprender}>
        <Livros x={960} y={CHAO} />
      </Pop>
    </g>
  );
};

// ---------------------------------------------------------------- 3. aula de 1 hora, 5 minutos valem
const Aula: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente, nomeMentor }) => {
  const { frame, t } = useTempo();
  const dur = cena.fim - cena.inicio;
  const cinco = mom(cena, "cinco", 0.7);
  const pCinco = useAparece(cinco);
  const barra = interpolate(t, [0, dur], [0.05, 0.95], { extrapolateRight: "clamp" });
  const pulso = t >= cinco ? 1 + Math.sin(frame / 4) * 0.05 : 1;
  const bocaProf = Math.abs(Math.sin(frame / 3)) * 0.6;
  return (
    <g>
      {/* tela da aula */}
      <rect x={130} y={30} width={820} height={470} rx={26} fill={COR.preto} />
      <rect x={154} y={54} width={772} height={380} rx={12} fill={COR.creme} />
      <rect x={480} y={84} width={420} height={260} rx={10} fill={COR.branco} stroke={COR.preto} strokeWidth={5} />
      <polyline points="510,310 590,260 650,285 740,190 860,130" fill="none" stroke={COR.laranja} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points="880,118 846,124 866,150" fill={COR.laranja} />
      <Bonequinho x={320} y={420} escala={0.5} pose={POSES.apontando} expressao="feliz" boca={bocaProf} corCamisa={COR.preto} cabelo="topete" nome={nomeMentor} />
      {/* barra de progresso */}
      <rect x={180} y={456} width={720} height={18} rx={9} fill="#3A3A3A" />
      <rect x={180} y={456} width={720 * barra} height={18} rx={9} fill={COR.cinza} />
      <g transform={`translate(${180 + 720 * 0.58} 465) scale(${pCinco * pulso}) translate(${-(180 + 720 * 0.58)} -465)`}>
        <rect x={180 + 720 * 0.52} y={448} width={720 * 0.12} height={34} rx={12} fill={COR.laranja} stroke={COR.branco} strokeWidth={4} />
      </g>
      <Pop x={520} y={548} t={pCinco}>
        <Rotulo x={520} y={548} texto={txt(cena, "destaque", "5 MIN QUE VALEM OURO")} fundo={COR.laranja} tam={38} />
      </Pop>
      <Bonequinho x={190} y={CHAO} escala={0.62} pose={t >= cinco ? POSES.surpreso : POSES.neutro} expressao={t >= cinco ? "surpreso" : "neutro"} boca={bocaDepoente} nome={nomeDepoente} olhar={0.6} />
      <Relogio x={900} y={690} r={70} giro={t * 300} texto={txt(cena, "total", "1h de aula")} />
    </g>
  );
};

// ---------------------------------------------------------------- 4. olha as casas e os números não batem
const Problema: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente }) => {
  const { t } = useTempo();
  const batem = mom(cena, "batem", 0.8);
  const duvida = mom(cena, "casas", 0.35);
  const pBatem = useAparece(batem);
  const pDuvida = useAparece(duvida);
  const scroll = t * 90;
  const precos = ["$389k", "$455k", "$412k", "$298k", "$365k", "$520k", "$441k"];
  const pose = usePoseTroca(POSES.apontandoEsq, POSES.pensando, batem);
  return (
    <g>
      <defs>
        <clipPath id="tela-notebook">
          <rect x={146} y={372} width={408} height={226} />
        </clipPath>
      </defs>
      <rect x={40} y={636} width={620} height={24} rx={6} fill="#7A4E33" />
      <rect x={70} y={660} width={20} height={CHAO - 660} fill="#7A4E33" />
      <rect x={610} y={660} width={20} height={CHAO - 660} fill="#7A4E33" />
      <Notebook x={350} y={636} w={440}>
        <g clipPath="url(#tela-notebook)">
          {precos.map((p, i) => (
            <CardCasa key={i} x={166} y={384 + i * 172 - (scroll % (172 * 4))} w={368} preco={p} />
          ))}
        </g>
      </Notebook>
      <Pop x={350} y={490} t={pBatem}>
        <Xis x={350} y={490} r={80} />
      </Pop>
      <Bonequinho x={840} y={CHAO} pose={pose} expressao={t >= batem ? "triste" : "neutro"} boca={bocaDepoente} nome={nomeDepoente} olhar={-1} />
      <Pop x={820} y={190} t={pDuvida}>
        <Pensamento x={820} y={180} r={96} px={800} py={400}>
          <Texto x={820} y={212} tam={86} cor={t >= batem ? COR.vermelho : COR.preto}>
            {t >= batem ? "$ ≠ $" : "$ ?"}
          </Texto>
        </Pensamento>
      </Pop>
      <Pop x={330} y={150} t={pBatem}>
        <Rotulo x={330} y={150} texto={txt(cena, "erro", "OS NÚMEROS NÃO BATEM")} fundo={COR.vermelho} tam={34} giro={-3} />
      </Pop>
    </g>
  );
};

// ---------------------------------------------------------------- 5. conselho do mentor
const Conselho: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente, nomeMentor }) => {
  const { t } = useTempo();
  const mandar = mom(cena, "mandar", 0.3);
  const oferta = mom(cena, "oferta", 0.6);
  const pBalao = useAparece(0.15);
  const linhas = txt(cena, "fala", "Faz o cálculo|e manda oferta!").split("|");
  const total = linhas.join("").length;
  const letras = Math.floor(interpolate(t, [0.25, Math.max(0.6, oferta)], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  let resto = letras;
  return (
    <g>
      <Pop x={330} y={330} t={pBalao}>
        <Balao x={80} y={40} w={920} h={250} px={290} py={400}>
          {linhas.map((l, i) => {
            const vis = l.slice(0, Math.max(0, resto));
            resto -= l.length;
            return (
              <Texto key={i} x={540} y={140 + i * 90} tam={68} cor={i === linhas.length - 1 ? COR.laranja : COR.preto}>
                {vis}
              </Texto>
            );
          })}
        </Balao>
      </Pop>
      <Bonequinho x={270} y={CHAO} pose={POSES.apontando} expressao="feliz" boca={bocaDepoente} corCamisa={COR.preto} cabelo="topete" nome={nomeMentor} olhar={1} />
      <Bonequinho x={800} y={CHAO} pose={t >= oferta ? POSES.joinha : POSES.neutro} expressao={t >= oferta ? "sorrisao" : "neutro"} nome={nomeDepoente} olhar={-1} />
      {[0, 1, 2].map((i) => {
        const ini = mandar + 0.25 + i * 0.4;
        const p = interpolate(t, [ini, ini + 1.1], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        if (p <= 0 || p >= 1) return null;
        const ex = interpolate(p, [0, 1], [800, 1180]);
        const ey = interpolate(p, [0, 1], [600, 380 - i * 60]) - Math.sin(p * Math.PI) * 120;
        return <Envelope key={i} x={ex} y={ey} giro={p * 30 - 10} />;
      })}
    </g>
  );
};

// ---------------------------------------------------------------- 6. listada por X, fechando por Y
const Desconto: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente, nomeMentor }) => {
  const { frame, t } = useTempo();
  const listada = mom(cena, "listada", 0.4);
  const fechando = mom(cena, "fechando", 0.75);
  const caraca = mom(cena, "caraca", 0.92);
  const pLista = useAparece(listada);
  const pFecha = useAparece(fechando, 9);
  const pBadge = useAparece(fechando + 0.6);
  const pCaraca = useAparece(caraca, 8);
  const risco = useProgresso(fechando - 0.1, fechando + 0.2);
  const comemora = t >= fechando;
  const pose = usePoseTroca(POSES.neutro, POSES.comemorando, fechando);
  return (
    <g>
      <Casa x={480} y={CHAO} w={440} />
      <Rotulo x={700} y={CHAO + 50} texto={txt(cena, "casa", "CASA PRÓPRIA")} fundo={COR.preto} tam={28} />
      <Pop x={300} y={190} t={pLista}>
        <g>
          <rect x={120} y={110} width={360} height={170} rx={20} fill={COR.branco} stroke={COR.preto} strokeWidth={7} />
          <circle cx={150} cy={195} r={12} fill={COR.fundo} stroke={COR.preto} strokeWidth={5} />
          <Texto x={315} y={165} tam={32} cor={COR.cinza}>
            {txt(cena, "rotuloDe", "LISTADA POR")}
          </Texto>
          <Texto x={315} y={245} tam={70}>
            {txt(cena, "de", "$460 mil")}
          </Texto>
          <line x1={170} y1={225} x2={170 + 290 * risco} y2={225 - 40 * risco} stroke={COR.vermelho} strokeWidth={12} strokeLinecap="round" />
        </g>
      </Pop>
      <Pop x={420} y={380} t={pFecha}>
        <Carimbo x={420} y={380} texto={txt(cena, "por", "POR $320 MIL")} cor={COR.laranja} tam={40} giro={-8} />
      </Pop>
      <Pop x={840} y={150} t={pBadge}>
        <circle cx={840} cy={150} r={92} fill={COR.verde} stroke={COR.preto} strokeWidth={7} />
        <Texto x={840} y={140} tam={44} cor={COR.branco}>
          {txt(cena, "economia", "-$140k")}
        </Texto>
        <Texto x={840} y={186} tam={26} cor={COR.branco}>
          {txt(cena, "economiaRotulo", "de desconto")}
        </Texto>
      </Pop>
      <Bonequinho
        x={140}
        y={CHAO}
        pose={pose}
        expressao={comemora ? "sorrisao" : "feliz"}
        boca={bocaDepoente}
        nome={nomeDepoente}
        pulo={comemora ? Math.abs(Math.sin(frame / 4)) * 26 : 0}
      />
      <Pop x={700} y={620} t={pCaraca}>
        <Explosao x={700} y={620} r={125} />
        <Texto x={700} y={624} tam={40}>
          {txt(cena, "reacao", "CARACA, MEU!")}
        </Texto>
        <Texto x={700} y={672} tam={28} peso={400}>
          {`— ${nomeMentor}`}
        </Texto>
      </Pop>
    </g>
  );
};

// ---------------------------------------------------------------- 7. sob contrato: não acreditava até acontecer
const ContratoCena: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente }) => {
  const { frame, t } = useTempo();
  const contrato = mom(cena, "contrato", 0.3);
  const aconteceu = mom(cena, "acontecer", 0.8);
  const pFolha = useAparece(0.1);
  const pCarimbo = useAparece(contrato, 8);
  const pFinal = useAparece(aconteceu);
  const pDuvida = useAparece(0.3);
  const depois = t >= aconteceu;
  const pose = usePoseTroca(POSES.surpreso, POSES.comemorando, aconteceu);
  return (
    <g>
      <Pop x={290} y={560} t={pFolha}>
        <Contrato x={290} y={560} w={270} titulo={txt(cena, "titulo", "CONTRATO")} assinatura={useProgresso(0.4, 1.6)} />
      </Pop>
      <Pop x={290} y={600} t={pCarimbo}>
        <Carimbo x={290} y={600} texto={txt(cena, "papel", "SOB CONTRATO")} cor={COR.laranja} tam={40} giro={-14} />
      </Pop>
      <Bonequinho
        x={760}
        y={CHAO}
        pose={pose}
        expressao={depois ? "sorrisao" : "surpreso"}
        boca={bocaDepoente}
        nome={nomeDepoente}
        cabeca={depois ? 0 : Math.sin(frame / 5) * 7}
        pulo={depois ? Math.abs(Math.sin(frame / 4)) * 28 : 0}
      />
      {!depois ? (
        <Pop x={760} y={200} t={pDuvida}>
          <Pensamento x={760} y={190} r={92} px={740} py={400}>
            <Texto x={760} y={214} tam={56}>
              {txt(cena, "duvida", "SERÁ?!")}
            </Texto>
          </Pensamento>
        </Pop>
      ) : null}
      <Pop x={560} y={150} t={pFinal}>
        <Rotulo x={560} y={150} texto={txt(cena, "final", "ACONTECEU COMIGO!")} fundo={COR.laranja} tam={46} giro={-2} />
      </Pop>
      <Confete t={t - aconteceu} largura={PALCO.largura} altura={PALCO.altura} />
    </g>
  );
};

// ---------------------------------------------------------------- 8. a dica destravou e já valeu o investimento
const Valeu: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente }) => {
  const { t } = useTempo();
  const bloqueio = mom(cena, "bloqueio", 0.4);
  const valeu = mom(cena, "valeu", 0.75);
  const pRel = useAparece(0.1);
  const abre = useAparece(bloqueio + 0.5, 10);
  const pValeu = useAparece(valeu);
  const tremor = interpolate(t, [bloqueio - 0.3, bloqueio + 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const some = interpolate(t, [valeu - 0.2, valeu + 0.1], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pose = usePoseTroca(POSES.neutro, POSES.joinha, valeu);
  return (
    <g>
      <Pop x={190} y={240} t={pRel}>
        <Relogio x={190} y={240} r={84} giro={t * 120} texto={txt(cena, "dica", "5 min de dica")} />
      </Pop>
      {some > 0 ? (
        <g opacity={some}>
          <Cadeado x={480} y={600} abre={abre} tremor={t < bloqueio + 0.5 ? tremor : 0} texto={txt(cena, "bloqueio", "BLOQUEIO")} />
        </g>
      ) : null}
      <Pop x={480} y={580} t={pValeu}>
        <Check x={480} y={580} r={130} t={useProgresso(valeu + 0.1, valeu + 0.5)} />
        <Moeda x={300} y={470} />
        <Moeda x={660} y={440} r={40} />
        <Moeda x={640} y={730} r={30} />
        <Moeda x={320} y={700} r={28} />
      </Pop>
      <Pop x={600} y={130} t={pValeu}>
        <Rotulo x={600} y={130} texto={txt(cena, "valor", "JÁ VALEU O INVESTIMENTO")} fundo={COR.laranja} tam={38} />
      </Pop>
      <Bonequinho x={830} y={CHAO} pose={pose} expressao={t >= valeu ? "sorrisao" : "feliz"} boca={bocaDepoente} nome={nomeDepoente} olhar={-0.6} />
    </g>
  );
};

// ---------------------------------------------------------------- 9. convite final
const Convite: React.FC<CenaProps> = ({ cena, bocaDepoente, nomeDepoente }) => {
  const { frame } = useTempo();
  const pena = mom(cena, "pena", 0.7);
  const pSub = useAparece(0.2);
  const pFrase = useAparece(pena - 0.3, 9);
  const traco = useProgresso(pena, pena + 0.5);
  const pose = usePoseTroca(POSES.neutro, POSES.abracando, 0.3, 0.5);
  return (
    <g>
      <Pop x={540} y={110} t={pSub}>
        <Texto x={540} y={120} tam={46}>
          {txt(cena, "sub", "Quer conhecer o processo?")}
        </Texto>
      </Pop>
      <Pop x={540} y={250} t={pFrase}>
        <Texto x={540} y={262} tam={96} cor={COR.laranja}>
          {txt(cena, "frase", "Vale muito a pena!")}
        </Texto>
        <path d="M 170 300 Q 540 350 910 296" fill="none" stroke={COR.preto} strokeWidth={10} strokeLinecap="round" strokeDasharray={760} strokeDashoffset={760 * (1 - traco)} />
      </Pop>
      {[
        [170, 520],
        [920, 470],
        [240, 700],
        [870, 690],
      ].map(([sx, sy], i) => {
        const s = (0.6 + Math.abs(Math.sin(frame / 7 + i)) * 0.5) * pFrase;
        return (
          <path
            key={i}
            transform={`translate(${sx} ${sy}) scale(${s})`}
            d="M 0 -34 L 9 -9 L 34 0 L 9 9 L 0 34 L -9 9 L -34 0 L -9 -9 Z"
            fill={i % 2 ? COR.laranja : "#F7C548"}
            stroke={COR.preto}
            strokeWidth={4}
          />
        );
      })}
      <Bonequinho x={540} y={CHAO} pose={pose} expressao="sorrisao" boca={bocaDepoente} nome={nomeDepoente} pulo={Math.abs(Math.sin(frame / 6)) * 6} />
    </g>
  );
};

export const CENAS: Record<TipoCena, React.FC<CenaProps>> = {
  chegada: Chegada,
  negocio_ruim: NegocioRuim,
  aula: Aula,
  problema: Problema,
  conselho: Conselho,
  desconto: Desconto,
  contrato: ContratoCena,
  valeu: Valeu,
  convite: Convite,
};
