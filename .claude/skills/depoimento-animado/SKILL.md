---
name: depoimento-animado
description: Gera vídeos 9:16 no modelo "Depoimento animado" da I5/Traction (o áudio das melhores partes de um depoimento de aluno, ilustrado por bonequinhos desenhados nas cores da Traction, com cenas que mudam no ritmo da fala e legenda palavra por palavra). Use quando pedirem um "vídeo animado com bonequinhos", "animação ilustrando o depoimento", "transformar o depoimento em desenho/animação" ou "faz no modelo depoimento animado". Exemplo de pedido: "pega o depoimento do Rafael em Downloads e faz um vídeo animado com bonequinhos usando as partes mais importantes".
---

# Depoimento animado (9:16, 40 a 90 s)

Só o **áudio** do depoimento original entra. A imagem é toda desenhada: bonequinhos de traço
(depoente de camiseta laranja, mentor de camiseta preta), objetos simples e textos curtos que
aparecem quando a palavra é dita. Topo: selo "DEPOIMENTO" + nome. Embaixo: legenda palavra por
palavra (a palavra dita fica laranja; falas do mentor aparecem com o nome dele).
Sem logo por padrão; `--logo` acrescenta 2,5 s de tela preta com a logo.

## Passo a passo

1. **Pegue o vídeo** (arquivo). Pergunte só o que faltar: nome do depoente, nome do mentor
   (padrão Felipe) e um nome curto para o vídeo.
2. **Transcreva** com `python scripts/transcrever.py <video> public/videos/<nome>/palavras.json pt`
   (o script principal reaproveita esse arquivo). Imprima as palavras com tempo.
3. **Escolha as partes importantes** (alvo: 60 a 80 s de fala): quem é a pessoa, a dor/problema,
   a virada (dica do mentor), o resultado com números, e a recomendação final. Corte as pausas
   longas, cumprimentos e repetições. Comece e termine cada trecho entre palavras (~0,05 s de folga).
4. **Escreva o roteiro** (JSON) ligando cada parte a um tipo de cena. Use
   `exemplos/rafael.json` como modelo. Corrija no roteiro o que o Whisper errou (`correcoes`):
   nomes, termos em inglês (deal, Zillow, closing...).
5. **Confira o desenho** antes do render completo:
   `python scripts/gerar_depoimento.py ... --so-props` e tire fotos de alguns quadros com
   `node node_modules/@remotion/cli/remotion-cli.js still src/index.ts DepoimentoAnimado foto.png --props=public/videos/<nome>/props.json --frame=<n> --scale=0.5`.
   Procure textos se sobrepondo ou saindo das figuras.
6. **Render:** `python scripts/gerar_depoimento.py --nome <nome> --video <arquivo> --roteiro <roteiro.json> [--logo]`.
   Saída em `out/<nome>.mp4`. Guarde o roteiro em `exemplos/<nome>.json` se for reaproveitável.

## Tipos de cena

Cada cena tem `textos` (todos opcionais, com padrão) e `momentos` (palavra que dispara a animação).

| Tipo | O que mostra | textos | momentos |
|---|---|---|---|
| `chegada` | Depoente chega andando num prédio com placa e acena; calendário aparece | `lugar`, `tempo` | `mes` |
| `negocio_ruim` | Casa rachada + gráfico caindo; depois capelo de formatura e livros | `antes`, `depois` | `ruim`, `aprender` |
| `aula` | Tela com o mentor ensinando, barra de progresso com trecho destacado, relógio | `total`, `destaque` | `cinco` |
| `problema` | Notebook com anúncios de casas rolando, pensamento "$ ?" e X vermelho | `erro` | `casas`, `batem` |
| `conselho` | Mentor aponta, balão com a frase (use `\|` para quebrar linha), envelopes de oferta voando | `fala` | `mandar`, `oferta` |
| `desconto` | Casa, etiqueta com preço riscado, carimbo do novo preço, selo de desconto, explosão de reação do mentor | `casa`, `rotuloDe`, `de`, `por`, `economia`, `economiaRotulo`, `reacao` | `listada`, `fechando`, `caraca` |
| `contrato` | Contrato sendo assinado, carimbo, depoente incrédulo e depois comemorando com confete | `titulo`, `papel`, `duvida`, `final` | `contrato`, `acontecer` |
| `valeu` | Relógio, cadeado "bloqueio" que se abre, check verde com moedas | `dica`, `bloqueio`, `valor` | `bloqueio`, `valeu` |
| `convite` | Frase grande sublinhada, depoente de braços abertos, estrelinhas | `sub`, `frase` | `pena` |

Os nomes dos momentos são fixos por tipo; o valor é a palavra falada (ex.: `"fechando": "320"`).
Use `"palavra#2"` para a 2ª vez que ela aparece, ou um número (segundos desde o início da cena).

Se o depoimento pedir uma cena que não existe, crie um novo tipo em
`src/DepoimentoAnimado/cenas.tsx` (palco de 1080 × 920, chão em y = 820), registre em `CENAS` e em
`TipoCena` (`types.ts`) e acrescente uma linha nesta tabela.

## Regras

- Zonas seguras respeitadas pelo layout: o palco fica entre 330 e 1250 px, a legenda em 1280 px.
- Textos dentro das cenas: curtos, em MAIÚSCULAS, no máximo ~22 letras por rótulo.
- Números de dinheiro como a pessoa falou (ex.: "$460 mil"); confira se a conta do desconto bate.
- Render sempre local.
