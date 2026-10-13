#!/usr/bin/env python3
"""Ingestão de um anúncio do Zillow pela API da Bright Data (substitui o Apify).

Uso (a partir da raiz do projeto i5-videos):
  python .claude/skills/re-walkthrough-pro/scripts/ingest_brightdata.py --url <link do anúncio>
  python .../ingest_brightdata.py --url <link> --raw-json resposta.json   (reaproveita uma resposta salva)

O que faz:
  1. POST https://api.brightdata.com/datasets/v3/scrape (dataset gd_lfqkr8wm13ixtbd8f5, modo síncrono)
     com Bearer BRIGHTDATA_API_KEY (lida do ambiente ou do .env da raiz do projeto).
     Se a API devolver um snapshot (resposta assíncrona), espera e baixa o resultado.
  2. Salva a resposta em listing-walkthroughs/<slug>/brightdata-raw.json.
  3. Baixa as fotos (maior resolução de cada uma) para source-images/NN-original.jpg.
  4. Escreve PROPERTY.md (endereço, preço, quartos, banheiros, metragem, ano, status, corretor).
A chave NUNCA é impressa nem gravada em arquivo versionado.
"""
import argparse
import json
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

DATASET_ID = "gd_lfqkr8wm13ixtbd8f5"
API = "https://api.brightdata.com/datasets/v3"
RAIZ = Path.cwd()


def chave():
    k = os.environ.get("BRIGHTDATA_API_KEY")
    env = RAIZ / ".env"
    if not k and env.is_file():
        m = re.search(r"^BRIGHTDATA_API_KEY=(.+)$", env.read_text(encoding="utf-8"), re.M)
        k = m.group(1).strip() if m else None
    if not k:
        sys.exit("Falta BRIGHTDATA_API_KEY (no ambiente ou no .env da raiz do projeto).")
    return k


def requisicao(metodo, caminho, k, corpo=None):
    req = urllib.request.Request(
        API + caminho,
        data=json.dumps(corpo).encode() if corpo is not None else None,
        headers={"Authorization": "Bearer " + k, "Content-Type": "application/json"},
        method=metodo,
    )
    try:
        with urllib.request.urlopen(req, timeout=240) as r:
            return r.status, r.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode("utf-8", "replace")


def buscar(url, k):
    q = urllib.parse.urlencode(
        {"dataset_id": DATASET_ID, "notify": "false", "include_errors": "true", "format": "json"}
    )
    status, corpo = requisicao("POST", f"/scrape?{q}", k, [{"url": url}])
    if status == 202:  # resposta assíncrona: devolveu um snapshot_id
        snap = json.loads(corpo).get("snapshot_id")
        for _ in range(60):
            time.sleep(5)
            s, c = requisicao("GET", f"/progress/{snap}", k)
            if s == 200 and json.loads(c).get("status") == "ready":
                status, corpo = requisicao("GET", f"/snapshot/{snap}?format=json", k)
                break
        else:
            sys.exit(f"Snapshot {snap} não ficou pronto em 5 min.")
    if status != 200:
        sys.exit(f"Bright Data respondeu HTTP {status}: {corpo[:300]}")
    return corpo


def primeiro(d, *chaves):
    for c in chaves:
        if isinstance(d, dict) and d.get(c) not in (None, "", []):
            return d[c]
    return None


def endereco(d):
    a = d.get("address")
    if isinstance(a, dict):
        partes = [a.get("streetAddress"), a.get("city"), a.get("state"), a.get("zipcode")]
        return ", ".join(str(p) for p in partes if p)
    if isinstance(a, str) and a:
        return a
    partes = [d.get("streetAddress"), d.get("city"), d.get("state"), d.get("zipcode")]
    return ", ".join(str(p) for p in partes if p) or None


def fotos(d):
    """URLs photos.zillowstatic.com do registro, na ordem, uma por foto (a de maior resolução)."""
    texto = json.dumps(d, ensure_ascii=False)
    achadas = re.findall(r"https://photos\.zillowstatic\.com/[^\s\"'\\]+?\.(?:jpg|jpeg|webp)", texto)
    ordem, melhor = [], {}
    for u in achadas:
        base = re.sub(r"-[A-Za-z0-9_]+\.(?:jpg|jpeg|webp)$", "", u)  # hash da foto
        m = re.search(r"_(\d{3,4})\.", u)
        tam = int(m.group(1)) if m else 0
        if base not in melhor:
            ordem.append(base)
        if tam >= melhor.get(base, (-1, ""))[0]:
            melhor[base] = (tam, u)
    return [melhor[b][1] for b in ordem]


def slug(end, zpid):
    return re.sub(r"[^a-z0-9]+", "-", (end or f"zpid-{zpid}").lower()).strip("-")


def main():
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawTextHelpFormatter)
    p.add_argument("--url", required=True, help="link do anúncio no Zillow")
    p.add_argument("--raw-json", help="usa uma resposta já salva em vez de chamar a API")
    p.add_argument("--saida", default="listing-walkthroughs", help="pasta raiz de saída")
    a = p.parse_args()

    corpo = Path(a.raw_json).read_text(encoding="utf-8") if a.raw_json else buscar(a.url, chave())
    dados = json.loads(corpo)
    reg = dados[0] if isinstance(dados, list) and dados else dados
    if not isinstance(reg, dict) or not reg:
        sys.exit("A API não devolveu nenhum registro para esse link.")
    if reg.get("error"):
        sys.exit(f"A Bright Data devolveu erro para o link: {reg.get('error')}")

    end = endereco(reg)
    achou = re.search(r"/(\d+)_zpid", a.url)
    zpid = primeiro(reg, "zpid") or (achou.group(1) if achou else "")
    pasta = RAIZ / a.saida / slug(end, zpid)
    for sub in ("source-images", "scenes", "final"):
        (pasta / sub).mkdir(parents=True, exist_ok=True)
    (pasta / "brightdata-raw.json").write_text(json.dumps(dados, ensure_ascii=False, indent=1), encoding="utf-8")

    urls = fotos(reg)
    baixadas, falhas = 0, []
    for i, u in enumerate(urls, 1):
        destino = pasta / "source-images" / f"{i:02d}-original.jpg"
        try:
            with urllib.request.urlopen(urllib.request.Request(u), timeout=60) as r:
                destino.write_bytes(r.read())
            baixadas += 1
        except Exception as e:  # noqa: BLE001
            falhas.append((i, str(e)[:60]))

    corretor = primeiro(reg, "agentName", "listingAgent", "attributionInfo")
    if isinstance(corretor, dict):
        corretor = ", ".join(str(v) for v in corretor.values() if v)
    linhas = [
        f"# {end or a.url}",
        "",
        f"- **Link:** {a.url}",
        f"- **Preço:** {primeiro(reg, 'price', 'listPrice') or 'n/d'}",
        f"- **Quartos:** {primeiro(reg, 'bedrooms') or 'n/d'}",
        f"- **Banheiros:** {primeiro(reg, 'bathrooms') or 'n/d'}",
        f"- **Área (sqft):** {primeiro(reg, 'livingArea', 'livingAreaValue') or 'n/d'}",
        f"- **Ano:** {primeiro(reg, 'yearBuilt') or 'n/d'}",
        f"- **Status:** {primeiro(reg, 'homeStatus', 'status') or 'n/d'}",
        f"- **Tipo:** {primeiro(reg, 'homeType') or 'n/d'}",
        f"- **Corretor:** {corretor or 'n/d'}",
        f"- **Fonte dos dados:** Bright Data (dataset {DATASET_ID})",
        f"- **Fotos baixadas:** {baixadas} de {len(urls)}",
        "",
        "## Escolhas criativas desta rodada",
        "(preencher na curadoria: estilo, cômodos, proporção, engine)",
        "",
        "## Fotos removidas (texto gravado)",
        "(registrar aqui)",
    ]
    (pasta / "PROPERTY.md").write_text("\n".join(linhas) + "\n", encoding="utf-8")
    print(f"Pasta: {pasta}")
    print(f"Endereço: {end} | fotos: {baixadas}/{len(urls)} | falhas: {falhas or 'nenhuma'}")
    if not urls:
        print("ATENÇÃO: nenhuma URL photos.zillowstatic.com no retorno; confira brightdata-raw.json.")


if __name__ == "__main__":
    main()
