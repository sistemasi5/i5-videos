export type Plano = {
  /** caminho dentro de public/, ex: "tour-temple/cinema-01-fachada.mp4" */
  src: string;
  /** segundo do clipe de origem onde este plano começa */
  inicio: number;
  /** duração do plano, em segundos */
  dur: number;
  /** 1 = quadro inteiro; >1 = reenquadrado (zoom) */
  zoom: number;
  /** deslocamento horizontal/vertical do reenquadramento, em px (na tela 1080x1920) */
  dx: number;
  dy: number;
  /** entra com whip (deslize rápido + borrão de ~0.3s somado com a saída do plano anterior) */
  whipIn?: boolean;
};

export type TourImovelProps = {
  planos: Plano[];
  /** título grande sobre a fachada, ex: "FLÓRIDA — WINTER PARK" */
  titulo: string;
  /** chip de localização abaixo do título; "" esconde */
  chip: string;
  /** por quantos segundos o título fica na tela */
  segundosTitulo: number;
  /** caminho do PNG da logo dentro de public/; "" = sem card final */
  logoSrc: string;
  /** duração do card final com a logo (só vale com logoSrc) */
  segundosLogo: number;
};
