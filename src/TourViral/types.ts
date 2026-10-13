export type PlanoViral = {
  /** caminho dentro de public/, ex: "tour-temple/cinema-01-fachada.mp4" */
  src: string;
  /** segundo do clipe de origem onde este plano começa */
  inicio: number;
  /** duração do plano, em segundos */
  dur: number;
  /** 1 = quadro inteiro; >1 = punch-in (zoom) */
  zoom: number;
  dx: number;
  dy: number;
  /** legenda curta do cômodo; "" = sem legenda neste plano */
  legenda: string;
};

export type TourViralProps = {
  planos: PlanoViral[];
  /** gancho dos primeiros segundos, ex: "QUANTO CUSTA ESSA CASA EM WINTER PARK?" */
  gancho: string;
  segundosGancho: number;
  /** card final de revelação */
  preco: string;
  specs: string;
  segundosPreco: number;
  /** PNG da logo dentro de public/; "" = sem logo no card final */
  logoSrc: string;
};
