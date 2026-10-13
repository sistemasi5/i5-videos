# Diário de uma Reforma — maquete reutilizável

- `dims.ts`: dimensões e cores da casa (uma única casa para todos os episódios).
- `CamadaDemolicao.tsx`, `CamadaEstrutura.tsx`, `CamadaAcabamento.tsx`: uma camada por fase. Para evoluir
  um episódio, mexa só na camada da fase.
- `tempo.ts`: linha do tempo (`estadoNoTempo`) e câmera (`cameraNoTempo`). Tudo depende do frame.
- `Maquete.tsx`: monta as três camadas, luz, câmera e vista explodida.
- `Rotulos.tsx`, `Apresentador.tsx`, `Legenda.tsx`: rótulos com ícones, moldura chanfrada e legendas.
- Composições: `DiarioReforma` (linha do tempo) e `DiarioReformaEstadoFinal` (quadro da casa reformada).
- Amostra: `--frames=51-474`. Original preservado em `referencias/felipe/a.mp4`; corte em
  `public/videos/diario-reforma/original.mp4`; fala real em `fala.json`.
