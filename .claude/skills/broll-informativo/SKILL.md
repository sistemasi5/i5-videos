---
name: broll-informativo
description: Gera vídeos 9:16 no modelo "Vídeo B-roll informativo" da I5/Traction (um clipe de fundo, sem apresentador e sem fala, com blocos de texto em caixinhas pretas, brancas ou vermelhas por cima, de 15 a 20 s). Use quando pedirem um vídeo/reels com imagens de casas ou B-roll e texto explicativo, "vídeo informativo com texto na tela", dicas ou fatos de financiamento/real estate em texto sobre imagens, ou "faz no modelo B-roll".
---

# Vídeo B-roll informativo (9:16, 15 a 20 s)

Um clipe vertical de fundo (casas, obra, bairro...) com blocos de texto empilhados no meio da
tela, como as legendas do Instagram. Sem apresentador, sem fala. **O vídeo sai sem som**: a
música é escolhida dentro do Instagram na hora de publicar.
O template é a composição `BrollInformativo` em `src/BrollInformativo/`.

Referências aprovadas: reels `DdCAfV1xlE6` (dois blocos pretos + caixa vermelha que entra no
meio) e `Dd2QzUBsB5z` ("Os bancos esperam que você NUNCA saiba disso", blocos brancos e pretos,
título em vermelho com serifa).

## O que perguntar ao usuário

Só o que faltar:

1. **Clipe de fundo** — arquivo ou link (Instagram, YouTube...). Um clipe só, vertical, de 15 a
   20 s. Se for mais longo, o vídeo usa o começo (ou o trecho a partir de `--inicio`).
2. **O texto** — o que cada bloco diz. Se a pessoa só der o assunto, proponha os blocos
   (curtos, uma ideia por bloco) e peça aprovação antes de renderizar.
3. **Nome do vídeo** — curto, sem espaços (ex.: `financiamento-30-anos`).

Se o usuário mandar o vídeo anexado ou em link que você não consegue abrir, peça para copiar o
arquivo para `referencias/` (pasta ignorada pelo Git) e passe esse caminho.

## Como montar os blocos

Cada bloco é `{"texto": "...", "cor": "...", "entra": 4, "fonte": "serifa"}`:

| Campo | Valores | Observação |
|---|---|---|
| `texto` | texto livre | `\n` quebra linha; emojis funcionam (🏠 🇺🇸 ✅ 👇 👀) |
| `cor` | `branco`, `preto`, `vermelho` | branco = caixa branca/letra preta · preto = caixa preta/letra branca · vermelho = caixa vermelha/letra branca em negrito |
| `entra` | segundos (opcional) | sem ele, o bloco aparece desde o primeiro quadro; com ele, entra com um "pop" rápido |
| `fonte` | `sans` (padrão), `serifa` | serifa é a do título do reel `Dd2QzUBsB5z` |

Receita que funciona: **título/gancho em vermelho** (ex.: "Os bancos 👀 esperam que você NUNCA
saiba disso:"), blocos de conteúdo em branco ou preto, e a **chamada final em vermelho com
`entra`** (ex.: "Deixei os 5 passos na legenda 👇"). Prefira poucos blocos e frases curtas: a
pessoa tem 15–20 s para ler tudo. Os blocos já ficam dentro da zona segura; com mais de 6
blocos, confira com as guias (abaixo) ou diminua `tamanhoFonte`.

## Como gerar

A partir da raiz do projeto `i5-videos`:

```bash
python scripts/gerar_broll.py --nome <nome> \
  --fundo <arquivo-ou-link> \
  --blocos '[{"texto":"Os bancos 👀 esperam que você\nNUNCA saiba disso:","cor":"vermelho","fonte":"serifa"},
             {"texto":"Um financiamento de 30 anos = 30 anos","cor":"branco"},
             {"texto":"Deixei os 5 passos\nna legenda 👇","cor":"vermelho","entra":8}]'
```

`--blocos` também aceita o caminho de um arquivo `.json` (melhor com muitos blocos).
Opções: `--duracao <s>` (padrão: o clipe, no máximo 20 s), `--inicio <s>` (a partir de que
segundo do clipe), `--ajustes '{"areaTopo": 500}'` (ver abaixo).

O script copia/baixa o clipe, renderiza e confere a fluidez. Saída: `out/<nome>.mp4`.
**Tempo:** só render, ~1 a 3 min. Não roda recorte nem transcrição. Rode local, nunca na VPS.
**Se aparecer "falhou, tentando de novo":** é o Remotion com erro `No frame found at position`, que
acontece quando o computador está sem CPU ou memória livre. O script tenta até 3 vezes, cada uma
com menos carga. Se falhar nas 3, peça para a pessoa fechar navegador, Slack e outros programas
pesados e rodar de novo.

## Antes de entregar

- Confira a linha `repetidos: 0 | fora de ordem: 0`. Se "fora de ordem" for maior que 0,
  renderize de novo.
- Na dúvida sobre os textos baterem em algum botão do app, gere com
  `--ajustes '{"mostrarGuias": true}'` e olhe um quadro (áreas em vermelho = coberto pelo app).
- Entregue o caminho do arquivo e **lembre que o vídeo sai sem música** (ver abaixo).

## Música (feita no Instagram, não aqui)

O vídeo é exportado mudo de propósito. Para publicar: Reels → carregar o vídeo → **Áudio** →
buscar ou escolher uma faixa. Dê sugestões ao usuário por **tipo de som e palavra de busca**,
sem inventar nome de música (não dá para saber o que está em alta hoje):

- **Instrumental (mais seguro para tema financeiro/educativo):** busque "instrumental",
  "lo-fi beat", "cinematic", "corporate" ou "inspirational".
- **Em alta:** na aba de áudio do Instagram, a seção "Em alta" (setinha ↗) mostra o que está
  subindo agora; escolha uma faixa com batida leve e sem letra por cima, para não competir
  com o texto que a pessoa está lendo.
- Música com letra concorre com a leitura dos blocos; prefira trilha sem voz.
- Contas comerciais podem ter uma biblioteca de músicas mais restrita que contas pessoais;
  se a faixa não aparecer, tente outra do mesmo estilo.

## Ajustes (campo `--ajustes`, JSON)

| Campo | Padrão | O que faz |
|---|---|---|
| `areaTopo` | 560 | Onde começa (px do topo, vídeo de 1920 px) a área em que os blocos ficam centralizados |
| `areaBase` | 1500 | Onde ela termina (o limite da zona segura é 1500) |
| `tamanhoFonte` | 46 | Tamanho da letra. As caixas e os espaços acompanham |
| `escurecer` | 0 | 0 a 1: escurece o clipe para o texto ler melhor (ex.: 0.2) |
| `mostrarGuias` | false | Pinta de vermelho a zona coberta pelo app |

Zona segura (1080×1920): topo 140 px, base 420 px, lateral direita 140 px.

## Decisões que não devem ser desfeitas

- **Sem áudio no vídeo.** A música é escolhida no Instagram (decisão do usuário).
- **O espaço de cada bloco fica reservado desde o início**: blocos com `entra` não empurram os
  outros de lugar quando aparecem.
- **Emoji vem da fonte Noto Color Emoji**, não do sistema: o Windows não desenha bandeira
  (🇺🇸) e o resultado mudaria de computador para computador.
- **Um clipe só, de 15 a 20 s.** Não há cortes entre vários clipes neste modelo.
- Mesma paleta do projeto (vermelho `#E8161B` do print aprovado; caixas pretas/brancas).

## Dependências

`npm install` e `pip install yt-dlp pillow numpy` (só isso; este modelo não precisa de
recorte por IA nem de Whisper). Veja o `HANDOFF.md` para a instalação completa.

## Arquivos

- `scripts/gerar_broll.py` — roda tudo (use este)
- `scripts/verificar_fluidez.py` — conta quadros repetidos/fora de ordem
- `src/BrollInformativo/` — template (`BrollInformativo`, `CaixaTexto`, `types`)
