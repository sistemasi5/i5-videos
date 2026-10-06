"""Gera um vídeo do modelo "Vídeo B-roll informativo", de ponta a ponta.

Uso (a partir da raiz do projeto):
  python scripts/gerar_broll.py --nome financiamento-30-anos \
      --fundo caminho/clipe.mp4              (ou um link: Instagram, YouTube...)
      --blocos '[{"texto": "Os bancos esperam...", "cor": "vermelho"}, ...]'
      [--duracao 18] [--inicio 2] [--ajustes '{"areaTopo": 500}']

--blocos aceita o JSON direto ou o caminho de um arquivo .json. Cada bloco:
  texto (use \n para quebrar linha), cor ("branco" | "preto" | "vermelho"),
  entra (segundo em que aparece; omitido = desde o início), fonte ("sans" | "serifa").

Etapas: 1. baixa/corta o clipe  2. renderiza  3. confere a fluidez.
Saída: out/<nome>.mp4 (sem áudio: a música é escolhida no Instagram).
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
CLI = RAIZ / "node_modules/@remotion/cli/remotion-cli.js"
PY = sys.executable
EXT_VIDEO = {".mp4", ".webm", ".mkv", ".mov"}
DURACAO_MAXIMA = 20  # os modelos de B-roll têm de 15 a 20 s


def ffmpeg(*args):
    cmd = ["node", str(CLI), "ffmpeg", "-y", "-loglevel", "error", *map(str, args)]
    subprocess.run(cmd, check=True, cwd=RAIZ)


def duracao(arquivo):
    r = subprocess.run(
        ["node", str(CLI), "ffprobe", str(arquivo)],
        capture_output=True, text=True, cwd=RAIZ,
    )
    m = re.search(r"Duration: (\d+):(\d+):([\d.]+)", r.stdout + r.stderr)
    if not m:
        sys.exit(f"Não consegui ler a duração de {arquivo}")
    h, mi, s = m.groups()
    return round(int(h) * 3600 + int(mi) * 60 + float(s), 2)


def baixar(url, destino):
    """Baixa com yt-dlp. Se vier vídeo e áudio separados, junta sem recodificar."""
    tmp = Path(tempfile.mkdtemp(prefix="fundo_"))
    try:
        subprocess.run(
            [PY, "-m", "yt_dlp", "-f", "bv*+ba/b", "-o", str(tmp / "p.%(ext)s"), url],
            check=True,
        )
        arquivos = sorted(tmp.iterdir())
        videos = [a for a in arquivos if a.suffix in EXT_VIDEO]
        audios = [a for a in arquivos if a not in videos]
        if videos and audios:
            ffmpeg("-i", videos[0], "-i", audios[0], "-c", "copy", destino)
        elif videos:
            shutil.copyfile(videos[0], destino)
        else:
            sys.exit("O download não gerou nenhum vídeo.")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


def preparar(origem, destino, inicio, dur):
    """Corta o trecho e converte para H.264 vertical 1080x1920, 30 fps, sem som.
    Celular grava em HEVC/HDR a 60 fps: pesado e com cor errada no render."""
    ffmpeg(
        "-ss", inicio, "-t", dur, "-i", origem, "-an", "-r", 30,
        "-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
        "-c:v", "libx264", "-crf", "23", "-maxrate", "10M", "-bufsize", "20M",
        "-pix_fmt", "yuv420p", destino,
    )


def ler_blocos(valor):
    texto = Path(valor).read_text(encoding="utf-8") if Path(valor).is_file() else valor
    try:
        blocos = json.loads(texto)
    except json.JSONDecodeError as e:
        sys.exit(f"--blocos não é um JSON válido: {e}")
    if not isinstance(blocos, list) or not blocos:
        sys.exit("--blocos precisa ser uma lista com pelo menos um bloco.")
    for i, b in enumerate(blocos, 1):
        if not b.get("texto"):
            sys.exit(f"Bloco {i} sem texto.")
        if b.get("cor") not in ("branco", "preto", "vermelho"):
            sys.exit(f'Bloco {i}: cor deve ser "branco", "preto" ou "vermelho".')
    return blocos


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--nome", required=True, help="nome do vídeo (vira a pasta e o arquivo de saída)")
    p.add_argument("--fundo", required=True, help="clipe de fundo: arquivo ou link")
    p.add_argument("--blocos", required=True, help="JSON com os blocos de texto, ou caminho de um .json")
    p.add_argument("--duracao", type=float, help="duração final em segundos (padrão: o clipe, até 20 s)")
    p.add_argument("--inicio", type=float, default=0, help="segundo do clipe em que o vídeo começa (padrão: 0)")
    p.add_argument("--ajustes", help="JSON com ajustes, ex.: {\"areaTopo\": 500, \"tamanhoFonte\": 56}")
    a = p.parse_args()

    blocos = ler_blocos(a.blocos)
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
    dur = a.duracao if a.duracao else min(disponivel, DURACAO_MAXIMA)
    if dur > disponivel:
        sys.exit(f"O clipe só tem {disponivel} s a partir do segundo {a.inicio}; peça no máximo isso.")
    for i, b in enumerate(blocos, 1):
        if b.get("entra", 0) >= dur:
            sys.exit(f"Bloco {i} entra em {b['entra']} s, depois do fim do vídeo ({dur} s).")
    print(f"   duração do vídeo: {dur} s")
    preparar(origem, fundo, a.inicio, dur)

    props = {
        "fundoSrc": f"videos/{a.nome}/fundo.mp4",
        "fundoInicio": 0,
        "duracaoSegundos": dur,
        "blocos": blocos,
    }
    if a.ajustes:
        props.update(json.loads(a.ajustes))
    props_json = pasta / "props.json"
    props_json.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")

    print("2/3 Render")
    saida = RAIZ / "out" / f"{a.nome}.mp4"
    saida.parent.mkdir(exist_ok=True)
    cmd = ["node", str(CLI), "render", "src/index.ts", "BrollInformativo", str(saida),
           f"--props={props_json}", "--crf=23"]
    for tentativa in (1, 2):  # o render às vezes falha de forma intermitente
        if subprocess.run(cmd, cwd=RAIZ).returncode == 0:
            break
        if tentativa == 2:
            sys.exit("O render falhou duas vezes.")
        print("   falhou, tentando de novo")

    print("3/3 Fluidez")
    subprocess.run([PY, "scripts/verificar_fluidez.py", str(saida)], check=True, cwd=RAIZ)
    print(f"\nPronto: {saida}")


if __name__ == "__main__":
    main()
