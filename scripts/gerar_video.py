"""Gera um vídeo do modelo Green Screen React, de ponta a ponta.

Uso (a partir da raiz do projeto):
  python scripts/gerar_video.py --nome casa-orlando \\
      --apresentador caminho/apresentador.mp4 \\
      --fundo caminho/fundo.mp4              (ou um link: Instagram, YouTube...)
      [--cta1 "Traction · Mentoria" --cta2 "Subindo de nível"] [--cta-inicio 19]
      [--ajustes '{"legendaY": 900}']

Etapas (cada uma é pulada se o resultado já existe em public/videos/<nome>/):
  1. copia/baixa os vídeos           2. recorta o apresentador por IA (~1 s/quadro)
  3. transcreve a fala (legendas)    4. renderiza   5. confere a fluidez

Saída: out/<nome>.mp4
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


def copiar(origem, destino):
    origem, destino = Path(origem).resolve(), Path(destino).resolve()
    if origem != destino:
        shutil.copyfile(origem, destino)


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


def rodar(*args):
    subprocess.run([PY, *map(str, args)], check=True, cwd=RAIZ)


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--nome", required=True, help="nome do vídeo (vira a pasta e o arquivo de saída)")
    p.add_argument("--apresentador", required=True, help="vídeo do apresentador (gravado)")
    p.add_argument("--fundo", required=True, help="vídeo de fundo: arquivo ou link")
    p.add_argument("--cta1", help="CTA, linha de cima")
    p.add_argument("--cta2", help="CTA, linha de baixo (a oferta, em destaque)")
    p.add_argument("--cta-inicio", type=float, help="segundo em que o CTA entra (padrão: últimos 6 s)")
    p.add_argument("--idioma", default="pt", help="idioma da fala (padrão: pt)")
    p.add_argument("--ajustes", help="JSON com ajustes, ex.: {\"legendaY\": 900, \"apresentadorLargura\": 0.6}")
    a = p.parse_args()

    pasta = RAIZ / "public/videos" / a.nome
    pasta.mkdir(parents=True, exist_ok=True)
    rel = f"videos/{a.nome}"
    apres, fundo = pasta / "apresentador.mp4", pasta / "fundo.mp4"
    quadros, legendas = pasta / "quadros", pasta / "legendas.json"

    print("1/5 Vídeos")
    if not apres.exists():
        copiar(a.apresentador, apres)
    if not fundo.exists():
        if re.match(r"https?://", a.fundo):
            baixar(a.fundo, fundo)
        else:
            copiar(a.fundo, fundo)

    print("2/5 Recorte do apresentador (leva uns minutos)")
    if not list(quadros.glob("*.webp")):
        rodar("scripts/recortar.py", apres, quadros)
    else:
        print("   já existe, pulando")

    print("3/5 Legendas")
    if not legendas.exists():
        rodar("scripts/transcrever.py", apres, legendas, a.idioma)
    else:
        print("   já existe, pulando")

    dur = duracao(apres)
    cta = None
    if a.cta1 or a.cta2:
        cta = {"linha1": a.cta1 or "", "linha2": a.cta2 or ""}
        if a.cta_inicio is not None:
            cta["inicio"] = a.cta_inicio
    props = {
        "fundoSrc": f"{rel}/fundo.mp4",
        "apresentadorQuadros": f"{rel}/quadros",
        "audioSrc": f"{rel}/apresentador.mp4",
        "duracaoSegundos": dur,
        "fundoDuracaoSegundos": duracao(fundo),
        "palavras": json.loads(legendas.read_text(encoding="utf-8")),
        "cta": cta,
    }
    if a.ajustes:
        props.update(json.loads(a.ajustes))
    props_json = pasta / "props.json"
    props_json.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")

    print("4/5 Render")
    saida = RAIZ / "out" / f"{a.nome}.mp4"
    saida.parent.mkdir(exist_ok=True)
    cmd = ["node", str(CLI), "render", "src/index.ts", "GreenScreenReact", str(saida),
           f"--props={props_json}"]
    for tentativa in (1, 2):  # o render às vezes falha de forma intermitente
        if subprocess.run(cmd, cwd=RAIZ).returncode == 0:
            break
        if tentativa == 2:
            sys.exit("O render falhou duas vezes.")
        print("   falhou, tentando de novo")

    print("5/5 Fluidez")
    rodar("scripts/verificar_fluidez.py", saida)
    print(f"\nPronto: {saida}")


if __name__ == "__main__":
    main()
