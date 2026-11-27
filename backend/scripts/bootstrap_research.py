"""Bootstrap live public-domain books, arXiv/OpenAlex/OEIS references, and real GENESIS experiments."""

from __future__ import annotations

import json
import sys
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent.parent
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from genesis.agents.orchestrator import GenesisMasterOrchestrator
from genesis.agents.research_agent import MULTILINGUAL_QUERIES
from genesis.models import DiscoveryCycleRequest


PRIORITY_BOOT_PROBLEMS = [
    "collatz",
    "goldbach",
    "perfect-cuboid",
    "magic-square-squares",
    "riemann-hypothesis",
    "p-vs-np",
    "navier-stokes",
    "yang-mills",
    "negative-control-fermat-euler",
]


def main() -> None:
    orch = GenesisMasterOrchestrator()
    print(f"[GENESIS] Research directory: {orch.kb.research_dir}")

    print("[AGENT 01] Downloading legal public-domain mathematical classics (Project Gutenberg)...")
    books = orch.research.download_public_domain_books()
    print(f"[AGENT 01] Indexed {len(books)} public-domain books into research/references/books/")
    for b in books:
        print(f"  - {b['title']} ({b['bytes_size']:,} bytes) SHA256={b['sha256_hash'][:12]}...")

    print("[AGENT 01] Fetching verified references from arXiv, OpenAlex & OEIS...")
    total_refs = 0
    for pid, langs in MULTILINGUAL_QUERIES.items():
        en_q = langs.get("en", pid)
        arxiv_refs = orch.research.search_arxiv(en_q, pid, max_results=3)
        oa_refs = orch.research.search_openalex(en_q, pid, max_results=3)
        total_refs += len(arxiv_refs) + len(oa_refs)
        if "oeis" in langs:
            oeis_ref = orch.research.fetch_oeis_sequence(langs["oeis"], pid)
            if oeis_ref:
                total_refs += 1
        # Save multilingual query sheet per problem
        lang_file = orch.kb.research_dir / "references" / f"{pid}_multilingual.json"
        lang_file.write_text(json.dumps(langs, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"[AGENT 01] Indexed {total_refs} live public references into SQLite & Knowledge Graph.")

    print("[AGENT 00] Running initial 17-agent Visual-First Discovery Cycles across priority problems...")
    for idx, pid in enumerate(PRIORITY_BOOT_PROBLEMS):
        res = orch.run_discovery_cycle(
            DiscoveryCycleRequest(
                problem_id=pid,
                mode="balanced",
                seed=42 + idx,
                strategy="adaptive",
                export_reports=True,
            ),
            projection="cartesian_3d" if idx % 2 == 0 else "stereographic_4d",
        )
        print(
            f"  - {pid}: cycle={res.cycle_id}, saved={res.adaptive_benchmark['compute_saved_percent']}%, "
            f"approved={res.red_team_audit['approved_for_testing']}, "
            f"rejected={res.red_team_audit['rejected']}, cex={len(res.counterexamples)}, "
            f"files={len(res.report_paths)}"
        )

    counts = orch.kb.count_summary()
    print("[AGENT 14] Final Knowledge Base counts:", json.dumps(counts, indent=2))


if __name__ == "__main__":
    main()
