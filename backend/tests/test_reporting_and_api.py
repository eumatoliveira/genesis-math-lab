"""Tests for 9-file ReportLab PDF + Markdown dossier generation and FastAPI endpoints."""

from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from genesis.api import create_app


EXPECTED_DOSSIER_FILES = {
    "research-summary.md",
    "mathematical-formulation.md",
    "literature-review.md",
    "experimental-results.md",
    "hypotheses.md",
    "counterexamples.md",
    "formal-verification.md",
    "reproducibility.md",
    "research-report.pdf",
}


def test_fastapi_endpoints_and_9_file_pdf_dossier(tmp_path: Path) -> None:
    app = create_app(research_dir=tmp_path / "research")
    client = TestClient(app)

    r_health = client.get("/api/health")
    assert r_health.status_code == 200
    assert r_health.json()["status"] == "ok"

    r_agents = client.get("/api/agents")
    assert r_agents.status_code == 200
    assert len(r_agents.json()["agents"]) == 17

    r_hw = client.get("/api/hardware")
    assert r_hw.status_code == 200
    assert r_hw.json()["ram_total_gb"] > 1.0

    r_cycle = client.post(
        "/api/cycles/run",
        json={"problem_id": "goldbach", "mode": "eco", "seed": 42, "strategy": "adaptive", "export_reports": True},
    )
    assert r_cycle.status_code == 200
    data = r_cycle.json()
    assert data["problem_id"] == "goldbach"

    # Check all 9 files + valid PDF header
    r_files = client.get("/api/reports/goldbach/files")
    assert r_files.status_code == 200
    names = {f["name"] for f in r_files.json()["files"]}
    assert EXPECTED_DOSSIER_FILES.issubset(names)

    r_pdf = client.get("/api/reports/goldbach/download/research-report.pdf")
    assert r_pdf.status_code == 200
    assert r_pdf.content.startswith(b"%PDF-")

    r_collatz = client.get("/api/probe/collatz/27")
    assert r_collatz.status_code == 200
    assert r_collatz.json()["steps"] == 111
    assert r_collatz.json()["max_value"] == 9232
