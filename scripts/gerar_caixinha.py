"""Gera um vídeo do modelo "Caixinha de perguntas" (resposta a uma pergunta de seguidor).

Uso (a partir da raiz do projeto):
  python scripts/gerar_caixinha.py --nome flip-processo \
      --fundo caminho/resposta.mp4              (ou um link)
      --pergunta "Felipe, como você decide se um imóvel vale o flip ou não?" \
      [--selos '[{"texto":"AULA","quando":"aula"}]'] [--legendas legendas.json] \
      [--duracao 60] [--inicio 0] [--ajustes '{"caixaTopo": 1100}']

A pessoa responde falando para a câmera. O vídeo mantém o SOM, transcreve a fala (Whisper) e
legenda; a pergunta fica fixa na caixinha durante o vídeo todo.
--selos: caixas vermelhas com uma palavra de destaque (ex.: AULA). "quando": "palavra" faz o selo
  entrar quando essa palavra é dita; ele fica até o fim (ou use "sai", em segundos).
--legendas: caminho de um .json com as legendas já revisadas ([{"texto","inicio","fim"}]). Sem ele,
  o script transcreve e salva a transcrição em public/videos/<nome>/legendas.json para você revisar
  (o Whisper erra palavras) e rodar de novo com --legendas.
Sem logo: o modelo não usa logo nem tela final.
Saída: out/<nome>.mp4.
"""
import argparse
import json
import re
import subprocess
import sys
from pathlib import Path

from gerar_broll import CLI, PY, RAIZ, baixar, duracao
from gerar_casas import legendas_da_fala, momentos_com_numero, preparar_com_audio, sincronizar

DURACAO_MAXIMA = 120  # o reel de referência tem ~99 s


def ler_json(valor, nome):
    texto = Path(valor).read_text(encoding="utf-8") if Path(valor).is_file() else valor
    try:
        return json.loads(texto)
    except json.JSONDecodeError as e:
        sys.exit(f"--{nome} não é um JSON válido: {e}")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--nome", required=True, help="nome do vídeo (vira a pasta e o arquivo de saída)")
    p.add_argument("--fundo", required=True, help="vídeo de quem responde: arquivo ou link")
    p.add_argument("--pergunta", required=True, help="texto da pergunta que aparece na caixinha")
    p.add_argument("--selos", help="JSON com os selos vermelhos (opcional)")
    p.add_argument("--legendas", help="JSON com legendas já revisadas (pula a transcrição)")
    p.add_argument("--duracao", type=float, help="duração em segundos (padrão: o vídeo todo, até 120 s)")
    p.add_argument("--inicio", type=float, default=0, help="segundo do vídeo em que começa")
    p.add_argument("--ajustes", help='JSON com ajustes, ex.: {"caixaTopo": 1100, "legendaTopo": 990}')
    a = p.parse_args()

    selos = ler_json(a.selos, "selos") if a.selos else []
    pasta = RAIZ / "public/videos" / a.nome
    pasta.mkdir(parents=True, exist_ok=True)
    fundo = pasta / "fundo.mp4"

    print("1/3 Vídeo")
    if re.match(r"https?://", a.fundo):
        origem = pasta / "original.mp4"
        if not origem.exists():
            baixar(a.fundo, origem)
    else:
        origem = Path(a.fundo).resolve()
    disponivel = round(duracao(origem) - a.inicio, 2)
    dur = a.duracao if a.duracao else min(disponivel, DURACAO_MAXIMA)
    if dur > disponivel:
        sys.exit(f"O vídeo só tem {disponivel} s a partir do segundo {a.inicio}.")
    print(f"   duração: {dur} s")
    preparar_com_audio(origem, fundo, a.inicio, dur)

    legendas_json = pasta / "legendas.json"
    if a.legendas:
        legendas = json.loads(Path(a.legendas).read_text(encoding="utf-8"))
        palavras = [{"texto": l["texto"], "inicio": l["inicio"], "fim": l["fim"]} for l in legendas]
        print(f"   legendas revisadas: {len(legendas)} (sem transcrever)")
    else:
        print("   transcrevendo a fala (alguns minutos, em CPU)")
        legendas, palavras = legendas_da_fala(fundo, pasta / "fala.json")
        legendas_json.write_text(json.dumps(legendas, ensure_ascii=False, indent=1), encoding="utf-8")
        print(f"   legendas salvas em {legendas_json} (revise e use --legendas para corrigir erros)")

    # selos: "quando" procura a palavra na fala; sem "sai", ficam até o fim
    for s in selos:
        if "quando" in s and "sai" not in s:
            s.setdefault("dura", 9999)
    selos = sincronizar(selos, palavras, antecedencia=0.2)
    for s in selos:
        s.setdefault("entra", 0)
        if s.get("sai", 0) >= dur:
            s.pop("sai")

    props = {
        "fundoSrc": f"videos/{a.nome}/fundo.mp4",
        "fundoInicio": 0,
        "duracaoSegundos": dur,
        "pergunta": a.pergunta,
        "comAudio": True,
        "legendas": legendas,
        "selos": selos,
    }
    if a.ajustes:
        props.update(json.loads(a.ajustes))
    props_json = pasta / "props.json"
    props_json.write_text(json.dumps(props, ensure_ascii=False), encoding="utf-8")

    print("2/3 Render")
    saida = RAIZ / "out" / f"{a.nome}.mp4"
    saida.parent.mkdir(exist_ok=True)
    cmd = ["node", str(CLI), "render", "src/index.ts", "CaixinhaPerguntas", str(saida),
           f"--props={props_json}", "--crf=23"]
    for tentativa, extra in enumerate(([], ["--concurrency=2"], ["--concurrency=1"]), 1):
        if subprocess.run(cmd + extra, cwd=RAIZ).returncode == 0:
            break
        if tentativa == 3:
            sys.exit("O render falhou 3 vezes. Feche outros programas e tente de novo.")
        print(f"   falhou, tentando de novo com menos carga ({tentativa}/3)")

    print("3/3 Fluidez")
    subprocess.run([PY, "scripts/verificar_fluidez.py", str(saida)], check=True, cwd=RAIZ)
    print(f"\nPronto: {saida}")


if __name__ == "__main__":
    main()
