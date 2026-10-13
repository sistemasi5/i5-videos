<modelos_de_tour>

# Modelos de tour (estilos de montagem no Remotion)

Catálogo dos estilos de tour validados no projeto (2026-10-09, casa de teste: 1742 Temple Dr, Winter Park).
A geração dos clipes é sempre a mesma — **Cinema Studio 3.0, 4 s, 720p, 9:16, "slow lateral sweep ~60° with slight push-in, 18mm, eye level"** (20 créditos por clipe; rodar `get_cost` antes e mostrar o total) — e o estilo entra todo na montagem (Remotion), que custa zero. Cada clipe de 4 s vira 2 planos contíguos sem repetir quadro: A = quadro inteiro, B = punch-in (zoom ~1,3).

**Status: aguardando o feedback do grupo para saber quais viram padrão.**

| Nome | Composição | Estilo | Planos/ritmo | Texto na tela | Clipes | Custo de geração |
|---|---|---|---|---|---|---|
| **Clássico** | `src/TourImovel/` | Cinematográfico, título + chip de localização sobre a fachada | 16 planos de 2–2,5 s, corte seco | Título (ex.: "FLÓRIDA — WINTER PARK") + chip (parque/lago próximo, pesquisar distância e aprovar antes) | 8 | 160 |
| **Quanto Custa** | `src/TourViral/` | Viral 2026: gancho de curiosidade + revelação do preço no fim | 16 planos de 1,2–1,4 s + micro-zoom contínuo | Gancho "QUANTO CUSTA ESSA CASA EM …?", legendas curtas por cômodo, card "ESSA CASA CUSTA → US$ …" + specs | 8 | 160 |
| **Limpo** | `src/TourViral/` com gancho/legendas/preço vazios e `segundosPreco: 0` | Só os cortes, para mandar sem informações | Igual ao Quanto Custa | Nenhum | os mesmos 8 | 0 (reusa) |
| **Elegante** | `src/TourModelos/` → `TourModelo1` | Mansão: texto serif fixo no centro | 13 planos de ~1,4 s, corte seco | "A ENTRADA VS." (0–3 s) → "A CASA" (resto) | 8 (fiel à referência: 12 espaços = 240) | 160–240 |
| **Retrô** | `src/TourModelos/` → `TourModelo2` | Título amarelão fixo + whip borrado entre cômodos | 10 planos de 1,6 s, whip de ~0,3 s | "WELCOME HOUSE *tour*" amarelo, some no último plano | 8 | 160 |
| **Sereno** | `src/TourModelos/` → `TourModelo3` | Calmo, fachada longa, sem texto | Fachada 3,5 s + planos de 2 s, corte seco | Nenhum | 8 (fiel à referência: 10 espaços = 200; pedir "sun rays sweeping" no prompt) | 160–200 |

## Regras que valem para todos

1. `get_cost` antes de gerar qualquer clipe e mostrar o total; esperar o OK explícito.
2. **Logo só quando for pedida** (Atlas = imobiliária, Traction = mentoria; nunca misturar). Os cards de logo existem nas composições (`logoSrc`) e ficam desligados por padrão.
3. Chip de localização: pesquisar o ponto de referência real (OpenStreetMap/geocodificação) e mostrar ao usuário antes de usar.
4. Áudio em alta é adicionado dentro do Instagram/TikTok na hora de postar, não no render.
5. Fotos de origem com carimbo (MLS etc.) = uso interno; refazer com fotos limpas antes de entregar a cliente.
6. Para um modelo novo: baixar a referência (yt-dlp; TikTok precisa de `curl_cffi` instalado), extrair quadros a ~2 fps, montar contact sheet e analisar ritmo/cortes/texto antes de montar.

## Referências analisadas

- `referencias/tour-ref/` — Shorts A (whips, 20,6 s) e B (cortes secos de 1,1 s, 9,9 s) + fundo-reel da Atlas (26,3 s, contínuo)
- `referencias/tiktok-ref/m1|m2|m3/` — as três referências que geraram Elegante, Retrô e Sereno

</modelos_de_tour>
