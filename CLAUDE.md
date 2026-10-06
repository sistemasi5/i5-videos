# i5-videos — instruções para o Claude

Este projeto gera vídeos da I5/Traction a partir de modelos. **Quem usa é o time de marketing,
que não é técnico.** Fale em português simples, sem jargão, e conduza a pessoa passo a passo.

## Primeira vez neste computador

Se o usuário disser que acabou de abrir o projeto, ou pedir para preparar o ambiente, leia o
`HANDOFF.md` e execute a seção "2. Preparação do ambiente (para o Claude)".

## Quando perguntarem "quais modelos existem?" ou "o que posso fazer?"

Apresente a lista abaixo em linguagem simples e pergunte qual a pessoa quer usar. Não exija que
ela saiba nomes de skills ou comandos.

| Modelo (nome que o marketing conhece) | Para que serve | Skill (uso interno) |
|---|---|---|
| Green Screen — React de vídeos e notícias | Apresentador na frente de um vídeo ou notícia, com legenda palavra por palavra e chamada (CTA) no final | `green-screen-react` |

Ao receber um pedido ("faz um vídeo no modelo green screen", "quero reagir a esse vídeo"),
use a skill correspondente em `.claude/skills/` e faça só as perguntas que faltarem.

## Ao criar ou mudar um modelo

Atualize no mesmo commit: a tabela acima, a tabela de modelos do `HANDOFF.md` e a descrição da
skill (com um exemplo de pedido em português). Quem usa não deve precisar de nada que só esteja
na cabeça de quem criou o modelo.

## Regras fixas

Estão no `HANDOFF.md`, seção "Regras do projeto". Em especial: render sempre local (nunca na
VPS) e mídia pesada fora do Git.
