"""Tests for Agent 01 multilingual queries, offline resilience, and book catalog storage."""

from __future__ import annotations

from pathlib import Path

from genesis.agents.research_agent import GlobalResearchAgent
from genesis.storage.knowledge_base import KnowledgeBase


def test_multilingual_terms_and_book_catalog(tmp_path: Path) -> None:
    kb = KnowledgeBase(research_dir=tmp_path / "research")
    agent = GlobalResearchAgent(kb=kb, research_dir=tmp_path / "research")

    terms = agent.get_multilingual_terms("collatz")
    for lang in ["pt", "en", "es", "fr", "de", "it", "ru", "zh", "ja", "ko"]:
        assert lang in terms and len(terms[lang]) > 2

    # Simulate cached arXiv PDF + UTF-8 classic book files to verify SHA-256 indexing offline without network calls
    pdf_stub = agent.books_dir / "tao-2019-collatz-monograph.pdf"
    pdf_stub.write_bytes(b"%PDF-1.7\n" + (b"0123456789ABCDEF" * 700))

    classic_stub = agent.books_dir / "poincare-1905-science-hypothesis.txt"
    classic_stub.write_text(
        ("*** START OF TEST BOOK ***\nMathematics is the art of giving the same name to different things.\n" * 200),
        encoding="utf-8",
    )

    def fail_bytes(url: str, timeout: float = 1.0) -> bytes:
        raise OSError("Offline test mode")

    agent._http_get_bytes = fail_bytes  # type: ignore[method-assign]
    books = agent.download_public_domain_books()
    indexed_ids = {b["book_id"] for b in books}
    assert "tao-2019-collatz-monograph" in indexed_ids
    assert "poincare-1905-science-hypothesis" in indexed_ids
    for item in books:
        assert len(item["sha256_hash"]) == 64
        assert item["bytes_size"] > 10240
    assert (agent.books_dir / "manifest.json").exists()

    # Verify offline-resilient HTTP failure handling returns empty list cleanly instead of crashing
    def broken_get(url: str, timeout: float = 1.0) -> str:
        raise OSError("Offline test mode")

    agent._http_get_text = broken_get  # type: ignore[method-assign]
    assert agent.search_arxiv("Collatz", "collatz") == []
    assert agent.search_openalex("Goldbach", "goldbach") == []
    assert agent.fetch_oeis_sequence("A006577", "collatz") is None
