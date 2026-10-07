import type { Legenda } from "../MostrandoCasas/types";

export type Selo = {
  /** palavra curta em caixa vermelha (ex.: "AULA") */
  texto: string;
  /** segundo em que entra */
  entra: number;
  /** segundo em que sai; se omitido, fica até o fim */
  sai?: number;
};

export type CaixinhaProps = {
  /** Vídeo de quem responde (vertical, com a fala). Arquivo em public/. */
  fundoSrc: string;
  fundoInicio: number;
  duracaoSegundos: number;
  /** Pergunta que aparece na caixinha, fixa durante o vídeo todo. */
  pergunta: string;
  /** Título da caixinha (padrão: "Faça uma pergunta", como no Instagram). */
  tituloCaixa: string;
  /** true: mantém o som do vídeo (padrão, porque a pessoa está respondendo falando). */
  comAudio: boolean;
  legendas: Legenda[];
  selos: Selo[];
  /** Topo da caixinha, em px (vídeo de 1920 px de altura). */
  caixaTopo: number;
  /** Topo da legenda, em px. */
  legendaTopo: number;
  /** Tamanho da letra da legenda, em px (vídeo de 1080 px de largura). */
  tamanhoLegenda: number;
  escurecer: number;
  mostrarGuias: boolean;
};
