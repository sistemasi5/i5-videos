"""Gera um vídeo do modelo "Depoimento animado" (bonequinhos ilustrando o que a pessoa conta).

Uso (a partir da raiz do projeto):
  python scripts/gerar_depoimento.py --nome depoimento-rafael \
      --video caminho/depoimento.mp4 --roteiro caminho/roteiro.json [--logo] [--so-props]

O vídeo original só fornece o ÁUDIO. O roteiro (.json) diz quais trechos da fala entram e qual
cena ilustra cada um:

{
  "depoente": "Rafael", "mentor": "Felipe", "subtitulo": "aluno da Traction",
  "correcoes": [{"em": 15.96, "texto": "deal"}, {"em": 16.32, "texto": ""}],
  "cenas": [
    {"tipo": "chegada", "trechos": [[6.45, 12.8]],
     "textos": {"tempo": "1 MÊS"}, "momentos": {"mes": "mês"}},
    {"tipo": "desconto", "trechos": [[53.55, 64.05], [64.8, 66.05, "mentor"]],
     "momentos": {"listada": "460", "fechando": "320", "caraca": "Caraca"}}
  ]
}

- trechos: [início, fim] em segundos do vídeo original; um 3º item "mentor" marca que quem fala
  ali é o mentor (a legenda mostra o nome dele).
- momentos: palavra que dispara cada animação da cena (a 1ª vez que ela aparece na cena).
- correcoes: troca a palavra que começa no segundo "em" (o Whisper erra nomes e termos em
  inglês); texto "" apaga a palavra.
- Tipos de cena e seus textos: veja .claude/skills/depoimento-animado/SKILL.md.

A transcrição fica em cache em public/videos/<nome>/palavras.json (apague para refazer).
Saída: out/<nome>.mp4.
"""
import argparse
import json
import subprocess
import sys
import unicodedata
from pathlib import Path

from gerar_broll import CLI, PY, RAIZ, ffmpeg

INICIO = 0.4  # silêncio antes da primeira fala (a cena aparece primeiro)
PAUSA = 0.2  # silêncio entre trechos
CAUDA = 1.2  # tempo depois da última fala
TELA_FINAL = 2.5


def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    return "".join(c for c in t if c.isalnum() and not unicodedata.combining(c))


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--nome", required=True)
    p.add_argument("--video", required=True, help="vídeo (ou áudio) original do depoimento")
    p.add_argument("--roteiro", required=True, help="JSON com cenas e trechos")
    p.add_argument("--logo", action="store_true", help="termina com tela preta e a logo da Traction")
    p.add_argument("--so-props", action="store_true", help="só gera o props.json (para ver no Studio)")
    a = p.parse_args()

    roteiro = json.loads(Path(a.roteiro).read_text(encoding="utf-8"))
    pasta = RAIZ / "public/videos" / a.nome
    pasta.mkdir(parents=True, exist_ok=True)

    print("1/4 Áudio")
    audio = pasta / "audio.m4a"
    if not audio.exists():
        ffmpeg("-i", Path(a.video).resolve(), "-vn", "-c:a", "aac", "-b:a", "192k", "-f", "mp4", audio)

    print("2/4 Transcrição")
    cache = pasta / "palavras.json"
    if not cache.exists():
        print("   transcrevendo (alguns minutos, em CPU)")
        subprocess.run([PY, "scripts/transcrever.py", str(audio), str(cache), "pt"], check=True, cwd=RAIZ)
    originais = json.loads(cache.read_text(encoding="utf-8"))
    for c in roteiro.get("correcoes", []):
        alvo = min(originais, key=lambda w: abs(w["inicio"] - c["em"]))
        if abs(alvo["inicio"] - c["em"]) > 0.15:
            sys.exit(f"Correção em {c['em']} s: nenhuma palavra começa nesse segundo.")
        alvo["texto"] = c["texto"]
    originais = [w for w in originais if w["texto"]]

    print("3/4 Montagem")
    trechos, palavras, cenas = [], [], []
    agora = INICIO
    for ci, cena in enumerate(roteiro["cenas"]):
        inicio_cena = 0 if ci == 0 else agora - PAUSA / 2
        palavras_cena = []
        for tr in cena["trechos"]:
            ini, fim = tr[0], tr[1]
            quem = tr[2] if len(tr) > 2 else "depoente"
            desloc = agora - ini
            trechos.append({"origem": ini, "dur": round(fim - ini, 3), "inicio": round(agora, 3)})
            for w in originais:
                meio = (w["inicio"] + w["fim"]) / 2
                if ini <= meio < fim:
                    nova = {
                        "texto": w["texto"],
                        "inicio": round(max(w["inicio"], ini) + desloc, 3),
                        "fim": round(min(w["fim"], fim) + desloc, 3),
                        "quem": quem,
                    }
                    palavras.append(nova)
                    palavras_cena.append(nova)
            agora += fim - ini + PAUSA
        momentos = {}
        for chave, valor in cena.get("momentos", {}).items():
            if isinstance(valor, (int, float)):
                momentos[chave] = valor
                continue
            alvo, _, n = valor.partition("#")
            achadas = [w for w in palavras_cena if norm(w["texto"]).startswith(norm(alvo))]
            n = int(n or 1)
            if len(achadas) < n:
                sys.exit(f'Cena {ci + 1} ({cena["tipo"]}): a palavra "{valor}" não aparece nos trechos dela.')
            momentos[chave] = round(achadas[n - 1]["inicio"] - inicio_cena, 3)
        cenas.append({"tipo": cena["tipo"], "inicio": round(inicio_cena, 3), "textos": cena.get("textos", {}), "momentos": momentos})
    fim_falas = agora - PAUSA + CAUDA
    for i, c in enumerate(cenas):
        c["fim"] = cenas[i + 1]["inicio"] if i + 1 < len(cenas) else round(fim_falas, 3)
    tela_final = TELA_FINAL if a.logo else 0
    duracao = round(fim_falas + tela_final, 2)
    print(f"   {len(trechos)} trechos, {len(cenas)} cenas, {duracao} s")

    props = {
        "audioSrc": f"videos/{a.nome}/audio.m4a",
        "trechos": trechos,
        "duracaoSegundos": duracao,
        "palavras": palavras,
        "cenas": cenas,
        "nomeDepoente": roteiro.get("depoente", ""),
        "nomeMentor": roteiro.get("mentor", "Felipe"),
        "subtitulo": roteiro.get("subtitulo", ""),
        "telaFinalSegundos": tela_final,
        "logoSrc": "brand/traction-logo.png",
        "mostrarGuias": False,
    }
    props_json = pasta / "props.json"
    props_json.write_text(json.dumps(props, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"   props: {props_json}")
    if a.so_props:
        return

    print("4/4 Render")
    saida = RAIZ / "out" / f"{a.nome}.mp4"
    saida.parent.mkdir(exist_ok=True)
    cmd = ["node", str(CLI), "render", "src/index.ts", "DepoimentoAnimado", str(saida), f"--props={props_json}", "--crf=20"]
    for tentativa, extra in enumerate(([], ["--concurrency=2"], ["--concurrency=1"]), 1):
        if subprocess.run(cmd + extra, cwd=RAIZ).returncode == 0:
            break
        if tentativa == 3:
            sys.exit("O render falhou 3 vezes. Feche outros programas e tente de novo.")
        print(f"   falhou, tentando de novo com menos carga ({tentativa}/3)")
    print(f"\nPronto: {saida}")


if __name__ == "__main__":
    main()
