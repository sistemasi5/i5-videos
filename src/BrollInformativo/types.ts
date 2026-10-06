export type CorBloco = "branco" | "preto" | "vermelho";

export type Bloco = {
  texto: string;
  /** branco: caixa branca, texto preto · preto: caixa preta, texto branco ·
   *  vermelho: caixa vermelha, texto branco em negrito */
  cor: CorBloco;
  /** segundo em que o bloco entra; se omitido, aparece desde o primeiro quadro */
  entra?: number;
  /** "serifa" usa a fonte com serifa do reel de referencia (padrao: "sans") */
  fonte?: "sans" | "serifa";
};

export type BrollProps = {
  /** Clipe de fundo (B-roll vertical). Arquivo em public/. */
  fundoSrc: string;
  /** Segundo do clipe em que o video comeca (para cortar o inicio). */
  fundoInicio: number;
  duracaoSegundos: number;
  blocos: Bloco[];
  /** Inicio e fim, em px do topo, da area onde os blocos ficam empilhados
   *  (centralizados na vertical dentro dela). */
  areaTopo: number;
  areaBase: number;
  /** Tamanho da letra, em px (video de 1080 px de largura). */
  tamanhoFonte: number;
  /** Escurece levemente o fundo para o texto ler melhor (0 a 1). */
  escurecer: number;
  /** Desenha as margens da area segura do Reels (so para conferir). */
  mostrarGuias: boolean;
};
