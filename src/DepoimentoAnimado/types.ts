/** Quem está falando num trecho do áudio. */
export type Quem = "depoente" | "mentor";

export type Palavra = {
  texto: string;
  /** segundos, contados do começo do vídeo final */
  inicio: number;
  fim: number;
  quem: Quem;
};

/** Um pedaço do áudio original que entra no vídeo. */
export type Trecho = {
  /** segundo do vídeo original em que o trecho começa */
  origem: number;
  /** duração do trecho, em segundos */
  dur: number;
  /** segundo do vídeo final em que o trecho toca */
  inicio: number;
};

export type TipoCena =
  | "chegada"
  | "negocio_ruim"
  | "aula"
  | "problema"
  | "conselho"
  | "desconto"
  | "contrato"
  | "valeu"
  | "convite";

export type Cena = {
  tipo: TipoCena;
  /** segundos no vídeo final */
  inicio: number;
  fim: number;
  /** textos que aparecem na cena (cada tipo usa os seus; todos têm padrão) */
  textos: Record<string, string>;
  /** instantes-chave, em segundos contados do início da cena (ex.: quando uma palavra é dita) */
  momentos: Record<string, number>;
};

export type DepoimentoProps = {
  /** Áudio de onde saem os trechos (arquivo em public/). */
  audioSrc: string;
  trechos: Trecho[];
  duracaoSegundos: number;
  palavras: Palavra[];
  cenas: Cena[];
  /** Nome de quem dá o depoimento (aparece no topo e no bonequinho). */
  nomeDepoente: string;
  /** Nome do mentor (aparece no bonequinho dele). */
  nomeMentor: string;
  /** Linha pequena do topo (ex.: "aluno da Traction"). */
  subtitulo: string;
  /** Tela final preta com a logo, em segundos (0 = sem tela final). */
  telaFinalSegundos: number;
  logoSrc: string;
  mostrarGuias: boolean;
};
