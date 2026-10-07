---
name: mostrando-casas
description: Gera vídeos 9:16 no modelo "Mostrando casas" da I5 (marca Traction/mentoria ou Atlas Realty/imobiliária) (tour de um imóvel gravado no celular, com texto de abertura e cartões creme com os números da casa: valor inicial, quartos, metragem, valor pós-reforma, aluguel, pergunta final, e tela final com a logo). Use quando pedirem um vídeo/reels mostrando uma casa, imóvel de leilão, "tour da casa com valores", "casa com cartões de preço" ou "faz no modelo Mostrando casas".
---

# Mostrando casas (9:16, 30 a 45 s)

Um tour vertical por um imóvel (vídeo gravado no celular, um clipe contínuo) com:

1. **Abertura** em texto solto sobre o vídeo (sem caixa), com o gancho: "olha essa **oportunidade**
   que está indo a leilão" + 📍 local.
2. **Cartões creme** (um de cada vez, ~4 s cada) com um rótulo pequeno em itálico e o número grande
   em dourado: `valor inicial $8,500`, `2 quartos e 1 banheiro`, `1512 sqft`,
   `valor de mercado pós reforma: $120k`, `potencial de aluguel mensal $1200`.
3. **Cartão de pergunta** no fim ("Me conta aqui. Você arremataria essa casa?").
4. **Legendas da fala** (só se houver gente falando no tour): grupos de até 3 palavras, brancas,
   em negrito, no meio da tela, no estilo do reel `Dbwv5ANNJ94`.
5. **Tela final com logo** — só se pedirem (`--logo`).

**Som:** por padrão o vídeo sai sem som (a música é escolhida no Instagram; veja a seção de música
na skill `broll-informativo`). Se o tour tiver fala, use `--falado`: mantém o som e legenda.

## Logo: SÓ quando pedirem (regra firme)

**Por padrão o vídeo sai SEM logo e SEM tela final.** Não ponha logo por conta própria, não sugira
logo no meio do trabalho e não use a da Traction "por padrão". A logo só entra quando a pessoa
pedir de forma explícita ("com a logo da Traction", "põe a logo da Atlas").

Quando pedirem, use `--logo` (adiciona 3 s de tela final com a logo):
- **`--logo traction`** — mentoria (logo da Traction, tela final preta).
- **`--logo atlas`** — imobiliária Atlas Realty Imóveis Orlando (`public/brand/atlas-logo.png`, tela
  final verde `#0E3B2E`).

São duas marcas separadas, nunca no mesmo vídeo. Se pedirem "com logo" sem dizer qual, pergunte
qual (mentoria ou imobiliária). Sem pedido de logo, **não pergunte** sobre marca.

## O que pedir ao usuário (sempre lembrar, no começo)

Assim que alguém pedir este modelo, **antes de qualquer coisa, lembre a pessoa de passar a ficha
da casa** e liste os campos, para ela só preencher:

- **Local** (cidade/estado)
- **Situação** (leilão, retomada, revenda, à venda...)
- **Preço / valor inicial**
- **Quartos e banheiros**
- **Metragem (sqft)**
- **Valor de mercado pós-reforma**
- **Aluguel potencial por mês**
- **Observação** (o que chama atenção na casa)

Diga que pode deixar em branco o que não souber: só entra no vídeo o que for preenchido, e **nunca
se inventa número**. Depois, pergunte só o que faltar:

1. **O tour** — arquivo ou link do vídeo do imóvel (um clipe só, vertical, até ~45 s).
   Se o link não abrir, peça para copiar o arquivo para `referencias/` (pasta ignorada pelo Git).
2. **O texto** — a pessoa já tem o texto pronto, ou gero a partir da ficha com o prompt de
   `roteiro.md`? (Se gerar, mostre o texto e peça aprovação antes de renderizar.)
3. **Logo?** — não pergunte. Só use `--logo` se a pessoa já tiver pedido.
4. **O tour tem alguém falando?** Se sim, usa `--falado` (legenda a fala).
5. **Nome do vídeo** — curto, sem espaços (ex.: `casa-pennsylvania`).

## Três jeitos de legendar (escolha um)

1. **`--texto`** — texto pronto vira legenda ao longo do tour, mesmo sem ninguém falando. O texto
   sai do prompt em `roteiro.md` (preenche a ficha da casa, o Claude devolve o texto).
2. **`--falado`** — alguém fala no tour; o script mantém o som e legenda a fala.
3. **Só cartões** (`--cartoes`) — sem legenda corrida, só os números da casa.

Dá para combinar `--texto` ou `--falado` com `--cartoes`. A abertura ("olha essa oportunidade")
é **opcional e não deve ser fixa**: varie o gancho a cada vídeo (veja `roteiro.md`).

## Cartão na hora em que o número é falado

Quando há fala (`--falado`) ou texto (`--texto`), o cartão deve **aparecer no instante em que o número
é dito**, não em intervalos fixos. No cartão, use `"quando"` com a palavra que dispara a entrada:

```json
{"destaque":"$15,000","rotulo":"valor inicial","quando":"15"}
{"destaque":"5 quartos e
4 banheiros","quando":"quartos"}
{"destaque":"$400-500k","rotulo":"valor de mercado pós reforma:","quando":"400","dura":5}
```

- O cartão entra 0,3 s antes da palavra e fica 4 s (`dura` muda isso).
- Os `quando` seguem a ordem dos cartões: cada busca começa onde a anterior parou.
- O script imprime "números/valores na fala (candidatos a cartão)" com o segundo de cada um: use essa
  lista para decidir quais números merecem cartão. **Só os que importam** (preço, quartos/banheiros,
  metragem, valor pós-reforma, aluguel); não cubra todo número falado.
- Se a palavra não for achada, o script para e aponta o cartão. A transcrição fica em
  `public/videos/<nome>/fala.json` (só com `--falado`).
- Sem `quando`, `entra`/`sai` manuais ou a divisão por igual continuam valendo.

## Como montar

**Abertura** (`--abertura`, opcional): `linhaTopo` (pequena), `destaque` (palavra grande dourada),
`linhaBase` (pequena), `local` (com ícone de pin, vira maiúsculas), `sai` (segundo em que some,
padrão 5).

**Cartões** (`--cartoes`): cada um `{"rotulo": "valor inicial", "destaque": "$8,500"}`.
- `rotulo` é opcional (o cartão "2 quartos e 1 banheiro" não tem).
- `destaque` aceita `\n` para quebrar linha; textos longos ou com 2 linhas diminuem a letra sozinhos.
- `entra` / `sai` (segundos) são opcionais: sem eles, os cartões dividem por igual o tempo entre a
  abertura e a tela final, na ordem em que foram escritos.

Ordem que funciona: preço inicial → quartos/banheiros → metragem → valor pós-reforma → aluguel →
pergunta. Para casas sem leilão, troque o primeiro por "valor" / "preço".

## Como gerar

A partir da raiz do projeto `i5-videos`:

```bash
python scripts/gerar_casas.py --nome casa-pennsylvania \
  --fundo <arquivo-ou-link> \
  --abertura '{"linhaTopo":"olha essa","destaque":"oportunidade","linhaBase":"que está indo a leilão","local":"Pennsylvania"}' \
  --cartoes '[{"rotulo":"valor inicial","destaque":"$8,500"},
              {"destaque":"2 quartos e\n1 banheiro"},
              {"destaque":"1512 sqft"},
              {"rotulo":"valor de mercado pós reforma:","destaque":"$120k"},
              {"rotulo":"potencial de aluguel mensal","destaque":"$1200"},
              {"rotulo":"Me conta aqui.","destaque":"Você arremataria\nessa casa?"}]'
```

`--abertura` e `--cartoes` também aceitam o caminho de um `.json`.
Opções: `--duracao <s>` (do tour; padrão: o clipe todo, até 45 s), `--inicio <s>`,
`--falado` (mantém o som e legenda a fala), `--logo traction|atlas` (só se pedirem; ver acima), `--ajustes '{"cartaoTopo": 1200}'` (ver abaixo).

O script baixa/prepara o clipe, renderiza e confere a fluidez. Saída: `out/<nome>.mp4`.
**Tempo:** só render, alguns minutos. Rode local, nunca na VPS.
**Se aparecer "falhou, tentando de novo":** é o Remotion com erro `No frame found at position`
(computador sem CPU/memória livre). O script tenta até 3 vezes com menos carga; se falhar nas 3,
peça para fechar navegador, Slack e outros programas pesados.

## Antes de entregar

- Confira `repetidos: 0 | fora de ordem: 0`; se "fora de ordem" for maior que 0, renderize de novo.
- Olhe um quadro de cada cartão (ou gere com `--ajustes '{"mostrarGuias": true}'`): o cartão não
  pode ficar sobre os botões do app (áreas em vermelho).
- Entregue o caminho do arquivo e **lembre que o vídeo sai sem música**.

## Ajustes (campo `--ajustes`, JSON)

| Campo | Padrão | O que faz |
|---|---|---|
| `cartaoTopo` | 1225 | Onde começa o cartão (px do topo, vídeo de 1920 px). Base do cartão ≈ topo + 260; o limite da zona segura é 1500 |
| `corDestaque` | `#E0B94E` | Cor do texto grande (dourado do reel). Para a paleta da marca: `#F96830` |
| `telaFinalSegundos` | 3 com `--logo`, 0 sem | Duração da tela final com a logo |
| `legendaTopo` | 1330 (1000 se houver cartões) | Onde começa a legenda (px do topo) |
| `escurecer` | 0 | 0 a 1: escurece o clipe |
| `mostrarGuias` | false | Pinta de vermelho a zona coberta pelo app |

Zona segura (1080×1920): topo 140 px, base 420 px, direita 140 px.

## Decisões que não devem ser desfeitas

- **Sem áudio por padrão.** A música é escolhida no Instagram; só o `--falado` mantém o som.
- **Um clipe só**; os cartões trocam sobre ele, sem cortes montados pelo script.
- **Números nunca inventados**: cartão só com dado que o usuário passou.
- A logo só existe com `--logo` (pedido explícito); o reel de referência usava a logo de outra empresa, que não
  entra aqui. Traction (mentoria) e Atlas (imobiliária) nunca no mesmo vídeo.
- Fonte Poppins (itálico no rótulo, extra-bold no destaque), como no reel de referência.

## Dependências

`npm install` e `pip install yt-dlp pillow numpy`; `faster-whisper` (com `av<17`) só para `--falado`. Sem recorte por IA.

## Arquivos

- `roteiro.md` — prompt para gerar o texto a partir da ficha da casa
- `scripts/gerar_casas.py` — roda tudo (use este; reaproveita funções de `gerar_broll.py`)
- `src/MostrandoCasas/` — template (`MostrandoCasas`, `AberturaTexto`, `CartaoInfo`, `LegendaFala`, `types`)
