---
name: green-screen-react
description: Gera vídeos 9:16 no modelo "Green Screen - React vídeos e notícias" da I5/Traction (apresentador recortado na frente de um vídeo, legenda palavra por palavra e CTA no final). Use quando pedirem um vídeo/reels no modelo green screen, um react de vídeo ou notícia, "faz um vídeo como o do green screen", comentar ou reagir a um vídeo de terceiros, ou mostrar uma feature de software com o apresentador na frente.
---

# Green Screen React (9:16)

Apresentador recortado (sem o fundo) na parte de baixo, um vídeo de fundo atrás, legenda
palavra por palavra e, no fim, uma pílula de CTA com a logo da Traction.
O template é a composição `GreenScreenReact` em `src/GreenScreen/`.

## O que perguntar ao usuário

Só o que faltar:

1. **Vídeo do apresentador** — arquivo gravado (vertical, 9:16). Não precisa de fundo verde,
   mas o recorte sai melhor com fundo liso e claro, boa luz e roupa que contraste com ele.
2. **Vídeo de fundo** — arquivo ou link (Instagram, YouTube...). Se for link, a skill baixa.
3. **Texto do CTA** — linha de cima e linha de baixo (a oferta, em laranja). Se o usuário
   não quiser CTA, omita as duas.
4. **Nome do vídeo** — curto, sem espaços (ex.: `casa-orlando`). Vira a pasta e o arquivo final.

Se o usuário mandar o vídeo anexado ou em link que você não consegue abrir, peça para ele
copiar o arquivo para `referencias/` (pasta ignorada pelo Git) e passe esse caminho.

## Como gerar

A partir da raiz do projeto `i5-videos`:

```bash
python scripts/gerar_video.py --nome <nome> \
  --apresentador <arquivo-do-apresentador> \
  --fundo <arquivo-ou-link> \
  --cta1 "<linha de cima>" --cta2 "<linha de baixo>"
```

Opções: `--cta-inicio <segundo>` (padrão: últimos 6 s), `--idioma pt`,
`--ajustes '{"legendaY": 900}'` (ver abaixo).

O script faz tudo: copia/baixa os vídeos, recorta o apresentador por IA, transcreve a fala,
renderiza e confere a fluidez. Saída: `out/<nome>.mp4`. Cada etapa é pulada se o resultado
já existe em `public/videos/<nome>/` — para refazer uma etapa, apague o arquivo/pasta dela.

**Tempo:** o recorte roda em CPU, ~1 s por quadro (25 s de vídeo ≈ 13 min) e o render leva
~4 min. Rode em segundo plano e avise o usuário da espera. Não rode isso na VPS: ela tem pouca
memória livre e divide recursos com n8n, Evolution API e outros serviços.

## Antes de entregar

- Confira a linha final do script: `repetidos: 0 | fora de ordem: 0`. Qualquer valor acima
  de 0 em "fora de ordem" é travamento visível — renderize de novo.
- Renderize um quadro com as guias (`mostrarGuias: true` em `--ajustes`) se tiver dúvida de
  que algum texto cai sob os botões do Instagram/TikTok.
- Entregue o caminho do arquivo e peça para o usuário ver no celular.

## Ajustes (campo `--ajustes`, JSON)

| Campo | Padrão | O que faz |
|---|---|---|
| `apresentadorLargura` | 0.57 | Largura do apresentador (fração da largura do vídeo) |
| `apresentadorBase` | 100 | Distância da base do apresentador até a borda de baixo (px) |
| `legendaY` | 850 | Altura do centro da legenda, em px contados do topo (vídeo de 1920 px) |
| `corDestaque` | `#F96830` | Laranja da Traction (destaque da legenda, borda e linha de baixo do CTA) |
| `mostrarGuias` | false | Pinta de vermelho a zona coberta pelo app |

Zona segura (1080×1920): topo 140 px, base 420 px, lateral direita 140 px.

## Decisões que não devem ser desfeitas

- **Apresentador é uma sequência de WebP**, não vídeo com transparência: WebM/alpha falha de
  forma intermitente no render (quadros fora de ordem, "No frame found at position").
- **Fundo em `OffthreadVideo` dentro de `Loop`** (quadro exato; repete se for mais curto).
- **Legenda em cima da cabeça, rosto na parte de baixo** — aprovado pelo usuário. O rosto fica
  dentro da zona segura; a legenda não vai sobre o rosto nem sob os botões do app.
- O `ffmpeg` do Remotion é enxuto (sem filtro `fps`); por isso os scripts usam `-r 30`.

## Dependências (uma vez por máquina)

```bash
npm install
pip install "rembg[cpu]" pillow faster-whisper yt-dlp "av>=14,<17"
```

O `av` precisa ficar abaixo da versão 17 (o faster-whisper quebra nas mais novas). O primeiro
recorte baixa o modelo de IA (~176 MB) e a primeira transcrição baixa o Whisper (~480 MB).

## Arquivos

- `scripts/gerar_video.py` — roda tudo (use este)
- `scripts/recortar.py` — recorte por IA → pasta de WebP
- `scripts/transcrever.py` — fala → JSON de palavras com tempo
- `scripts/verificar_fluidez.py` — conta quadros repetidos/fora de ordem
- `src/GreenScreen/` — template (`GreenScreenReact`, `Legendas`, `CtaFinal`, `types`)
- `public/brand/traction-logo.png` — logo usada no CTA
