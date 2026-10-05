"""Transcreve a fala e salva as palavras com tempo (JSON) para as legendas.

Uso: python scripts/transcrever.py <video.mp4> <saida.json> [idioma]
Requer: pip install faster-whisper. Roda em CPU.
"""
import json
import sys

from faster_whisper import WhisperModel


def main(entrada, saida, idioma="pt"):
    modelo = WhisperModel("small", device="cpu", compute_type="int8")
    segmentos, _ = modelo.transcribe(entrada, language=idioma, word_timestamps=True)
    palavras = [
        {"texto": w.word.strip(), "inicio": round(w.start, 2), "fim": round(w.end, 2)}
        for s in segmentos
        for w in s.words
    ]
    with open(saida, "w", encoding="utf-8") as f:
        json.dump(palavras, f, ensure_ascii=False, indent=1)
    print(len(palavras), "palavras")


if __name__ == "__main__":
    main(*sys.argv[1:4])
