"""Monta um tour curto a partir de um vídeo longo: recorta trechos e acelera onde precisa.

Uso (a partir da raiz do projeto):
  python scripts/montar_tour.py --origem tour-longo.mp4 --saida public/videos/<nome>/montado.mp4 \
      --trechos '[{"inicio": 4, "duracao": 8, "vel": 1.5}, {"inicio": 56, "duracao": 24, "vel": 3}]'

Cada trecho: inicio (s do vídeo original), duracao (s do ORIGINAL a aproveitar) e vel (velocidade,
1 = normal; 2 = o dobro). A duração final de cada trecho é duracao / vel. Os trechos são
emendados na ordem. Vertical 1080x1920 a 30 fps, pronto para o --fundo do gerar_casas.py.
Som: por padrão cada trecho fica mudo. Com "som": true (só vale com vel 1) o trecho mantém a fala
original; o vídeo final sempre tem faixa de áudio (silêncio nos trechos mudos). Imprime a duração final e o minutagem de cada trecho no vídeo novo.
"""
import argparse
import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from gerar_broll import ffmpeg


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--origem", required=True)
    p.add_argument("--saida", required=True)
    p.add_argument("--trechos", required=True, help="JSON ou caminho de um .json")
    a = p.parse_args()

    txt = Path(a.trechos).read_text(encoding="utf-8") if Path(a.trechos).is_file() else a.trechos
    trechos = json.loads(txt)
    if not trechos:
        sys.exit("--trechos precisa ter pelo menos um trecho.")

    tmp = Path(tempfile.mkdtemp(prefix="tour_"))
    lista, t_final = [], 0.0
    try:
        for i, t in enumerate(trechos, 1):
            vel = float(t.get("vel", 1))
            if vel <= 0:
                sys.exit(f"Trecho {i}: vel precisa ser maior que 0.")
            dest = tmp / f"t{i:02d}.mp4"
            dur = t["duracao"] / vel
            # O ffmpeg do Remotion não tem o filtro setpts: a velocidade vem do -itsscale (na entrada).
            # Com ele, o -t conta o tempo já acelerado (duração de saída).
            som = bool(t.get("som"))
            if som and vel != 1:
                sys.exit(f"Trecho {i}: \"som\" só funciona com vel 1 (a fala acelerada fica ininteligível).")
            video = ["-vf", "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920",
                     "-c:v", "libx264", "-crf", "20", "-pix_fmt", "yuv420p", "-g", "15", "-keyint_min", "15"]
            audio = ["-c:a", "aac", "-b:a", "128k", "-ar", "48000", "-ac", "2"]
            if som:
                ffmpeg("-ss", t["inicio"], "-t", f"{dur:.3f}", "-i", a.origem, "-r", 30,
                       "-map", "0:v:0", "-map", "0:a:0", *video, *audio, dest)
            else:
                # silêncio com a mesma duração, para todos os trechos terem faixa de áudio
                ffmpeg("-ss", t["inicio"], "-itsscale", f"{1 / vel:.7f}", "-t", f"{dur:.3f}", "-i", a.origem,
                       "-f", "lavfi", "-t", f"{dur:.3f}", "-i", "anullsrc=r=48000:cl=stereo",
                       "-r", 30, "-map", "0:v:0", "-map", "1:a:0", *video, *audio, dest)
            print(f"   trecho {i}: original {t['inicio']}-{t['inicio'] + t['duracao']} s a {vel}x "
                  f"-> {t_final:.1f}-{t_final + dur:.1f} s no vídeo novo")
            t_final += dur
            lista.append(f"file '{dest.as_posix()}'")
        (tmp / "lista.txt").write_text("\n".join(lista), encoding="utf-8")
        saida = Path(a.saida)
        saida.parent.mkdir(parents=True, exist_ok=True)
        ffmpeg("-f", "concat", "-safe", 0, "-i", tmp / "lista.txt", "-c", "copy", saida)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    print(f"Pronto: {a.saida} ({t_final:.1f} s)")


if __name__ == "__main__":
    main()
