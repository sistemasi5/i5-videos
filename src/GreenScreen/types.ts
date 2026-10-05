export type Palavra = {
  texto: string;
  /** segundos desde o inicio do video */
  inicio: number;
  fim: number;
};

export type Cta = {
  linha1: string;
  linha2: string;
  /** segundos; se omitido, entra nos ultimos 6 segundos */
  inicio?: number;
};

export type GreenScreenProps = {
  /** Video de fundo (gravacao de tela, noticia...). Arquivo em public/. */
  fundoSrc: string;
  /** Pasta em public/ com o apresentador recortado: um WebP com transparencia por
   *  quadro (00001.webp, 00002.webp...), gerada por scripts/recortar.py. */
  apresentadorQuadros: string;
  /** Video original do apresentador, so para o audio. Arquivo em public/. */
  audioSrc: string;
  duracaoSegundos: number;
  /** Duracao do video de fundo, para repetir (loop) se for mais curto que a fala. */
  fundoDuracaoSegundos: number;
  /** Largura do apresentador como fracao da largura do video (0-1). */
  apresentadorLargura: number;
  /** Distancia da base do apresentador ate a borda de baixo, em px. */
  apresentadorBase: number;
  palavras: Palavra[];
  /** Altura do centro da legenda, em px contados do topo do video. */
  legendaY: number;
  cta: Cta | null;
  logoSrc: string;
  corDestaque: string;
  /** Desenha as margens da area segura do Reels (so para conferir). */
  mostrarGuias: boolean;
};
