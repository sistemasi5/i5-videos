# HANDOFF — Editar vídeos I5/Traction com o Claude

Este projeto gera vídeos verticais (9:16, Reels/TikTok) da I5/Traction a partir de **modelos**.
Quem edita só precisa abrir a pasta no Claude Code e dizer o que quer; o Claude roda tudo.

Modelos disponíveis hoje:

| Modelo | Skill | O que faz |
|---|---|---|
| Green Screen — React vídeos e notícias | `green-screen-react` | Apresentador recortado na frente de um vídeo, legenda palavra por palavra, CTA no final |

---

## 1. Para quem vai editar (passo a passo)

### 1.1 Instalar uma vez por computador

| # | Programa | Versão | Como conferir | Onde baixar |
|---|---|---|---|---|
| 1 | Node.js | 20 LTS ou mais novo | `node --version` | https://nodejs.org |
| 2 | Python | 3.10 a 3.12 | `python --version` | https://www.python.org/downloads (marque **Add Python to PATH**) |
| 3 | Git | qualquer | `git --version` | https://git-scm.com |
| 4 | Claude Code | atual | `claude --version` | https://claude.com/claude-code |
| 5 | VS Code (opcional) | qualquer | — | https://code.visualstudio.com |

Não precisa instalar ffmpeg nem Chrome: o Remotion traz o ffmpeg e baixa o navegador sozinho
no primeiro render.

Requisitos da máquina: 8 GB de RAM (16 GB é melhor), ~3 GB livres em disco e internet na
primeira vez (os modelos de IA são baixados).

### 1.2 Pegar o projeto

Peça acesso ao repositório **sistemasi5/i5-videos** no GitHub (quem administra a conta da
empresa libera) e clone:

```bash
git clone https://github.com/sistemasi5/i5-videos.git
cd i5-videos
```

Se pedir login, use sua conta do GitHub (ou rode `gh auth login`).

### 1.3 Abrir no Claude e mandar o prompt de preparação

```bash
claude
```

Cole **exatamente** isto no Claude:

> Leia o HANDOFF.md deste projeto e execute a seção "2. Preparação do ambiente (para o Claude)".
> Me diga o que faltar instalar e, no fim, confirme se estou pronto para gerar um vídeo.

O Claude vai conferir o que está instalado, instalar o que faltar e fazer um teste.
Isso leva alguns minutos e só precisa ser feito uma vez.

### 1.4 Pedir um vídeo

Depois de pronto, é só pedir em português. Exemplo:

> Faz um vídeo no modelo green screen. O apresentador é `C:\Users\eu\Videos\eu.mp4`, o fundo é
> este link do Instagram: https://www.instagram.com/reel/XXXX/. CTA: "Traction · Mentoria" e
> "Subindo de nível". Nome: `casa-orlando`.

O Claude pergunta só o que faltar (apresentador, fundo, texto do CTA, nome do vídeo) e gera.
O arquivo final aparece em `out/<nome>.mp4`.

**Dicas para o vídeo do apresentador:** vertical (9:16), fundo liso e claro, boa luz, roupa que
contraste com o fundo. Não precisa de fundo verde de verdade.

**Tempo de espera:** o recorte por IA roda no processador, ~1 s por quadro (vídeo de 25 s ≈ 13
min), mais ~4 min de render. O Claude roda em segundo plano e avisa quando terminar.

### 1.5 Pré-visualizar e ajustar

```bash
npm run dev
```

Abre o Remotion Studio no navegador (http://localhost:3000) para ver a composição ao vivo.
Ajustes finos (posição da legenda, tamanho do apresentador, cor) podem ser pedidos ao Claude
em linguagem normal, ex.: "sobe a legenda um pouco" ou "apresentador um pouco maior".

---

## 2. Preparação do ambiente (para o Claude)

> **Claude:** se o usuário pediu para executar esta seção, siga os passos na ordem, a partir
> da raiz do projeto. Explique em uma frase o que está fazendo em cada passo. Não pule a
> verificação final. Responda em português.

1. **Conferir ferramentas.** Rode `node --version`, `python --version` (no macOS/Linux, tente
   `python3`), `git --version`. Se faltar algo ou a versão for menor que a exigida (Node 20+,
   Python 3.10–3.12), pare e diga ao usuário o que instalar e onde (tabela da seção 1.1). Não
   tente instalar Node/Python sozinho sem pedir.
2. **Dependências do Node:** `npm install` (use `npm i --loglevel=error` para saída enxuta).
3. **Dependências do Python** (uma vez por máquina):
   ```bash
   pip install "rembg[cpu]" pillow faster-whisper yt-dlp "av>=14,<17" numpy
   ```
   - O `av` **precisa** ficar abaixo da versão 17: nas mais novas o faster-whisper quebra
     (`metadata_errors`).
   - Se `pip` não for reconhecido, use `python -m pip install ...`.
4. **Pastas locais** (ficam fora do Git, crie se não existirem): `referencias/`,
   `public/videos/`, `out/`.
5. **Verificar o Remotion:** `npx remotion compositions src/index.ts`. Deve listar
   `GreenScreenReact`. Na primeira vez baixa o Chrome headless (pode levar alguns minutos).
6. **Verificar o ffmpeg do Remotion:** `node node_modules/@remotion/cli/remotion-cli.js ffmpeg -version`.
7. **Verificar o Python:** `python -c "import rembg, faster_whisper, yt_dlp, PIL, numpy; print('ok')"`.
   Os modelos de IA são baixados só no primeiro uso real (recorte ~176 MB, Whisper ~480 MB);
   avise o usuário disso.
8. **Conferir as skills.** Elas vêm junto no Git, em `.claude/skills/` (`green-screen-react` e
   as do Remotion). Confirme que `.claude/skills/green-screen-react/SKILL.md` existe; se não,
   rode `git pull` e avise o usuário.
9. **Relatório final** ao usuário, em lista curta: o que já estava ok, o que foi instalado, o
   que falta (se algo), e a frase "Pronto para gerar vídeos" só se todos os passos passaram.

### Como gerar um vídeo (para o Claude)

Use a skill **`green-screen-react`** (`.claude/skills/green-screen-react/SKILL.md`): ela
descreve as perguntas, o comando e a checagem final. Resumo:

```bash
python scripts/gerar_video.py --nome <nome> \
  --apresentador <arquivo> --fundo <arquivo-ou-link> \
  --cta1 "<linha de cima>" --cta2 "<linha de baixo>"
```

Saída: `out/<nome>.mp4`. Antes de entregar, confira a linha `repetidos: 0 | fora de ordem: 0`;
se "fora de ordem" for maior que 0, renderize de novo.

### Regras do projeto (não desfazer)

- **Render sempre na máquina local.** Nunca na VPS da empresa (pouca RAM, roda n8n, Evolution
  API, OpenClaw e Postgres).
- **Apresentador = sequência de WebP**, nunca vídeo WebM com transparência (falha de forma
  intermitente no render).
- **Zonas seguras 1080×1920:** topo 140 px, base 420 px, lateral direita 140 px (botões do
  Reels/TikTok). Nada importante fora delas.
- **Identidade visual:** laranja `#F96830`, preto e branco; logo em `public/brand/`.
- **Legenda em cima da cabeça, rosto na parte de baixo** (layout aprovado).
- Mídia pesada (`referencias/`, `public/videos/`, `out/`) **não vai para o Git**.
- **Novo modelo de vídeo** = uma composição em `src/<Modelo>/` + uma skill em
  `.claude/skills/<modelo>/` + um script que roda de ponta a ponta. Registre a composição em
  `src/Root.tsx` e valide com os vídeos de referência que o usuário enviar.

---

## 3. Estrutura do projeto

```
i5-videos/
├── HANDOFF.md                  ← este arquivo
├── src/
│   ├── Root.tsx                ← registra as composições
│   └── GreenScreen/            ← modelo Green Screen (vídeo, legendas, CTA)
├── scripts/
│   ├── gerar_video.py          ← roda tudo de ponta a ponta (use este)
│   ├── recortar.py             ← recorta o apresentador por IA → WebP
│   ├── transcrever.py          ← fala → palavras com tempo (legendas)
│   └── verificar_fluidez.py    ← conta quadros repetidos/fora de ordem
├── public/brand/               ← logo da Traction
├── public/videos/<nome>/       ← mídia de trabalho (fora do Git)
├── referencias/                ← vídeos/prints de referência (fora do Git)
├── out/                        ← vídeos finais (fora do Git)
└── .claude/skills/             ← skills (green-screen-react + Remotion)
```

## 4. Problemas comuns

| Sintoma | Causa e solução |
|---|---|
| `ModuleNotFoundError` ao rodar os scripts | Dependências Python não instaladas: refaça o passo 3 da seção 2 |
| Erro `metadata_errors` na transcrição | `av` novo demais: `pip install "av>=14,<17"` |
| `No frame found at position` no render | Algum vídeo com transparência (WebM) entrou na composição: use a sequência de WebP |
| Vídeo final travando / quadros fora de ordem | Renderize de novo; confira com `python scripts/verificar_fluidez.py out/<nome>.mp4` |
| `ffmpeg` sem filtro `fps` ou `tile` | O ffmpeg do Remotion é enxuto: use `-r 30` e extraia quadros um a um; chame via `node`, não via shell do Windows |
| Download de link do Instagram falha | Só funciona para Reels públicos. Peça o arquivo e coloque em `referencias/` |
| Vídeo e áudio baixados separados | Normal no Instagram: o script junta com `-c copy` |
| Recorte muito lento | Esperado em CPU (~1 s/quadro). Use vídeos curtos e rode em segundo plano |
| `git clone` pede chave SSH | Use a URL HTTPS acima, ou peça para adicionarem sua chave SSH |

## 5. Atualizar o projeto

Antes de começar a trabalhar, puxe as novidades (novos modelos, correções):

```bash
git pull
npm install
```

Se um modelo novo foi adicionado, o Claude lê a skill dele em `.claude/skills/` e você pede
"faz um vídeo no modelo X".
