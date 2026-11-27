"""Integration tests for the full 17-agent pipeline, Red Team governance, and Knowledge Graph."""

from __future__ import annotations

from pathlib import Path

from genesis.agents.orchestrator import GenesisMasterOrchestrator
from genesis.models import DiscoveryCycleRequest, EpistemologicalStatus, HypothesisRecord


def test_full_17_agent_cycle_and_provenance(tmp_path: Path) -> None:
    orch = GenesisMasterOrchestrator(research_dir=tmp_path / "research")
    res = orch.run_discovery_cycle(
        DiscoveryCycleRequest(
            problem_id="collatz",
            mode="balanced",
            seed=42,
            strategy="adaptive",
            export_reports=True,
        ),
        projection="stereographic_4d",
    )

    assert len(orch.registry.snapshot()) == 17
    assert res.experiment.validation_passed is True
    assert len(res.experiment.sha256_hash) == 64
    assert res.adaptive_benchmark["compute_saved_percent"] > 30.0
    assert "Ângulos conformes locais" in res.visual_report.preserved_properties
    assert len(res.visual_report.discarded_properties) >= 1
    assert res.formal_verification["contains_fake_sorry_proof"] is False
    assert "sorry" not in res.formal_verification["lean4_code"].lower()
    assert len(res.symbolic_hypotheses) >= 3

    # Knowledge Graph & SQLite verification
    summary = orch.kb.count_summary()
    assert summary["experiments"] == 1
    assert summary["hypotheses"] == len(res.symbolic_hypotheses)
    kg = orch.kb.build_knowledge_graph()
    assert kg["node_count"] >= 3
    assert kg["edge_count"] >= 3


def test_negative_control_counterexamples_and_red_team_rejection(tmp_path: Path) -> None:
    orch = GenesisMasterOrchestrator(research_dir=tmp_path / "research")
    res = orch.run_discovery_cycle(
        DiscoveryCycleRequest(
            problem_id="negative-control-fermat-euler",
            mode="eco",
            seed=7,
            strategy="adaptive",
            export_reports=True,
        )
    )
    ids = {c.counterexample_id for c in res.counterexamples}
    assert "cex_fermat_F5" in ids
    assert "cex_euler_k5" in ids

    # Test Red Team blocks self-proclaimed formal proof or massive overfit
    bad_hyp = HypothesisRecord(
        hypothesis_id="hyp_fake_overfit",
        problem_id="collatz",
        origin_agent="test",
        visual_cue="none",
        expression_sympy="x**99",
        plain_description="bad",
        in_sample_mse=0.001,
        out_of_sample_mse=25.0,
        complexity_score=20.0,
        epistemological_tier=EpistemologicalStatus.FORMALLY_VERIFIED,
        red_team_verdict="pending",
        red_team_reason="",
    )
    audit = orch.red_team.audit("collatz", [bad_hyp], [], {"discretization_artifact_detected": False})
    assert audit["rejected"] == 1
    assert bad_hyp.red_team_verdict == "rejected"
    assert len(orch.kb.list_rejections("collatz")) == 1
