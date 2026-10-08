"""Gera um vídeo do modelo "Mostrando casas" (tour de imóvel com cartões de informação).

Uso (a partir da raiz do projeto):
  python scripts/gerar_casas.py --nome casa-pennsylvania \
      --fundo caminho/tour.mp4              (ou um link: Instagram, YouTube...)
      --abertura '{"linhaTopo":"olha essa","destaque":"oportunidade","linhaBase":"que está indo a leilão","local":"Pennsylvania"}' \
      --cartoes '[{"rotulo":"valor inicial","destaque":"$8,500"}, {"destaque":"2 quartos e\n1 banheiro"}, ...]'
      [--logo traction|atlas]
      [--falado] [--duracao 40] [--inicio 0] [--ajustes '{"cartaoTopo": 1200}']

--abertura e --cartoes aceitam o JSON direto ou o caminho de um arquivo .json.
Cartão: rotulo (linha pequena, opcional), destaque (texto grande), entra/sai (segundos, opcionais:
sem eles os cartões dividem o tempo por igual). Com --texto ou --falado, "quando": "palavra" faz o
cartão entrar no instante em que essa palavra é dita (ex.: {"destaque":"$15,000","quando":"15"});
"dura" (segundos, padrão 4) controla quanto tempo ele fica. Os "quando" seguem a ordem dos cartões. Com --logo, a tela final com a logo é somada ao fim do tour.

--logo (opcional): SÓ use quando a pessoa pedir a logo. Sem --logo, o vídeo sai sem logo e sem tela
  final. "traction" = mentoria (logo da Traction, fundo preto); "atlas" = imobiliária Atlas Realty
  (public/brand/atlas-logo.png, fundo verde). Nunca coloque logo por conta própria.
--texto: texto pronto (ou caminho de um .txt) que vira legenda ao longo do tour, mesmo sem ninguém
  falando. As palavras são distribuídas no tempo pelo ritmo de leitura (~2,6 palavras por segundo).
--falado: o tour tem gente falando. Mantém o som, transcreve (Whisper) e legenda a fala.
  Sem --falado o vídeo sai mudo (a música é escolhida no Instagram).

Etapas: 1. baixa/corta o clipe  2. renderiza  3. confere a fluidez.
Saída: out/<nome>.mp4.
"""
import argparse
import json
import re
import subprocess
import sys
import unicodedata
from pathlib import Path

from gerar_broll import CLI, PY, RAIZ, baixar, duracao, ffmpeg, preparar

DURACAO_MAXIMA = 60  # tour + cartões; os reels de referência têm ~38 s, mas o Reels aceita mais
TELA_FINAL = 3
MARCAS = {
    "traction": {"logoSrc": "brand/traction-logo.png", "corTelaFinal": "#000000"},
    "atlas": {"logoSrc": "brand/atlas-logo.png", "corTelaFinal": "#0E3B2E"},
}


def preparar_com_audio(origem, destino, inicio, dur):
    """Igual a preparar(), mas mantém o áudio (AAC) para o tour falado."""
    ffmpeg(
        "-ss", inicio, "-t", dur, "-i", origem, "-r", 30,
        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
        "-c:v", "libx264", "-crf", "23", "-maxrate", "10M", "-bufsize", "20M",
        "-g", "15", "-keyint_min", "15", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "128k", destino,
    )


def _norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if unicodedata.category(c) != "Mn")


GATILHOS_NUMERO = ("mil", "milhao", "milhoes", "quartos", "banheiros", "sqft", "pes", "dolares", "%", "porcento")


def momentos_com_numero(palavras):
    """Palavras da fala que carregam número ou valor: candidatas a cartão."""
    achados = []
    for w in palavras:
        n = _norm(w["texto"])
        if re.search(r"\d", n) or n.strip(".,!?") in GATILHOS_NUMERO:
            achados.append(w)
    return achados


def sincronizar(cartoes, palavras, antecedencia=0.3, duracao=4.0):
    """Cartão com "quando": "palavra" entra no instante em que essa palavra é dita.
    As buscas seguem a ordem dos cartões (cada uma começa onde a anterior parou)."""
    pos = 0
    for i, c in enumerate(cartoes, 1):
        chave = c.pop("quando", None)
        if not chave:
            continue
        alvo = _norm(str(chave))
        achou = next((j for j in range(pos, len(palavras)) if alvo in _norm(palavras[j]["texto"])), None)
        if achou is None:
            sys.exit(f'Cartão {i}: não encontrei "{chave}" na fala (depois do cartão anterior). '
                     "Confira a transcrição em public/videos/<nome>/fala.json ou use entra/sai.")
        pos = achou + 1
        c.setdefault("entra", round(max(0.0, palavras[achou]["inicio"] - antecedencia), 2))
        c.setdefault("sai", round(c["entra"] + c.pop("dura", duracao), 2))
        c.pop("dura", None)
    return cartoes


def agrupar(palavras):
    """Agrupa palavras com tempo em legendas de até 3 palavras (quebra em pontuação)."""
    unidas = []
    for w in palavras:  # o Whisper separa "mantê-la" em "mantê" + "-la": junta de volta
        if unidas and w["texto"].startswith("-"):
            unidas[-1] = {"texto": unidas[-1]["texto"] + w["texto"], "inicio": unidas[-1]["inicio"], "fim": w["fim"]}
        else:
            unidas.append(w)
    palavras = unidas
    grupos, atual = [], []
    for w in palavras:
        atual.append(w)
        if len(atual) >= 3 or re.search(r"[.!?,;:]$", w["texto"]):
            grupos.append(atual)
            atual = []
    if atual:
        grupos.append(atual)
    legendas = []
    for i, g in enumerate(grupos):
        fim = g[-1]["fim"]
        proximo = grupos[i + 1][0]["inicio"] if i + 1 < len(grupos) else fim + 0.6
        legendas.append({
            "texto": " ".join(w["texto"] for w in g),
            "inicio": g[0]["inicio"],
            "fim": round(max(fim, min(proximo, fim + 0.6)), 2),
        })
    return legendas


def legendas_do_texto(texto, tour):
    """Espalha um texto pronto pelo tour no ritmo de leitura (se não couber, acelera)."""
    palavras = texto.split()
    if not palavras:
        sys.exit("--texto está vazio.")
    inicio, ritmo = 0.6, 0.38  # segundos por palavra
    util = tour - inicio - 0.8
    if len(palavras) * ritmo > util:
        ritmo = util / len(palavras)
        if ritmo < 0.28:
            sys.exit(f"O texto tem {len(palavras)} palavras, muito para {tour:.0f} s de tour. "
                     "Encurte o texto ou use um tour mais longo.")
    com_tempo = [
        {"texto": w, "inicio": round(inicio + i * ritmo, 2), "fim": round(inicio + (i + 1) * ritmo, 2)}
        for i, w in enumerate(palavras)
    ]
    return agrupar(com_tempo), com_tempo


def legendas_da_fala(video, saida_json):
    """Transcreve com Whisper e agrupa as palavras em legendas de até 3 palavras."""
    subprocess.run([PY, "scripts/transcrever.py", str(video), str(saida_json), "pt"], check=True, cwd=RAIZ)
    palavras = json.loads(Path(saida_json).read_text(encoding="utf-8"))
    return agrupar(palavras), palavras


def ler_json(valor, nome):
    texto = Path(valor).read_text(encoding="utf-8") if Path(valor).is_file() else valor
    try:
        return json.loads(texto)
    except json.JSONDecodeError as e:
        sys.exit(f"--{nome} não é um JSON válido: {e}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--nome", required=True, help="nome do vídeo (vira a pasta e o arquivo de saída)")
    p.add_argument("--fundo", required=True, help="tour do imóvel: arquivo ou link")
    p.add_argument("--cartoes", help="JSON com os cartões (opcional), ou caminho de um .json")
    p.add_argument("--abertura", help="JSON da abertura (linhaTopo, destaque, linhaBase, local)")
    p.add_argument("--duracao", type=float, help="duração do tour em segundos (padrão: o clipe todo, até 45 s)")
    p.add_argument("--inicio", type=float, default=0, help="segundo do clipe em que o vídeo começa")
    p.add_argument("--logo", choices=sorted(MARCAS),
                   help="só se pedirem a logo: traction = mentoria · atlas = imobiliária Atlas Realty")
    p.add_argument("--texto", help="texto pronto que vira legenda no tour, ou caminho de um .txt")
    p.add_argument("--legendas", help="JSON com legendas já revisadas ([{texto,inicio,fim}]); mantém o som do --fundo")
    p.add_argument("--falado", action="store_true", help="tour com fala: mantém o som e legenda a fala")
    p.add_argument("--sem-final", action="store_true", help="com --logo, não adiciona a tela final")
    p.add_argument("--ajustes", help='JSON com ajustes, ex.: {"cartaoTopo": 1200, "corDestaque": "#F96830"}')
    a = p.parse_args()

    cartoes = ler_json(a.cartoes, "cartoes") if a.cartoes else []
    if not isinstance(cartoes, list):
        sys.exit("--cartoes precisa ser uma lista de cartões.")
    if not cartoes and not (a.texto or a.falado):
        sys.exit("Passe --cartoes, --texto ou --falado: sem nenhum deles o vídeo ficaria sem texto.")
    for i, c in enumerate(cartoes, 1):
        if not c.get("destaque"):
            sys.exit(f"Cartão {i} sem o campo destaque.")
    abertura = ler_json(a.abertura, "abertura") if a.abertura else None
    if abertura is not None and not abertura.get("destaque"):
        sys.exit("A abertura precisa do campo destaque.")

    marca = MARCAS[a.logo] if a.logo else {}
    if a.logo and not (RAIZ / "public" / marca["logoSrc"]).is_file():
        sys.exit(f"Falta a logo da marca: copie o PNG para public/{marca['logoSrc']}.")

    pasta = RAIZ / "public/videos" / a.nome
    pasta.mkdir(parents=True, exist_ok=True)
    fundo = pasta / "fundo.mp4"

    print("1/3 Clipe")
    if re.match(r"https?://", a.fundo):
        origem = pasta / "original.mp4"
        if not origem.exists():
            baixar(a.fundo, origem)
    else:
        origem = Path(a.fundo).resolve()

    disponivel = round(duracao(origem) - a.inicio, 2)
    tour = a.duracao if a.duracao else min(disponivel, DURACAO_MAXIMA)
    if tour > disponivel:
        sys.exit(f"O clipe só tem {disponivel} s a partir do segundo {a.inicio}; peça no máximo isso.")
    final = TELA_FINAL if a.logo and not a.sem_final else 0
    total = round(tour + final, 2)
    for i, c in enumerate(cartoes, 1):
        if c.get("entra", 0) >= tour:
            sys.exit(f"Cartão {i} entra em {c['entra']} s, depois do fim do tour ({tour} s).")
    print(f"   tour: {tour} s + tela final: {final} s = {total} s")
    # o clipe fica de fundo só no tour; a tela final preta cobre o resto
    if a.legendas and (a.falado or a.texto):
        sys.exit("Use --legendas sozinho (legendas já revisadas), sem --falado nem --texto.")
    if a.falado and a.texto:
        sys.exit("Use --falado (legenda a fala do tour) ou --texto (texto pronto), não os dois.")
    legendas, palavras = [], []
    if a.legendas:
        legendas = json.loads(Path(a.legendas).read_text(encoding="utf-8"))
        palavras = [{"texto": l["texto"], "inicio": l["inicio"], "fim": l["fim"]} for l in legendas]
        preparar_com_audio(origem, fundo, a.inicio, tour)
    elif a.texto:
        txt = Path(a.texto).read_text(encoding="utf-8") if Path(a.texto).is_file() else a.texto
        legendas, palavras = legendas_do_texto(txt, tour)
        preparar(origem, fundo, a.inicio, tour)
    elif a.falado:
        preparar_com_audio(origem, fundo, a.inicio, tour)
        print("   transcrevendo a fala (alguns minutos, em CPU)")
        legendas, palavras = legendas_da_fala(fundo, pasta / "fala.json")
    else:
        preparar(origem, fundo, a.inicio, tour)

    if palavras:
        achados = momentos_com_numero(palavras)
        if achados:
            print("   números/valores na fala (candidatos a cartão): "
                  + ", ".join(f'{w["texto"]} @{w["inicio"]:.1f}s' for w in achados))
    cartoes = sincronizar(cartoes, palavras)
    props = {
        "fundoSrc": f"videos/{a.nome}/fundo.mp4",
        "fundoInicio": 0,
        "duracaoSegundos": total,
        "cartoes": cartoes,
        "telaFinalSegundos": final,
        "comAudio": a.falado or bool(a.legendas),
        "legendas": legendas,
        **marca,
    }
    if abertura:
        props["abertura"] = abertura
    else:
        props["abertura"] = None
    if cartoes and legendas:
        props["legendaTopo"] = 1000  # legenda acima dos cartões
    if a.ajustes:
        props.update(json.loads(a.ajustes))
    props_json = pasta / "props.json"
    props_json.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")

    print("2/3 Render")
    saida = RAIZ / "out" / f"{a.nome}.mp4"
    saida.parent.mkdir(exist_ok=True)
    cmd = ["node", str(CLI), "render", "src/index.ts", "MostrandoCasas", str(saida),
           f"--props={props_json}", "--crf=23"]
    for tentativa, extra in enumerate(([], ["--concurrency=2"], ["--concurrency=1"]), 1):
        if subprocess.run(cmd + extra, cwd=RAIZ).returncode == 0:
            break
        if tentativa == 3:
            sys.exit("O render falhou 3 vezes. Feche outros programas (navegador, Slack...) "
                     "para liberar memória e tente de novo.")
        print(f"   falhou, tentando de novo com menos carga ({tentativa}/3)")

    print("3/3 Fluidez")
    subprocess.run([PY, "scripts/verificar_fluidez.py", str(saida)], check=True, cwd=RAIZ)
    print(f"\nPronto: {saida}")


if __name__ == "__main__":
    main()
