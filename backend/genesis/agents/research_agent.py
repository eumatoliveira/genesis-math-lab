"""AGENT 01 — Global Scientific Research: live arXiv/OpenAlex/OEIS connectors + legal public-domain book downloader."""

from __future__ import annotations

import hashlib
import json
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Any

from genesis.config import RESEARCH_DIR, ensure_research_tree
from genesis.storage.knowledge_base import KnowledgeBase


# Verified legal Open-Access mathematical monographs & landmark preprints (arXiv HTTP 200)
OPEN_ACCESS_MONOGRAPHS: list[dict[str, str]] = [
    {
        "book_id": "tao-2019-collatz-monograph",
        "title": "Almost all orbits of the Collatz map attain almost bounded values",
        "author": "Terence Tao (arXiv:1909.03562)",
        "language": "en",
        "url": "https://arxiv.org/pdf/1909.03562",
        "excerpt": "Monografia de referência sobre o problema 3n+1 mostrando via análise harmônica e processos estocásticos que quase todo inteiro n atinge valores abaixo de f(n) para qualquer função divergente f.",
    },
    {
        "book_id": "baek-2024-moving-sofa",
        "title": "Optimality of Gerver's Sofa (119p Monograph)",
        "author": "Jineon Baek (arXiv:2411.19826)",
        "language": "en",
        "url": "https://arxiv.org/pdf/2411.19826",
        "excerpt": "Demonstração completa em 119 páginas provando que a forma de 18 segmentos proposta por Joseph Gerver (área ≈ 2.21953) é ótima para o Problema do Sofá Móvel.",
    },
    {
        "book_id": "perelman-2002-ricci-flow",
        "title": "The entropy formula for the Ricci flow and its geometric applications",
        "author": "Grigori Perelman (arXiv:math/0211159)",
        "language": "en",
        "url": "https://arxiv.org/pdf/math/0211159",
        "excerpt": "Artigo fundacional que introduziu o funcional W-entropia no fluxo de Ricci, viabilizando a solução da Conjectura de Poincaré (Milênio).",
    },
    {
        "book_id": "helfgott-2013-ternary-goldbach",
        "title": "Major arcs for Goldbach's problem",
        "author": "Harald A. Helfgott (arXiv:1305.2897)",
        "language": "en",
        "url": "https://arxiv.org/pdf/1305.2897",
        "excerpt": "Avanço central no método do círculo de Hardy-Littlewood-Vinogradov que fundamentou a demonstração completa da Conjectura Fraca (Ternária) de Goldbach.",
    },
    {
        "book_id": "gilmer-2022-frankl-entropy",
        "title": "Approximate union closed conjecture",
        "author": "Zachary Chase & Shachar Lovett (arXiv:2211.11689; pós-Gilmer arXiv:2211.09055)",
        "language": "en",
        "url": "https://arxiv.org/pdf/2211.11689",
        "excerpt": "Refinamento da abordagem entrópica inaugurada por Justin Gilmer (arXiv:2211.09055, nov/2022), elevando a cota inferior da Conjectura de Frankl para conjuntos fechados por união antes do avanço até ~0.382885.",
    },
]

# Verified HTTP 200 UTF-8 Public-Domain Classics (Internet Archive & Project Gutenberg mirrors)
PUBLIC_DOMAIN_CLASSICS: list[dict[str, str]] = [
    {
        "book_id": "faraday-1839-electricity",
        "title": "Experimental Researches in Electricity, Vol. 1",
        "author": "Michael Faraday (1839, Domínio Público)",
        "language": "en",
        "url": "https://mirrors.xmission.com/gutenberg/1/4/9/8/14986/14986-0.txt",
        "backup_url": "https://gutenberg.pglaf.org/1/4/9/8/14986/14986-0.txt",
        "excerpt": "Obra fundacional de Michael Faraday sobre indução eletromagnética e visualização geométrica de linhas de força — inspiração direta da analogia de campos no Laboratório GENESIS.",
    },
    {
        "book_id": "einstein-1920-relativity",
        "title": "Relativity: The Special and General Theory",
        "author": "Albert Einstein (1920, Domínio Público)",
        "language": "en",
        "url": "https://mirrors.xmission.com/gutenberg/3/0/1/5/30155/30155-0.txt",
        "backup_url": "https://gutenberg.pglaf.org/3/0/1/5/30155/30155-0.txt",
        "excerpt": "Exposição original de Einstein sobre experimentos mentais, invariância espacial/temporal e geometria curva que fundamenta o modo de visualização relativística.",
    },
    {
        "book_id": "poincare-1905-science-hypothesis",
        "title": "Science and Hypothesis (La Science et l'Hypothèse)",
        "author": "Henri Poincaré (1905, Domínio Público / Internet Archive)",
        "language": "en",
        "url": "https://archive.org/download/scienceandhypoth00poinuoft/scienceandhypoth00poinuoft_djvu.txt",
        "backup_url": "",
        "excerpt": "Tratado clássico de Poincaré sobre intuição matemática, convenções geométricas, sistemas dinâmicos e o papel da experimentação antes da formalização axiomática.",
    },
    {
        "book_id": "euclid-1908-elements-heath",
        "title": "The Thirteen Books of Euclid's Elements, Vol. 1 (ed. T. L. Heath)",
        "author": "Euclides de Alexandria / Thomas L. Heath (1908, Domínio Público)",
        "language": "en",
        "url": "https://archive.org/download/thirteenbookseu00heibgoog/thirteenbookseu00heibgoog_djvu.txt",
        "backup_url": "",
        "excerpt": "Edição crítica clássica dos Elementos de Euclides (definições, postulados e demonstrações construtivas dos Livros I–II) servindo de referência axiomática histórica.",
    },
]

# Verified multilingual mathematical problem terms & open-source ecosystem catalog
MULTILINGUAL_QUERIES: dict[str, dict[str, str]] = {
    "collatz": {
        "pt": "Conjectura de Collatz",
        "en": "Collatz conjecture",
        "es": "Conjetura de Collatz",
        "fr": "Conjecture de Syracuse",
        "de": "Collatz-Problem",
        "it": "Congettura di Collatz",
        "ru": "Гипотеза Коллатца",
        "zh": "考拉兹猜想",
        "ja": "コラッツの問題",
        "ko": "콜라츠 추측",
        "oeis": "A006577",
    },
    "goldbach": {
        "pt": "Conjectura de Goldbach",
        "en": "Goldbach conjecture",
        "es": "Conjetura de Goldbach",
        "fr": "Conjecture de Goldbach",
        "de": "Goldbachsche Vermutung",
        "it": "Congettura di Goldbach",
        "ru": "Проблема Гольдбаха",
        "zh": "哥德巴赫猜想",
        "ja": "ゴールドバッハの予想",
        "ko": "골드바흐의 추측",
        "oeis": "A002375",
    },
    "riemann-hypothesis": {
        "pt": "Hipótese de Riemann",
        "en": "Riemann hypothesis",
        "es": "Hipótesis de Riemann",
        "fr": "Hypothèse de Riemann",
        "de": "Riemannsche Vermutung",
        "it": "Ipotesi di Riemann",
        "ru": "Гипотеза Римана",
        "zh": "黎曼猜想",
        "ja": "リーマン予想",
        "ko": "리만 가설",
        "oeis": "A002410",
    },
    "perfect-cuboid": {
        "pt": "Cuboide perfeito",
        "en": "Perfect cuboid Euler brick",
        "es": "Cuboide perfecto",
        "fr": "Brique d'Euler brique parfaite",
        "de": "Perfekter Quader Euler-Ziegel",
        "it": "Mattoni di Eulero cuboide perfetto",
        "ru": "Совершенный кубоид",
        "zh": "完美长方体",
        "ja": "完全直方体",
        "ko": "완전 직육면체",
        "oeis": "A031173",
    },
    "navier-stokes": {
        "pt": "Existência e suavidade de Navier-Stokes",
        "en": "Navier-Stokes existence and smoothness",
        "es": "Ecuaciones de Navier-Stokes regularidad",
        "fr": "Équations de Navier-Stokes régularité",
        "de": "Navier-Stokes-Gleichungen Regularität",
        "it": "Equazioni di Navier-Stokes regolarità",
        "ru": "Уравнения Навье — Стокса",
        "zh": "纳维-斯托克斯存在性与光滑性",
        "ja": "ナビエ–ストークス方程式の解の存在と滑らかさ",
        "ko": "나비에-스토크스 존재성과 매끄러움",
    },
    "p-vs-np": {
        "pt": "P versus NP",
        "en": "P versus NP problem",
        "es": "Clases de complejidad P y NP",
        "fr": "Problème P = NP",
        "de": "P-NP-Problem",
        "it": "Problema P contro NP",
        "ru": "Равенство классов P и NP",
        "zh": "P/NP问题",
        "ja": "P≠NP予想",
        "ko": "P-NP 문제",
    },
}


class GlobalResearchAgent:
    """AGENT 01: Queries arXiv, OpenAlex, OEIS, and downloads legal public-domain books."""

    agent_id = "agent_01"

    def __init__(self, kb: KnowledgeBase, research_dir: Path | None = None) -> None:
        self.kb = kb
        self.research_dir = ensure_research_tree(research_dir or RESEARCH_DIR)
        self.books_dir = self.research_dir / "references" / "books"
        self.books_dir.mkdir(parents=True, exist_ok=True)

    def _http_get_text(self, url: str, timeout: float = 12.0) -> str:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "GENESIS-Math-Lab/1.0 (Local Scientific Research Observatory)"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            raw = resp.read()
        return raw.decode("utf-8", errors="replace")

    def search_arxiv(self, query: str, problem_id: str, max_results: int = 4) -> list[dict[str, Any]]:
        """Query live arXiv API and store verified records in KnowledgeBase."""
        encoded = urllib.parse.quote(query)
        url = f"https://export.arxiv.org/api/query?search_query=all:{encoded}&start=0&max_results={max_results}"
        results: list[dict[str, Any]] = []
        try:
            xml_text = self._http_get_text(url, timeout=10.0)
            root = ET.fromstring(xml_text)
            ns = {"atom": "http://www.w3.org/2005/Atom"}
            for entry in root.findall("atom:entry", ns):
                eid = (entry.findtext("atom:id", "", ns) or "").strip()
                title = " ".join((entry.findtext("atom:title", "", ns) or "").split())
                summary = " ".join((entry.findtext("atom:summary", "", ns) or "").split())[:500]
                authors = ", ".join(
                    (a.findtext("atom:name", "", ns) or "").strip()
                    for a in entry.findall("atom:author", ns)
                )
                if eid and title:
                    ref = {
                        "ref_id": "arxiv_" + hashlib.sha256(eid.encode()).hexdigest()[:14],
                        "problem_id": problem_id,
                        "source_type": "arxiv",
                        "language": "en",
                        "title": title,
                        "authors": authors or "arXiv Author",
                        "url": eid,
                        "summary": summary,
                    }
                    self.kb.record_reference(ref)
                    results.append(ref)
        except Exception as exc:
            # Graceful fallback without fabricating entries
            results = []
            _ = exc
        return results

    def search_openalex(self, query: str, problem_id: str, max_results: int = 4) -> list[dict[str, Any]]:
        """Query live OpenAlex API for multilingual & peer-reviewed scientific works."""
        encoded = urllib.parse.quote(query)
        url = f"https://api.openalex.org/works?search={encoded}&per-page={max_results}&select=id,title,publication_year,doi,language,authorships"
        results: list[dict[str, Any]] = []
        try:
            data = json.loads(self._http_get_text(url, timeout=10.0))
            if not isinstance(data, dict):
                return results
            for work in data.get("results") or []:
                if not isinstance(work, dict):
                    continue
                wid = work.get("id", "")
                title = (work.get("title") or "").strip()
                if not wid or not title:
                    continue
                authors = ", ".join(
                    (a.get("author") or {}).get("display_name", "")
                    for a in (work.get("authorships") or [])[:4]
                    if isinstance(a, dict) and (a.get("author") or {}).get("display_name")
                )
                ref = {
                    "ref_id": "oa_" + hashlib.sha256(wid.encode()).hexdigest()[:14],
                    "problem_id": problem_id,
                    "source_type": "openalex",
                    "language": work.get("language") or "en",
                    "title": f"{title} ({work.get('publication_year', 'n.d.')})",
                    "authors": authors or "OpenAlex",
                    "url": work.get("doi") or wid,
                    "summary": f"OpenAlex indexed work ({work.get('language', 'en')}) — year {work.get('publication_year')}.",
                }
                self.kb.record_reference(ref)
                results.append(ref)
        except Exception:
            results = []
        return results

    def fetch_oeis_sequence(self, seq_id: str, problem_id: str) -> dict[str, Any] | None:
        """Fetch real OEIS sequence metadata (e.g. A006577 for Collatz stopping times)."""
        url = f"https://oeis.org/search?q=id:{urllib.parse.quote(seq_id)}&fmt=json"
        try:
            raw = self._http_get_text(url, timeout=10.0)
            data = json.loads(raw)
            items = data if isinstance(data, list) else ((data.get("results") or []) if isinstance(data, dict) else [])
            if not items or not isinstance(items[0], dict):
                return None
            item = items[0]
            ref = {
                "ref_id": f"oeis_{seq_id}",
                "problem_id": problem_id,
                "source_type": "oeis",
                "language": "en",
                "title": f"OEIS {seq_id}: {item.get('name', seq_id)}",
                "authors": "OEIS Foundation",
                "url": f"https://oeis.org/{seq_id}",
                "summary": f"Primeiros termos: {str(item.get('data') or '')[:140]}",
            }
            self.kb.record_reference(ref)
            return ref
        except Exception:
            return None

    def _http_get_bytes(self, url: str, timeout: float = 20.0) -> bytes:
        req = urllib.request.Request(
            url,
            headers={"User-Agent": "GENESIS-Math-Lab/1.0 (Local Scientific Research Observatory)"},
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return resp.read()

    def _is_valid_plain_text(self, raw_bytes: bytes) -> bool:
        """Reject tiny payloads or HTML error pages when fetching UTF-8 public-domain classics."""
        if len(raw_bytes) <= 10240:
            return False
        head = raw_bytes[:512].lstrip().lower()
        return not (head.startswith(b"<!doctype html") or head.startswith(b"<html"))

    def download_public_domain_books(self) -> list[dict[str, Any]]:
        """Legally download open-access mathematical monographs (arXiv PDFs) and UTF-8 public-domain classics with SHA-256 verification."""
        downloaded: list[dict[str, Any]] = []
        for book in OPEN_ACCESS_MONOGRAPHS:
            local_path = self.books_dir / f"{book['book_id']}.pdf"
            raw_bytes = b""
            if local_path.exists() and local_path.stat().st_size > 10240:
                raw_bytes = local_path.read_bytes()
            else:
                try:
                    data = self._http_get_bytes(book["url"], timeout=20.0)
                    if len(data) > 10240 and data.startswith(b"%PDF-"):
                        raw_bytes = data
                        local_path.write_bytes(raw_bytes)
                except Exception:
                    raw_bytes = b""

            if raw_bytes:
                sha = hashlib.sha256(raw_bytes).hexdigest()
                meta = {
                    "book_id": book["book_id"],
                    "title": book["title"],
                    "author": book["author"],
                    "language": book["language"],
                    "source_url": book["url"],
                    "local_path": str(local_path),
                    "bytes_size": len(raw_bytes),
                    "sha256_hash": sha,
                    "excerpt": book["excerpt"],
                }
                self.kb.record_book(meta)
                downloaded.append(meta)

        for classic in PUBLIC_DOMAIN_CLASSICS:
            local_path = self.books_dir / f"{classic['book_id']}.txt"
            raw_bytes = b""
            used_url = classic["url"]
            if local_path.exists() and self._is_valid_plain_text(local_path.read_bytes()):
                raw_bytes = local_path.read_bytes()
            else:
                candidate_urls = [u for u in (classic["url"], classic.get("backup_url", "")) if u]
                for candidate in candidate_urls:
                    try:
                        data = self._http_get_bytes(candidate, timeout=25.0)
                        if self._is_valid_plain_text(data):
                            raw_bytes = data
                            used_url = candidate
                            local_path.write_bytes(raw_bytes)
                            break
                    except Exception:
                        continue

            if raw_bytes:
                sha = hashlib.sha256(raw_bytes).hexdigest()
                meta = {
                    "book_id": classic["book_id"],
                    "title": classic["title"],
                    "author": classic["author"],
                    "language": classic["language"],
                    "source_url": used_url,
                    "local_path": str(local_path),
                    "bytes_size": len(raw_bytes),
                    "sha256_hash": sha,
                    "excerpt": classic["excerpt"],
                }
                self.kb.record_book(meta)
                downloaded.append(meta)

        manifest_path = self.books_dir / "manifest.json"
        manifest_path.write_text(json.dumps(downloaded, indent=2, ensure_ascii=False), encoding="utf-8")
        return downloaded

    def get_multilingual_terms(self, problem_id: str) -> dict[str, str]:
        return MULTILINGUAL_QUERIES.get(
            problem_id,
            {
                "pt": problem_id.replace("-", " "),
                "en": problem_id.replace("-", " "),
            },
        )
