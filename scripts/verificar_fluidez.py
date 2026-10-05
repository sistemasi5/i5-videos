"""Conta quadros repetidos em sequencia num video (sinal de travamento).

Uso: python scripts/verificar_fluidez.py <video.mp4>
Rode a partir da raiz do projeto.
"""
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image

CLI = Path("node_modules/@remotion/cli/remotion-cli.js")


def main(video):
    work = Path(tempfile.mkdtemp(prefix="fluidez_"))
    try:
        subprocess.run(
            ["node", str(CLI), "ffmpeg", "-y", "-loglevel", "error", "-i", video,
             "-vf", "scale=135:240", str(work / "%05d.png")],
            check=True,
        )
        frames = [
            np.asarray(Image.open(f).convert("L"), dtype=np.float32)
            for f in sorted(work.glob("*.png"))
        ]
    finally:
        shutil.rmtree(work, ignore_errors=True)

    d = lambda a, b: float(np.abs(a - b).mean())
    repetidos = sum(d(a, b) < 0.01 for a, b in zip(frames, frames[1:]))
    # quadro fora de ordem: i-1 e i+1 ficam mais parecidos entre si do que com i
    voltas = sum(
        d(frames[i - 1], frames[i + 1]) < 0.5 * min(d(frames[i - 1], frames[i]), d(frames[i], frames[i + 1]))
        and min(d(frames[i - 1], frames[i]), d(frames[i], frames[i + 1])) > 1.0
        for i in range(1, len(frames) - 1)
    )
    print(f"{video}: {len(frames)} quadros | repetidos: {repetidos} | fora de ordem: {voltas}")


if __name__ == "__main__":
    main(sys.argv[1])
