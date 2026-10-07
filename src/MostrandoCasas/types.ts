export type Cartao = {
  /** linha pequena em itálico acima do destaque (ex.: "valor inicial"); opcional */
  rotulo?: string;
  /** texto grande dourado (ex.: "$8,500"); \n quebra linha */
  destaque: string;
  /** segundo em que o cartão entra; se omitido, os cartões dividem o tempo por igual */
  entra?: number;
  /** segundo em que o cartão sai; se omitido, vai até o próximo cartão */
  sai?: number;
};

export type Abertura = {
  /** linha pequena de cima (ex.: "olha essa") */
  linhaTopo?: string;
  /** palavra grande dourada (ex.: "oportunidade") */
  destaque: string;
  /** linha pequena de baixo (ex.: "que está indo a leilão") */
  linhaBase?: string;
  /** local, com ícone de pin (ex.: "PENNSYLVANIA") */
  local?: string;
  /** segundo em que a abertura sai (padrão: 5) */
  sai?: number;
};

export type Legenda = {
  texto: string;
  /** segundos, contados do começo do vídeo */
  inicio: number;
  fim: number;
};

export type CasasProps = {
  /** Clipe do tour pelo imóvel (vertical). Arquivo em public/. */
  fundoSrc: string;
  /** Segundo do clipe em que o vídeo começa. */
  fundoInicio: number;
  /** Duração do vídeo todo, incluindo a tela final da logo. */
  duracaoSegundos: number;
  /** true: mantém o som do tour (quando alguém fala nele). Padrão: sem som. */
  comAudio: boolean;
  /** Legendas da fala (grupos de 2-3 palavras), geradas por scripts/gerar_casas.py --falado. */
  legendas: Legenda[];
  /** Posição do topo da legenda, em px (vídeo de 1920 px de altura). */
  legendaTopo: number;
  abertura?: Abertura;
  cartoes: Cartao[];
  /** Quanto tempo dura a tela final preta com a logo (0 = sem tela final). */
  telaFinalSegundos: number;
  logoSrc: string;
  /** Cor de fundo da tela final (padrão preto; a Atlas usa o verde da logo). */
  corTelaFinal: string;
  /** Cor do texto destaque (padrão: dourado do reel de referência). */
  corDestaque: string;
  /** Posição do topo do cartão, em px (vídeo de 1920 px de altura). */
  cartaoTopo: number;
  /** Escurece levemente o fundo (0 a 1). */
  escurecer: number;
  /** Pinta a zona coberta pelo app do Reels (só para conferir). */
  mostrarGuias: boolean;
};
