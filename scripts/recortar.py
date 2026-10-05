"""Recorta o apresentador (remove o fundo por IA) e gera uma sequência de WebP
com transparência, um arquivo por quadro, numa pasta de public/.

Uso: python scripts/recortar.py <entrada.mp4> public/<nome>

Requer: pip install "rembg[cpu]" pillow   e   npm install (usa o ffmpeg do Remotion).
Rode a partir da raiz do projeto. Roda em CPU: ~1 s por quadro.

Por que imagens e não WebM com transparência: no render do Remotion o WebM falha
de forma intermitente (quadros fora de ordem, "No frame found at position").
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

FPS = 30
REMOTION_CLI = Path("node_modules/@remotion/cli/remotion-cli.js")


def ffmpeg(*args):
    # Sem shell: o cmd do Windows altera padrões como %05d.
    cmd = ["node", str(REMOTION_CLI), "ffmpeg", "-y", "-loglevel", "error", *map(str, args)]
    subprocess.run(cmd, check=True)


def main(entrada, saida):
    entrada, saida = Path(entrada), Path(saida)
    work = Path(tempfile.mkdtemp(prefix="recorte_"))
    src = work / "src"
    src.mkdir()
    try:
        # O ffmpeg do Remotion não tem o filtro fps; -r já normaliza a taxa.
        ffmpeg("-i", entrada, "-r", FPS, src / "%05d.png")
        frames = sorted(src.glob("*.png"))
        session = new_session("u2net_human_seg")
        saida.mkdir(parents=True, exist_ok=True)
        for i, f in enumerate(frames, 1):
            recorte = remove(Image.open(f), session=session)
            recorte.save(saida / f"{f.stem}.webp", "WEBP", quality=90, method=4)
            if i % 25 == 0 or i == len(frames):
                print(f"{i}/{len(frames)}", flush=True)
        print("ok", saida, f"({len(frames)} quadros)")
    finally:
        shutil.rmtree(work, ignore_errors=True)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
