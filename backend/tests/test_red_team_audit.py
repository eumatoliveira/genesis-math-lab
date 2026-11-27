"""Independent Scientific Red-Team & Staff Engineering audit tests."""

from __future__ import annotations

import ast
import json
import math
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from genesis.agents.counterexample_agent import CounterexampleHunterAgent
from genesis.agents.evolution_agent import EvolutionaryDiscoveryAgent
from genesis.agents.formal_prover_agent import (
    LEAN4_SKELETONS,
    FormalTheoremProverAgent,
    _has_sorry_or_admit,
)
from genesis.agents.hardware_agent import HardwareOptimizationAgent
from genesis.agents.red_team_agent import ScientificRedTeamAgent
from genesis.agents.research_agent import GlobalResearchAgent
from genesis.agents.simulation_agent import SimulationAgent
from genesis.api import create_app
from genesis.config import HardwareLimits
from genesis.models import (
    EpistemologicalStatus,
    HardwareSnapshot,
    HypothesisRecord,
)
from genesis.plugins.base import PluginRunOutput
from genesis.plugins.collatz import CollatzPlugin
from genesis.plugins.goldbach import GoldbachPlugin
from genesis.plugins.navier_stokes import NavierStokesPlugin
from genesis.storage.knowledge_base import KnowledgeBase


def test_generator_and_auditor_module_isolation() -> None:
    agents_dir = Path(__file__).resolve().parents[1] / "genesis" / "agents"
    generators = ["symbolic_agent.py", "evolution_agent.py"]
    auditor_modules = {"counterexample_agent", "formal_prover_agent", "red_team_agent"}

    for fname in generators:
        tree = ast.parse((agents_dir / fname).read_text(encoding="utf-8"))
        imported: set[str] = set()
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                imported.update(alias.name for alias in node.names)
            elif isinstance(node, ast.ImportFrom) and node.module:
                imported.add(node.module)
        for mod in imported:
            assert not any(aud in mod for aud in auditor_modules), (
                f"Generator {fname} must stay isolated from auditor {mod}"
            )


def test_lean4_skeletons_never_use_sorry_or_admit_and_handle_missing_binaries(
    tmp_path: Path,
) -> None:
    assert _has_sorry_or_admit("theorem foo : True := by sorry") is True
    assert _has_sorry_or_admit("theorem foo : True := by admit") is True
    assert _has_sorry_or_admit("-- comment mentioning sorry and admit\ndef P : Prop := True") is False
    assert _has_sorry_or_admit("/- sorry -/\ndef P : Prop := True") is False
    assert _has_sorry_or_admit("/- outer /- inner -/ admit -/\ndef P : Prop := False") is False
    assert _has_sorry_or_admit("-- comment with /-\ntheorem fake : False := by sorry\n-- end -/") is True

    for pid, code in LEAN4_SKELETONS.items():
        assert not _has_sorry_or_admit(code), f"Skeleton {pid} contains sorry/admit!"
        assert ": Prop := True" not in code, f"Skeleton {pid} must not define open target as tautological True"

    from genesis.agents.decomposition_agent import DecompositionAgent

    prover = FormalTheoremProverAgent(research_dir=tmp_path / "research")
    decomp = DecompositionAgent()
    with patch("genesis.agents.formal_prover_agent.shutil.which", return_value=None):
        res = prover.verify(decomp.formalize("collatz"))
        assert res["lean4_installed"] is False
        assert res["z3_installed"] is False
        assert res["contains_fake_sorry_proof"] is False
        assert res["assigned_problem_tier"] == EpistemologicalStatus.CONJECTURE.value

        # Traversal attempt in problem_id must stay inside proofs_dir
        evil_form = decomp.formalize("../evil_path")
        evil_res = prover.verify(evil_form)
        assert Path(evil_res["lean4_skeleton_path"]).parent == prover.proofs_dir


def test_evolution_evaluates_real_mse_and_red_team_catches_zero_train_or_nan(
    tmp_path: Path,
) -> None:
    kb = KnowledgeBase(research_dir=tmp_path / "research")
    evo = EvolutionaryDiscoveryAgent()
    cex = CounterexampleHunterAgent()
    red = ScientificRedTeamAgent(kb)

    plugin_out = PluginRunOutput(
        problem_id="test-prob",
        raw_series={"series": [10.0] * 12},
        matrix_2d=[[1.0, 1.0], [1.0, 1.0]],
        points_3d=[[0.0, 1.0, 0.0]],
        metrics={},
        summary="const",
        limitations=[],
        suggested_visual_cue="flat",
    )
    # Empty base_hypotheses must not crash
    empty_hyps, empty_summary = evo.evolve("test-prob", 42, [], plugin_out)
    assert empty_hyps == []
    assert empty_summary["generations_executed"] == 0

    # Constant expression "0" has true MSE = 100.0 against series [10.0]*12, even if parent claimed 0.001
    parent = HypothesisRecord(
        hypothesis_id="hyp_parent_const",
        problem_id="test-prob",
        origin_agent="agent_07",
        visual_cue="flat",
        expression_sympy="0",
        plain_description="constant zero",
        in_sample_mse=0.001,
        out_of_sample_mse=0.001,
        complexity_score=1.0,
        epistemological_tier=EpistemologicalStatus.EMPIRICAL_PATTERN,
        red_team_verdict="pending",
        red_team_reason="",
    )
    evolved, _ = evo.evolve("test-prob", 42, [parent], plugin_out)
    assert len(evolved) == 3
    for h in evolved:
        assert math.isclose(h.in_sample_mse, 100.0, rel_tol=1e-4)
        assert math.isclose(h.out_of_sample_mse, 100.0, rel_tol=1e-4)

    # Zero training error + high OOS error + PROVED_LEMMA spoofing must be caught
    zero_train_overfit = HypothesisRecord(
        hypothesis_id="hyp_zero_train_overfit",
        problem_id="test-prob",
        origin_agent="agent_07",
        visual_cue="none",
        expression_sympy="x",
        plain_description="overfit",
        in_sample_mse=0.0,
        out_of_sample_mse=4.0,
        complexity_score=2.0,
        epistemological_tier=EpistemologicalStatus.PROVED_LEMMA,
        red_team_verdict="pending",
        red_team_reason="",
    )
    nan_hyp = HypothesisRecord(
        hypothesis_id="hyp_nan_mse",
        problem_id="test-prob",
        origin_agent="agent_07",
        visual_cue="none",
        expression_sympy="x",
        plain_description="nan",
        in_sample_mse=float("nan"),
        out_of_sample_mse=1.0,
        complexity_score=2.0,
        epistemological_tier=EpistemologicalStatus.HYPOTHESIS,
        red_team_verdict="pending",
        red_team_reason="",
    )
    found_cex = cex.hunt("test-prob", [zero_train_overfit, nan_hyp], seed=1)
    assert {c.hypothesis_id for c in found_cex} == {"hyp_zero_train_overfit", "hyp_nan_mse"}

    audit = red.audit("test-prob", [zero_train_overfit, nan_hyp], [], {"discretization_artifact_detected": False})
    assert audit["rejected"] == 2
    assert zero_train_overfit.red_team_verdict == "rejected"
    assert nan_hyp.red_team_verdict == "rejected"


def test_hardware_psutil_limits_and_simulation_backpressure() -> None:
    limits = HardwareLimits(max_lab_ram_gb=14.0, max_cpu_percent=70.0, min_free_disk_gb=4.0)
    hw_agent = HardwareOptimizationAgent(limits=limits)

    fake_vm = SimpleNamespace(total=32 * 1024**3, used=12 * 1024**3, available=20 * 1024**3)
    fake_disk = SimpleNamespace(total=100 * 1024**3, used=50 * 1024**3, free=50 * 1024**3)
    fake_proc = SimpleNamespace(memory_info=lambda: SimpleNamespace(rss=15 * 1024**3))

    with (
        patch("genesis.agents.hardware_agent.psutil.virtual_memory", return_value=fake_vm),
        patch("genesis.agents.hardware_agent.psutil.cpu_percent", return_value=78.5),
        patch("genesis.agents.hardware_agent.psutil.Process", return_value=fake_proc),
        patch("genesis.agents.hardware_agent.shutil.disk_usage", return_value=fake_disk),
    ):
        snap = hw_agent.snapshot()
        assert snap.within_safe_limits is False
        assert any("CPU acima" in w for w in snap.warnings)
        assert any("excedeu o teto" in w for w in snap.warnings)

    # SimulationAgent must apply adaptive backpressure when CPU > 70% or within_safe_limits=False
    sim = SimulationAgent()
    overloaded_hw = HardwareSnapshot(
        os_name="Windows 11",
        cpu_model="Test CPU",
        physical_cores=6,
        logical_threads=12,
        cpu_percent=82.0,
        ram_total_gb=32.0,
        ram_used_gb=16.0,
        ram_available_gb=16.0,
        disk_free_gb=20.0,
        gpu_name="RTX 3050",
        within_safe_limits=True,
    )
    _, _, exp_rec = sim.run_experiment(
        problem_id="navier-stokes",
        hypothesis_id="hyp_bp",
        seed=42,
        mode="high_performance",
        strategy="adaptive",
        params={},
        hw_snapshot=overloaded_hw,
    )
    assert exp_rec.input_data["backpressure_applied"] is True
    assert exp_rec.input_data["resolution"] <= 18


def test_offline_oeis_null_data_and_api_hardening(tmp_path: Path) -> None:
    research_dir = tmp_path / "research"
    kb = KnowledgeBase(research_dir=research_dir)
    research = GlobalResearchAgent(kb=kb, research_dir=research_dir)

    research._http_get_text = lambda url, timeout=1.0: json.dumps({"results": [{"name": "Test", "data": None}]})  # type: ignore[method-assign]
    item = research.fetch_oeis_sequence("A000001", "collatz")
    assert item is not None
    assert item["summary"] == "Primeiros termos: "

    # Book preview must return excerpt for .pdf files instead of binary PDF bytes
    pdf_path = research.books_dir / "sample-book.pdf"
    pdf_path.write_bytes(b"%PDF-1.5\n%\xe2\xe3\xcf\xd3\nbinary stream")
    kb.record_book(
        {
            "book_id": "sample-book",
            "title": "Sample PDF",
            "author": "Tester",
            "language": "en",
            "source_url": "https://example.org/sample.pdf",
            "local_path": str(pdf_path),
            "bytes_size": pdf_path.stat().st_size,
            "sha256_hash": "abc123",
            "excerpt": "Clean mathematical abstract.",
        }
    )

    app = create_app(research_dir=research_dir)
    client = TestClient(app)

    r_book = client.get("/api/books/sample-book")
    assert r_book.status_code == 200
    assert r_book.json()["preview"] == "Clean mathematical abstract."

    # Invalid problem_id must be rejected cleanly with 400
    r_bad_report = client.get("/api/reports/..bad/files")
    assert r_bad_report.status_code == 400
    r_bad_probe = client.get("/api/probe/plugin/..bad")
    assert r_bad_probe.status_code == 400
    r_bad_cycle = client.post("/api/cycles/run", json={"problem_id": "../evil"})
    assert r_bad_cycle.status_code == 400

    # Extreme plugin parameters stay finite and safe
    collatz_out = CollatzPlugin().run(seed=42, params={"start_n": -10, "batch_span": 99999}, resolution=16)
    assert collatz_out.metrics["anchor_start_n"] == 1

    goldbach_out = GoldbachPlugin().run(seed=42, params={"max_even": 200, "anchor_even": 999}, resolution=16)
    assert goldbach_out.metrics["anchor_even"] <= 200
    assert goldbach_out.metrics["anchor_pair_count"] > 0

    ns_out = NavierStokesPlugin().run(seed=42, params={"dt": 10.0, "viscosity": 0.0}, resolution=18)
    assert ns_out.metrics["numerical_stability_ok"] is False
    assert all(math.isfinite(x) for x in ns_out.raw_series["kinetic_energy"])


def test_symbolic_evolution_consistency_sqlite_close_and_nan_plugin_hardening(tmp_path: Path) -> None:
    import tempfile
    import numpy as np
    import sympy as sp
    from genesis.agents.symbolic_agent import SymbolicDiscoveryAgent
    from genesis.agents.orchestrator import GenesisMasterOrchestrator
    from genesis.models import DiscoveryCycleRequest
    from genesis.plugins.controls import GenericHarmonicExplorerPlugin
    from genesis.plugins.riemann import RiemannPlugin
    from genesis.scheduler import AutonomousLabScheduler

    # 1. Symbolic MSE must match evaluating expression_sympy directly
    pout = PluginRunOutput(
        problem_id="sym-check",
        raw_series={"s": [i / math.log(i + 1) for i in range(1, 21)]},
        matrix_2d=[[1.0, 2.0], [3.0, 4.0]],
        points_3d=[[0.0, 1.0, 0.0]],
        metrics={},
        summary="log",
        limitations=[],
        suggested_visual_cue="curve",
    )
    hyps = SymbolicDiscoveryAgent().discover_hypotheses("sym-check", pout, "curve")
    sym_x = sp.Symbol("x", positive=True)
    xv = np.linspace(1.0, 20.0, 20)
    yv = np.array(pout.raw_series["s"])
    for h in hyps:
        fn = sp.lambdify(sym_x, sp.sympify(h.expression_sympy, locals={"x": sym_x}), "numpy")
        pred = np.asarray(fn(xv), dtype=float)
        actual_oos = float(np.mean((yv[14:] - pred[14:]) ** 2))
        assert math.isclose(h.out_of_sample_mse, actual_oos, rel_tol=1e-4, abs_tol=1e-5)

    # 2. Evolution never fabricates scaled MSE on unparseable parent
    bad_parent = HypothesisRecord(
        hypothesis_id="hyp_bad_sym",
        problem_id="sym-check",
        origin_agent="agent_07",
        visual_cue="none",
        expression_sympy="invalid_syntax(((",
        plain_description="broken",
        in_sample_mse=0.5,
        out_of_sample_mse=0.5,
        complexity_score=1.0,
        epistemological_tier=EpistemologicalStatus.HYPOTHESIS,
        red_team_verdict="pending",
        red_team_reason="",
    )
    evo_bad, _ = EvolutionaryDiscoveryAgent().evolve("sym-check", 42, [bad_parent], pout)
    assert all(not math.isfinite(h.out_of_sample_mse) for h in evo_bad)

    # 3. Plugins handle NaN params without ValueError or NaN metrics
    col_nan = CollatzPlugin().run(42, {"start_n": float("nan")})
    assert col_nan.metrics["anchor_start_n"] == 27
    rie_nan = RiemannPlugin().run(42, {"sigma": float("nan"), "t_min": float("nan")})
    assert math.isfinite(rie_nan.metrics["sigma"])
    gen_nan = GenericHarmonicExplorerPlugin("x").run(42, {"amplitude": float("nan")})
    assert math.isfinite(gen_nan.metrics["energy_l2"])
    ns_nan = NavierStokesPlugin().run(42, {"dt": float("nan")})
    assert math.isfinite(ns_nan.metrics["cfl_number"])

    # 4. API & ReportLab handle XML-like tokens and invalid queries safely
    app = create_app(research_dir=tmp_path / "api_res")
    client = TestClient(app)
    assert client.get("/api/references", params={"problem_id": "../evil"}).status_code == 400
    assert client.post("/api/research/query", json={"problem_id": "../evil", "query": "x"}).status_code == 400
    assert client.get("/api/probe/cuboid", params={"a": str(10**105), "b": "2", "c": "3"}).status_code == 400

    # ReportLab escapes <tag> in title cleanly & SQLite closes handles so TemporaryDirectory unlinks on Windows
    with tempfile.TemporaryDirectory() as td:
        orch = GenesisMasterOrchestrator(research_dir=Path(td) / "pdf_res")
        res = orch.run_discovery_cycle(
            DiscoveryCycleRequest(problem_id="test-xml", mode="eco", seed=42, export_reports=True),
            title="Inner <x, y> & Bound < 1",
        )
        assert Path(res.report_paths["research-report.pdf"]).exists()

    # 5. Scheduler start/pause never deadlock and _loop recovers cleanly from cycle error
    orch2 = GenesisMasterOrchestrator(research_dir=tmp_path / "sched_res")
    sched = AutonomousLabScheduler(orch2)
    with patch.object(orch2, "run_discovery_cycle", side_effect=RuntimeError("boom")):
        sched._running = True
        sched._loop()
    assert sched.status()["running"] is False
    paused_st = sched.pause()
    assert paused_st["running"] is False
    started_st = sched.start(mode="eco", max_cycles=1)
    assert started_st["mode"] == "eco"
    sched.pause()
    if sched._thread is not None:
        sched._thread.join(timeout=5.0)
