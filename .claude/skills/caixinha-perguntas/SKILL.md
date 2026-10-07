---
name: caixinha-perguntas
description: Gera vídeos 9:16 no modelo "Caixinha de perguntas" da I5 (a pessoa responde falando para a câmera a uma pergunta de seguidor; a pergunta fica fixa na tela numa caixinha estilo Instagram "Faça uma pergunta", com legenda da fala acima e, no fim, um selo vermelho tipo "AULA"). Use quando pedirem um vídeo respondendo pergunta de seguidor, "caixinha de perguntas", "responder pergunta", "resposta com a pergunta na tela" ou "faz no modelo caixinha".
---

# Caixinha de perguntas (9:16, até ~2 min)

Quem responde fala para a câmera (ou mostra algo, como um caderno). Na tela:

1. **Caixinha da pergunta**, fixa o vídeo todo no terço inferior: cabeçalho escuro "Faça uma
   pergunta" e corpo branco com a pergunta (estilo do sticker do Instagram).
2. **Legenda da fala**, em branco e negrito, logo acima da caixinha, em grupos de até 3 palavras.
3. **Selo vermelho** com uma palavra de destaque (ex.: `AULA`) que entra na chamada final
   ("comenta aqui embaixo a palavra AULA") e fica até o fim.

**O vídeo mantém o som** (a pessoa está falando; a música, se houver, é escolhida no Instagram).
**Sem logo e sem tela final**: logo só se a pessoa pedir (veja `mostrando-casas`, regra da logo; este
script ainda não tem `--logo`: se pedirem, avise e adicione antes de gerar).
Template: composição `CaixinhaPerguntas` em `src/CaixinhaPerguntas/`.
Referência aprovada: reel `DbQ0pO0BbBa` (Felipe respondendo "como você decide se um imóvel vale o flip?").

## O que pedir ao usuário

1. **O vídeo da resposta** — arquivo ou link, vertical, com a pessoa falando. Se for pesado, copiar
   para `referencias/` (ignorada pelo Git). Arquivo do Google Drive: baixe pelo link compartilhado
   (`https://drive.usercontent.google.com/download?id=<ID>&export=download&confirm=t`), não pela
   ferramenta do Drive (devolve base64 e estoura o contexto).
2. **A pergunta**, exatamente como deve aparecer na caixinha (curta: 1 a 3 linhas).
3. **A palavra de chamada** (ex.: AULA), se o vídeo terminar com "comenta aqui embaixo...".
4. **Nome do vídeo** — curto, sem espaços.

## Como gerar

```bash
python scripts/gerar_caixinha.py --nome flip-processo \
  --fundo <arquivo-ou-link> \
  --pergunta "Felipe, como você decide se um imóvel vale o flip ou não? Tem um processo definido?" \
  --selos '[{"texto":"AULA","quando":"aula"}]'
```

- `--selos` (opcional): `"quando": "palavra"` faz o selo entrar quando a palavra é dita (0,2 s antes);
  fica até o fim, ou use `"sai"` em segundos.
- `--duracao <s>`, `--inicio <s>`: cortar o vídeo.
- `--ajustes '{"caixaTopo": 1100, "legendaTopo": 990}'`.

### Revisar as legendas (importante)

O Whisper erra palavras ("novinho em folha" vira "vinho e folha"). O script **salva a transcrição em
`public/videos/<nome>/legendas.json`**. Fluxo: gere uma vez, abra o JSON, corrija o `texto` dos
erros (mantenha `inicio`/`fim`), rode de novo com `--legendas public/videos/<nome>/legendas.json`
(pula a transcrição e reaproveita o resto). Mostre as legendas ao usuário antes de entregar.

Tempo: transcrição (CPU) + render, de 5 a 15 min para ~1 min de vídeo. Rode local, nunca na VPS.
Erro `No frame found at position`: o script tenta de novo com menos carga (até 3 vezes).

## Antes de entregar

- `repetidos: 0 | fora de ordem: 0` na checagem de fluidez.
- Olhe um quadro: a caixinha termina acima de y=1500 (zona segura) e a legenda não cobre o rosto.
- Confira as legendas contra o que foi dito (nomes, números, termos como ARV e comps).

## Ajustes

| Campo | Padrão | O que faz |
|---|---|---|
| `caixaTopo` | 1110 | Topo da caixinha (px, vídeo de 1920). A caixinha tem ~360 px de altura |
| `legendaTopo` | 1010 | Topo da legenda; o selo fica ~120 px acima |
| `tamanhoLegenda` | 44 | Tamanho da letra da legenda (px; 58 era grande demais) |
| `tituloCaixa` | "Faça uma pergunta" | Texto do cabeçalho |
| `escurecer` | 0 | 0 a 1 |
| `mostrarGuias` | false | Pinta de vermelho a zona do app |

## Decisões que não devem ser desfeitas

- A caixinha fica **fixa durante o vídeo todo**, como no reel de referência.
- O som do vídeo é mantido; a legenda acompanha a fala, não é texto solto.
- A caixinha sobe um pouco em relação ao reel de referência para respeitar a zona segura (base 420 px).

## Arquivos

- `scripts/gerar_caixinha.py` — roda tudo (reaproveita funções de `gerar_casas.py`)
- `src/CaixinhaPerguntas/` — template (`CaixinhaPerguntas`, `CaixaPergunta`, `SeloVermelho`, `types`)
- A legenda reaproveita `src/MostrandoCasas/LegendaFala.tsx`.
