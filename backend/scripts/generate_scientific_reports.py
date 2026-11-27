"""Generate publication-grade bilingual (PT-BR first, EN second) vector PDF and Markdown scientific monographs in Downloads."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

import fitz  # PyMuPDF
from PIL import Image

SCRIPT_DIR = Path(__file__).resolve().parent
if str(SCRIPT_DIR) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR))

from report_data_and_plots import _esc, build_all_svgs, load_live_dataset
from report_texts_bilingual import get_lang_bundle

DOWNLOADS_DIR = Path(r"C:\Users\mathe\Downloads")
ARCHIVE_DIR = DOWNLOADS_DIR / "Projeto" / "pdf_gerados" / "genesis-scientific-report-20261127"
VENV_PYTHON = Path(r"C:\Users\mathe\.gemini\config\skills\editorial-report-studio\.venv\Scripts\python.exe")
EDGE_EXE = Path(r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe")


EN_BOOK_ROLES: dict[str, tuple[str, str]] = {
    "baek-2024-moving-sofa": ("Jineon Baek (arXiv:2411.19826)", "119-page complete proof establishing that Joseph Gerver's 18-arc sofa (area ≈ 2.21953) is optimal for the Moving Sofa Problem."),
    "tao-2019-collatz-monograph": ("Terence Tao (arXiv:1909.03562)", "Landmark harmonic-analysis & stochastic proof that almost all Collatz orbits attain almost bounded values."),
    "faraday-1839-electricity": ("Michael Faraday (1839, Public Domain)", "Foundational treatise on electromagnetic induction & geometric field lines inspiring GENESIS physical wave overlays."),
    "euclid-1908-elements-heath": ("Euclid / Thomas L. Heath (1908, Public Domain)", "Critical English edition of Euclid's Elements (Vol. 1) serving as the classical axiomatic proof benchmark."),
    "helfgott-2013-ternary-goldbach": ("Harald A. Helfgott (arXiv:1305.2897)", "Hardy-Littlewood-Vinogradov circle method breakthrough establishing the Ternary (Weak) Goldbach Conjecture."),
    "poincare-1905-science-hypothesis": ("Henri Poincaré (1905, Public Domain / Archive)", "Classic epistemology treatise on mathematical intuition, geometric conventions, and experimentation before axiomatization."),
    "perelman-2002-ricci-flow": ("Grigori Perelman (arXiv:math/0211159)", "Foundational paper introducing W-entropy for Ricci flow with surgery, resolving the Millennium Poincaré Conjecture."),
    "einstein-1920-relativity": ("Albert Einstein (1920, Public Domain)", "Original exposition on thought experiments and spacetime invariance grounding relativistic curvature modes."),
    "gilmer-2022-frankl-entropy": ("Zachary Chase & Shachar Lovett (arXiv:2211.11689)", "Entropy refinement of Gilmer's (arXiv:2211.09055) breakthrough establishing constant lower bounds for Frankl's conjecture."),
}

EN_STATUS_MAP: dict[str, str] = {
    "Em aberto": "Open",
    "Resolvido": "Resolved",
    "Parcial / Refutado": "Partial / Refuted",
    "Independente de ZFC": "ZFC-Independent",
    "Controverso": "Controversial",
    "Área de Pesquisa": "Research Frontier",
    "Controle Científico": "Scientific Control",
}

EN_TIER_MAP: dict[str, str] = {
    "Observação": "Observation",
    "Padrão Empírico": "Empirical Pattern",
    "Hipótese": "Hypothesis",
    "Conjectura": "Conjecture",
    "Resultado Parcial": "Partial Result",
    "Lema Demonstrado": "Demonstrated Lemma",
    "Contraexemplo Verificado": "Verified Counterexample",
    "Demonstração Candidata": "Candidate Proof",
    "Demonstração Formalmente Verificada": "Formally Verified Proof",
}

EN_CATEGORY_MAP: dict[str, str] = {
    "number-theory": "Number Theory",
    "combinatorics-graphs": "Combinatorics & Graph Theory",
    "cs-ai": "Computer Science & AI",
    "algebra-geometry": "Algebra & Algebraic Geometry",
    "geometry-topology": "Geometry & Topology",
    "analysis-pde": "Analysis & PDEs",
    "millennium": "Millennium Prize Problems",
    "sacred-showcase": "Visual Field Controls",
    "probability-stats": "Probability & Statistics",
    "math-physics": "Mathematical Physics",
    "logic-foundations": "Logic & Foundations",
    "hilbert": "Hilbert Problems Selection",
}


def build_html_document(lang: str, data: dict[str, Any]) -> str:
    txt = get_lang_bundle(lang, data)
    svgs = build_all_svgs(data, lang=lang)
    catalog = data["catalog"]
    books = data["books"]

    kpi_html = "".join(
        f'<div class="kpi-card"><div class="kpi-num">{_esc(num)}</div><div class="kpi-lbl">{_esc(lbl)}</div></div>'
        for num, lbl in txt["kpi_labels"]
    )
    legend_html = "".join(
        f'<div class="leg-item"><span class="swatch {cls}"></span><span>{_esc(desc)}</span></div>'
        for cls, desc in txt["legend_items"]
    )
    t1_rows = "".join(
        "<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>"
        for row in txt["tbl1_rows"]
    )
    t2_rows = "".join(
        "<tr>" + "".join(f"<td>{cell}</td>" for cell in row) + "</tr>"
        for row in txt["tbl2_rows"]
    )
    t3_parts = []
    for b in books:
        bid = str(b["book_id"])
        en_auth, en_desc = EN_BOOK_ROLES.get(bid, (str(b["author"]), str(b["excerpt"])))
        author_txt = str(b["author"]) if lang == "pt" else en_auth
        desc_txt = str(b["excerpt"])[:140] if lang == "pt" else en_desc[:140]
        t3_parts.append(
            f"<tr><td><strong>{_esc(bid)}</strong><br/><span class='muted'>{_esc(author_txt)}</span></td>"
            f"<td>{_esc(b['title'])}</td>"
            f"<td class='mono'>{'PDF' if str(b['local_path']).endswith('.pdf') else 'UTF-8 TXT'} · {round(int(b['bytes_size'])/1024):,} KB</td>"
            f"<td class='mono'>{_esc(str(b['sha256_hash'])[:14])}…</td>"
            f"<td>{_esc(desc_txt)}…</td></tr>"
        )
    t3_rows = "".join(t3_parts)
    algos_html = "".join(
        f"""
        <div class="algo-card avoid-break">
          <div class="algo-title">{_esc(a['title'])}</div>
          <div class="algo-pre"><strong>{'Pré-condição' if lang == 'pt' else 'Precondition'}:</strong> {_esc(a['pre'])}</div>
          <div class="algo-math">{a['math']}</div>
          <pre class="algo-code">{_esc(a['code'])}</pre>
        </div>
        """
        for a in txt["algos"]
    )
    figs_html = "".join(
        f"""
        <figure class="sci-fig avoid-break">
          {svgs[f'fig{i}']}
          <figcaption>{txt['fig_captions'][i-1]}</figcaption>
        </figure>
        """
        for i in range(1, 9)
    )
    app_parts = []
    for idx, p in enumerate(catalog, start=1):
        area_lbl = str(p["area"]) if lang == "pt" else EN_CATEGORY_MAP.get(str(p["category"]), str(p["area"]))
        status_lbl = str(p["status"]) if lang == "pt" else EN_STATUS_MAP.get(str(p["status"]), str(p["status"]))
        tier_lbl = str(p["formalTier"]) if lang == "pt" else EN_TIER_MAP.get(str(p["formalTier"]), str(p["formalTier"]))
        app_parts.append(
            f"<tr><td class='mono'>{idx}</td><td class='mono'>{_esc(p['code'])}</td>"
            f"<td>{_esc(p['title'])}</td><td>{_esc(area_lbl)}</td>"
            f"<td>{_esc(status_lbl)}</td><td>{_esc(tier_lbl)}</td>"
            f"<td class='mono'>{_esc(p['engine'])}</td></tr>"
        )
    app_rows = "".join(app_parts)
    bib_html = "".join(f"<li>{_esc(b)}</li>" for b in txt["bib"])

    return f"""<!DOCTYPE html>
<html lang="{txt['lang']}">
<head>
<meta charset="utf-8" />
<title>{_esc(txt['doc_title'])}</title>
<style>
  @page {{
    size: A4 portrait;
    margin: 18mm 14mm 18mm 14mm;
  }}
  * {{ box-sizing: border-box; }}
  body {{
    font-family: 'Segoe UI', 'Liberation Sans', 'Inter', Arial, sans-serif;
    color: #1F1F1F;
    font-size: 9.6pt;
    line-height: 1.52;
    margin: 0;
    background: #FFFFFF;
  }}
  .cover-hero {{
    background: linear-gradient(135deg, #09203F 0%, #163D61 55%, #2B5E82 100%);
    color: #FFFFFF;
    padding: 26px 24px 22px 24px;
    border-radius: 12px;
    margin-bottom: 16px;
  }}
  .cover-kicker {{
    font-family: 'Consolas', 'JetBrains Mono', monospace;
    font-size: 8pt;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #BAE6FD;
    margin-bottom: 8px;
  }}
  h1 {{
    font-size: 18pt;
    line-height: 1.2;
    margin: 0 0 8px 0;
    font-weight: 700;
  }}
  .cover-sub {{
    font-size: 10pt;
    color: #E0F2FE;
    margin: 0 0 10px 0;
  }}
  .cover-meta {{
    font-family: 'Consolas', monospace;
    font-size: 7.8pt;
    color: #E2E8F0;
    border-top: 1px solid rgba(255,255,255,0.22);
    padding-top: 8px;
  }}
  .kpi-strip {{
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin: 12px 0 14px 0;
  }}
  .kpi-card {{
    border: 1px solid #D7E3EE;
    background: #EBF3FA;
    border-radius: 8px;
    padding: 8px 10px;
  }}
  .kpi-num {{
    font-family: 'Consolas', monospace;
    font-size: 13pt;
    font-weight: 700;
    color: #0067B8;
  }}
  .kpi-lbl {{
    font-size: 7.6pt;
    color: #334155;
    margin-top: 2px;
    line-height: 1.3;
  }}
  .abstract-box {{
    border-left: 4px solid #1A73E8;
    background: #F8F9FA;
    padding: 11px 14px;
    border-radius: 0 8px 8px 0;
    margin-bottom: 12px;
  }}
  .abstract-box h2, h2 {{
    font-size: 12pt;
    color: #09203F;
    border-bottom: 1.5px solid #D7E3EE;
    padding-bottom: 3px;
    margin: 16px 0 8px 0;
  }}
  .abstract-box h2 {{
    margin-top: 0;
    font-size: 10.5pt;
    border: none;
    color: #1A73E8;
  }}
  .legend-box {{
    border: 1px solid #D7E3EE;
    background: #FFFFFF;
    border-radius: 8px;
    padding: 9px 12px;
    margin-bottom: 14px;
  }}
  .legend-title {{
    font-weight: 700;
    font-size: 8.8pt;
    color: #09203F;
    margin-bottom: 6px;
  }}
  .legend-grid {{
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 5px 12px;
    font-size: 8pt;
  }}
  .leg-item {{
    display: flex;
    align-items: center;
    gap: 6px;
  }}
  .swatch {{
    display: inline-block;
    width: 14px;
    height: 10px;
    border-radius: 2px;
    flex-shrink: 0;
  }}
  mark, .swatch {{
    border-radius: 3px;
    padding: 0 3px;
  }}
  .hl-key {{ background: #FEF08A; color: #1F1F1F; }}
  .hl-algo {{ background: #CFFAFE; color: #083344; }}
  .hl-verified {{ background: #D1FAE5; color: #064E3B; }}
  .hl-caution {{ background: #FFE4E6; color: #881337; }}
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0 14px 0;
    font-size: 8pt;
  }}
  caption {{
    caption-side: top;
    text-align: left;
    font-weight: 700;
    color: #09203F;
    margin-bottom: 5px;
    font-size: 8.6pt;
  }}
  th {{
    background: #EBF3FA;
    color: #09203F;
    text-align: left;
    padding: 6px 7px;
    border: 1px solid #CBD5E1;
    font-weight: 700;
  }}
  td {{
    padding: 5px 7px;
    border: 1px solid #E2E8F0;
    vertical-align: top;
  }}
  tr:nth-child(even) td {{
    background: #F8FAFC;
  }}
  .mono {{
    font-family: 'Consolas', 'JetBrains Mono', monospace;
    font-size: 7.4pt;
  }}
  .muted {{ color: #475569; font-size: 7.4pt; }}
  .algo-card {{
    border: 1px solid #CBD5E1;
    border-radius: 8px;
    background: #F8FAFC;
    padding: 10px 12px;
    margin: 9px 0;
  }}
  .algo-title {{
    font-weight: 700;
    color: #0067B8;
    font-size: 9.2pt;
    border-bottom: 1px solid #E2E8F0;
    padding-bottom: 3px;
    margin-bottom: 5px;
  }}
  .algo-pre {{ font-size: 8pt; color: #334155; margin-bottom: 5px; }}
  .algo-math {{ font-size: 8.6pt; margin-bottom: 6px; }}
  .algo-code {{
    background: #081B33;
    color: #E0F2FE;
    padding: 7px 10px;
    border-radius: 6px;
    font-family: 'Consolas', monospace;
    font-size: 7.6pt;
    margin: 0;
    white-space: pre-wrap;
  }}
  .sci-fig {{
    margin: 10px 0 14px 0;
    padding: 8px;
    border: 1px solid #E2E8F0;
    border-radius: 10px;
    background: #FFFFFF;
  }}
  figcaption {{
    font-size: 8.2pt;
    color: #334155;
    margin-top: 6px;
    line-height: 1.4;
  }}
  .compact-table {{ font-size: 6.9pt; }}
  .compact-table th, .compact-table td {{ padding: 3px 5px; }}
  ol.bib-list {{
    font-size: 8pt;
    padding-left: 18px;
    line-height: 1.45;
  }}
  ol.bib-list li {{ margin-bottom: 4px; }}
  .avoid-break {{ break-inside: avoid; page-break-inside: avoid; }}
  .page-break {{ page-break-before: always; break-before: page; }}
</style>
</head>
<body>

<div class="cover-hero">
  <div class="cover-kicker">{_esc(txt['kicker'])}</div>
  <h1>{_esc(txt['doc_title'])}</h1>
  <div class="cover-sub">{_esc(txt['subtitle'])}</div>
  <div class="cover-meta">{_esc(txt['authors_line'])}<br/>{_esc(txt['msc_line'])}</div>
</div>

<div class="kpi-strip">{kpi_html}</div>

<div class="abstract-box">
  <h2>{_esc(txt['abstract_hdr'])}</h2>
  <p>{txt['abstract']}</p>
</div>

<div class="legend-box">
  <div class="legend-title">{_esc(txt['legend_hdr'])}</div>
  <div class="legend-grid">{legend_html}</div>
</div>

<h2>{_esc(txt['sec1_hdr'])}</h2>
<p>{txt['sec1_intro']}</p>
<table>
  <caption>{_esc(txt['tbl1_cap'])}</caption>
  <thead><tr>{''.join(f'<th>{_esc(h)}</th>' for h in txt['tbl1_headers'])}</tr></thead>
  <tbody>{t1_rows}</tbody>
</table>

<h2>{_esc(txt['sec2_hdr'])}</h2>
<p>{txt['sec2_text']}</p>

<h2>{_esc(txt['sec3_hdr'])}</h2>
<p>{txt['sec3_intro']}</p>
{algos_html}

<div class="page-break"></div>
<h2>{_esc(txt['sec4_hdr'])}</h2>
<p>{txt['sec4_intro']}</p>
{figs_html}

<div class="page-break"></div>
<h2>{_esc(txt['sec5_hdr'])}</h2>
<p>{txt['sec5_text']}</p>
<table>
  <caption>{_esc(txt['tbl2_cap'])}</caption>
  <thead><tr>{''.join(f'<th>{_esc(h)}</th>' for h in txt['tbl2_headers'])}</tr></thead>
  <tbody>{t2_rows}</tbody>
</table>

<h2>{_esc(txt['sec6_hdr'])}</h2>
<p>{txt['sec6_text']}</p>
<table>
  <caption>{_esc(txt['tbl3_cap'])}</caption>
  <thead><tr>{''.join(f'<th>{_esc(h)}</th>' for h in txt['tbl3_headers'])}</tr></thead>
  <tbody>{t3_rows}</tbody>
</table>

<h2>{_esc(txt['sec7_hdr'])}</h2>
<p>{txt['sec7_text']}</p>

<div class="page-break"></div>
<h2>{_esc(txt['sec8_hdr'])}</h2>
<p>{txt['sec8_intro']}</p>
<table class="compact-table">
  <thead><tr>{''.join(f'<th>{_esc(h)}</th>' for h in txt['app_headers'])}</tr></thead>
  <tbody>{app_rows}</tbody>
</table>

<h2>{_esc(txt['sec9_hdr'])}</h2>
<ol class="bib-list">{bib_html}</ol>

</body>
</html>"""


def build_markdown_document(lang: str, data: dict[str, Any]) -> str:
    import re
    txt = get_lang_bundle(lang, data)
    strip_tags = lambda s: re.sub(r"<[^>]+>", "", s)
    lines = [
        f"# {txt['doc_title']}",
        f"**{txt['kicker']}**  ",
        f"{txt['subtitle']}  ",
        f"*{txt['msc_line']}*",
        "",
        f"## {txt['abstract_hdr']}",
        strip_tags(txt["abstract"]),
        "",
        f"### {txt['legend_hdr']}",
        *[f"- `{cls}`: {desc}" for cls, desc in txt["legend_items"]],
        "",
        f"## {txt['sec1_hdr']}",
        strip_tags(txt["sec1_intro"]),
        "",
        f"| {' | '.join(txt['tbl1_headers'])} |",
        f"| {' | '.join(['---']*len(txt['tbl1_headers']))} |",
        *[f"| {' | '.join(strip_tags(str(c)) for c in row)} |" for row in txt["tbl1_rows"]],
        "",
        f"## {txt['sec2_hdr']}",
        strip_tags(txt["sec2_text"]),
        "",
        f"## {txt['sec3_hdr']}",
        txt["sec3_intro"],
    ]
    for a in txt["algos"]:
        lines.extend([
            "",
            f"### {a['title']}",
            f"- **Pre:** {a['pre']}",
            f"- **Calc:** {strip_tags(a['math'])}",
            "```text",
            a["code"],
            "```",
        ])
    lines.extend([
        "",
        f"## {txt['sec5_hdr']}",
        strip_tags(txt["sec5_text"]),
        f"| {' | '.join(txt['tbl2_headers'])} |",
        f"| {' | '.join(['---']*len(txt['tbl2_headers']))} |",
        *[f"| {' | '.join(strip_tags(str(c)) for c in row)} |" for row in txt["tbl2_rows"]],
        "",
        f"## {txt['sec6_hdr']}",
        strip_tags(txt["sec6_text"]),
        "| Book ID | Author | Title | Bytes | SHA-256 |",
        "| --- | --- | --- | --- | --- |",
        *[f"| {b['book_id']} | {b['author']} | {b['title']} | {b['bytes_size']} | {str(b['sha256_hash'])[:16]}... |" for b in data["books"]],
        "",
        f"## {txt['sec7_hdr']}",
        strip_tags(txt["sec7_text"]),
        "",
        f"## {txt['sec8_hdr']} ({len(data['catalog'])} items)",
        f"| {' | '.join(txt['app_headers'])} |",
        f"| {' | '.join(['---']*len(txt['app_headers']))} |",
        *[f"| {i} | {p['code']} | {p['title']} | {p['area']} | {p['status']} | {p['formalTier']} | {p['engine']} |" for i, p in enumerate(data["catalog"], 1)],
        "",
        f"## {txt['sec9_hdr']}",
        *[f"- {b}" for b in txt["bib"]],
        "",
    ])
    return "\n".join(lines)


def _render_pdfs_with_edge(html_to_pdf_pairs: list[tuple[Path, Path, str]]) -> None:
    """Invoke editorial-report-studio Playwright + Edge to print vector PDFs with page counters."""
    jobs = [(str(h), str(p), footer) for h, p, footer in html_to_pdf_pairs]
    script = f"""
import pathlib
from playwright.sync_api import sync_playwright

jobs = {jobs!r}
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=r"{EDGE_EXE}", headless=True)
    for html_path, pdf_path, footer_lbl in jobs:
        page = browser.new_page()
        page.goto(pathlib.Path(html_path).as_uri(), wait_until="load")
        page.pdf(
            path=pdf_path,
            format="A4",
            print_background=True,
            display_header_footer=True,
            header_template='<div style="font-size:7px;color:#64748b;width:100%;padding:0 14mm;display:flex;justify-content:space-between;"><span>GENESIS Scientific Discovery Lab (2026)</span><span>MSC2020: 11Y16 · 11M26 · 68T01</span></div>',
            footer_template=f'<div style="font-size:7px;color:#64748b;width:100%;padding:0 14mm;display:flex;justify-content:space-between;"><span>{{footer_lbl}}</span><span><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>',
            margin={{"top": "18mm", "bottom": "18mm", "left": "14mm", "right": "14mm"}},
        )
        page.close()
    browser.close()
"""
    subprocess.run([str(VENV_PYTHON), "-c", script], check=True)


def _render_contact_sheet(pdf_path: Path, out_dir: Path, tag: str) -> tuple[int, Path]:
    doc = fitz.open(pdf_path)
    thumbs = []
    for idx, page in enumerate(doc):
        pix = page.get_pixmap(dpi=135)
        img_path = out_dir / f"{tag}_page_{idx+1:02d}.png"
        pix.save(img_path)
        thumbs.append(Image.open(img_path).convert("RGB"))
    cols = 4
    rows = max(1, (len(thumbs) + cols - 1) // cols)
    tw, th = 360, 509
    sheet = Image.new("RGB", (cols * tw, rows * th), (242, 244, 248))
    for i, im in enumerate(thumbs):
        r, c = divmod(i, cols)
        sheet.paste(im.resize((tw - 12, th - 12), Image.Resampling.LANCZOS), (c * tw + 6, r * th + 6))
    cs_path = out_dir / f"contact_sheet_{tag}.png"
    sheet.save(cs_path)
    return len(doc), cs_path


def main() -> None:
    ARCHIVE_DIR.mkdir(parents=True, exist_ok=True)
    preview_dir = ARCHIVE_DIR / "preview"
    preview_dir.mkdir(parents=True, exist_ok=True)

    data = load_live_dataset()
    pt_html = ARCHIVE_DIR / "report_pt.html"
    en_html = ARCHIVE_DIR / "report_en.html"
    pt_pdf_arc = ARCHIVE_DIR / "GENESIS_Relatorio_Cientifico_PT-BR_2026.pdf"
    en_pdf_arc = ARCHIVE_DIR / "GENESIS_Scientific_Report_EN_2026.pdf"
    pt_md_arc = ARCHIVE_DIR / "GENESIS_Relatorio_Cientifico_PT-BR_2026.md"
    en_md_arc = ARCHIVE_DIR / "GENESIS_Scientific_Report_EN_2026.md"

    pt_html.write_text(build_html_document("pt", data), encoding="utf-8")
    en_html.write_text(build_html_document("en", data), encoding="utf-8")
    pt_md_arc.write_text(build_markdown_document("pt", data), encoding="utf-8")
    en_md_arc.write_text(build_markdown_document("en", data), encoding="utf-8")

    _render_pdfs_with_edge([
        (pt_html, pt_pdf_arc, "GENESIS · Edição PT-BR · Normas ABNT / ISO 690"),
        (en_html, en_pdf_arc, "GENESIS · English Edition · IEEE / AMS / ISO 690"),
    ])

    pt_pages, pt_cs = _render_contact_sheet(pt_pdf_arc, preview_dir, "pt")
    en_pages, en_cs = _render_contact_sheet(en_pdf_arc, preview_dir, "en")

    # Copy primary deliverables directly into C:\Users\mathe\Downloads\ as requested
    deliverables = {
        "pt_pdf": (pt_pdf_arc, DOWNLOADS_DIR / "GENESIS_Relatorio_Cientifico_PT-BR_2026.pdf"),
        "en_pdf": (en_pdf_arc, DOWNLOADS_DIR / "GENESIS_Scientific_Report_EN_2026.pdf"),
        "pt_md": (pt_md_arc, DOWNLOADS_DIR / "GENESIS_Relatorio_Cientifico_PT-BR_2026.md"),
        "en_md": (en_md_arc, DOWNLOADS_DIR / "GENESIS_Scientific_Report_EN_2026.md"),
    }
    for src, dst in deliverables.values():
        shutil.copy2(src, dst)

    manifest = {
        "catalog_count": len(data["catalog"]),
        "counts": data["counts"],
        "books_count": len(data["books"]),
        "pt_pages": pt_pages,
        "en_pages": en_pages,
        "pt_contact_sheet": str(pt_cs),
        "en_contact_sheet": str(en_cs),
        "downloads": {k: {"path": str(dst), "bytes": dst.stat().st_size} for k, (_, dst) in deliverables.items()},
    }
    (ARCHIVE_DIR / "build_manifest.json").write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    print(json.dumps(manifest, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()
