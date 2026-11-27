"""AGENT 00 — GENESIS Master Orchestrator: Visual-First Scientific Discovery Cycle across all 17 agents."""

from __future__ import annotations

import threading
import time
from pathlib import Path
from typing import Any

from genesis.agents.counterexample_agent import CounterexampleHunterAgent
from genesis.agents.decomposition_agent import DecompositionAgent
from genesis.agents.evolution_agent import EvolutionaryDiscoveryAgent
from genesis.agents.formal_prover_agent import FormalTheoremProverAgent
from genesis.agents.hardware_agent import HardwareOptimizationAgent
from genesis.agents.pattern_agent import PatternRecognitionAgent
from genesis.agents.physics_agent import ComputationalPhysicsAgent
from genesis.agents.quantum_agent import QuantumInspiredAgent
from genesis.agents.red_team_agent import ScientificRedTeamAgent
from genesis.agents.registry import AgentRegistry
from genesis.agents.reporting_agent import ScientificReportingAgent
from genesis.agents.research_agent import GlobalResearchAgent
from genesis.agents.simulation_agent import SimulationAgent
from genesis.agents.symbolic_agent import SymbolicDiscoveryAgent
from genesis.agents.visual_agent import VisualDiscoveryAgent
from genesis.models import (
    AgentEvent,
    DiscoveryCycleRequest,
    DiscoveryCycleResult,
)
from genesis.storage.checkpoints import CheckpointStore
from genesis.storage.knowledge_base import KnowledgeBase, compute_sha256


class GenesisMasterOrchestrator:
    """AGENT 00: Coordinates all 17 specialized agents enforcing Visual-First discovery and Red-Team rigor."""

    agent_id = "agent_00"

    def __init__(self, research_dir: Path | None = None) -> None:
        self.kb = KnowledgeBase(research_dir)
        self.checkpoints = CheckpointStore(self.kb.research_dir)
        self.registry = AgentRegistry()

        self.research = GlobalResearchAgent(self.kb, self.kb.research_dir)
        self.decomposition = DecompositionAgent()
        self.visual = VisualDiscoveryAgent()
        self.physics = ComputationalPhysicsAgent()
        self.hardware = HardwareOptimizationAgent()
        self.simulation = SimulationAgent(limits=self.hardware.limits)
        self.pattern = PatternRecognitionAgent()
        self.symbolic = SymbolicDiscoveryAgent()
        self.evolution = EvolutionaryDiscoveryAgent()
        self.quantum = QuantumInspiredAgent()
        self.counterexample = CounterexampleHunterAgent()
        self.formal = FormalTheoremProverAgent(self.kb.research_dir)
        self.red_team = ScientificRedTeamAgent(self.kb)
        self.reporting = ScientificReportingAgent(self.kb.research_dir)

        self.strategy_rotation = ["adaptive", "evolutionary", "quantum_inspired"]
        self.recent_events: list[AgentEvent] = []
        self._cycle_lock = threading.RLock()
        self._events_lock = threading.Lock()

    def _emit(self, events: list[AgentEvent], agent_id: str, problem_id: str, stage: str, msg: str, **metrics: Any) -> None:
        ev = AgentEvent(agent_id=agent_id, problem_id=problem_id, stage=stage, message=msg, metrics=metrics)
        events.append(ev)
        with self._events_lock:
            self.recent_events.append(ev)
            if len(self.recent_events) > 200:
                self.recent_events = self.recent_events[-200:]
        self.kb.append_event(ev)

    def select_next_strategy(self, problem_id: str, current_strategy: str) -> str:
        """Switch experimental strategy if prior cycles yielded zero new approved hypotheses."""
        prior_hyps = self.kb.list_hypotheses(problem_id=problem_id, limit=12)
        if len(prior_hyps) >= 6:
            idx = self.strategy_rotation.index(current_strategy) if current_strategy in self.strategy_rotation else 0
            return self.strategy_rotation[(idx + 1) % len(self.strategy_rotation)]
        return current_strategy

    def run_discovery_cycle(
        self,
        req: DiscoveryCycleRequest,
        projection: str = "cartesian_3d",
        title: str | None = None,
        area: str | None = None,
    ) -> DiscoveryCycleResult:
        with self._cycle_lock:
            return self._run_discovery_cycle_unlocked(req, projection=projection, title=title, area=area)

    def _run_discovery_cycle_unlocked(
        self,
        req: DiscoveryCycleRequest,
        projection: str = "cartesian_3d",
        title: str | None = None,
        area: str | None = None,
    ) -> DiscoveryCycleResult:
        events: list[AgentEvent] = []
        t_cycle = time.perf_counter()
        self.registry.mark_running("agent_00", f"Orquestrando ciclo Visual-First para {req.problem_id}")

        # 1. AGENT 12 — Hardware safety check first
        t0 = time.perf_counter()
        self.registry.mark_running("agent_12", "Auditando RAM/CPU/RTX 3050")
        hw = self.hardware.snapshot(storage_path=self.kb.research_dir)
        self.registry.mark_completed("agent_12", f"RAM livre {hw.ram_available_gb}GB | CPU {hw.cpu_percent}%", (time.perf_counter() - t0) * 1000)
        self._emit(events, "agent_12", req.problem_id, "hardware", "Hardware verificado dentro dos limites domésticos", cpu=hw.cpu_percent, ram_free_gb=hw.ram_available_gb)

        # 2. AGENT 02 — Mathematical Decomposition
        t0 = time.perf_counter()
        self.registry.mark_running("agent_02", f"Formalizando {req.problem_id}")
        formalization = self.decomposition.formalize(req.problem_id, title=title, area=area)
        self.registry.mark_completed("agent_02", f"Classificação {formalization.formal_tier.value}", (time.perf_counter() - t0) * 1000)
        self._emit(events, "agent_02", req.problem_id, "decomposition", f"Formalização estruturada concluída ({formalization.formal_tier.value})")

        # 3. AGENT 01 — Knowledge & Literature Check (uses cached/live references in SQLite)
        t0 = time.perf_counter()
        self.registry.mark_running("agent_01", "Consultando referências multilíngues e livros locais")
        refs = self.kb.list_references(problem_id=req.problem_id, limit=25)
        self.registry.mark_completed("agent_01", f"{len(refs)} referências indexadas", (time.perf_counter() - t0) * 1000)

        # 4. AGENT 05 — Simulation Engine (adaptive 18x18 vs brute force)
        t0 = time.perf_counter()
        self.registry.mark_running("agent_05", f"Executando plugin ({req.strategy}, seed={req.seed})")
        plugin_out, adaptive_bench, exp_record = self.simulation.run_experiment(
            problem_id=req.problem_id,
            hypothesis_id=f"hyp_visual_{req.problem_id}",
            seed=req.seed,
            mode=req.mode,
            strategy=req.strategy,
            params=req.params,
            hw_snapshot=hw,
        )
        self.registry.mark_completed("agent_05", f"Economia adaptativa {adaptive_bench['compute_saved_percent']}%", (time.perf_counter() - t0) * 1000)
        self._emit(events, "agent_05", req.problem_id, "simulation", plugin_out.summary, saved_pct=adaptive_bench["compute_saved_percent"])

        # 5. AGENT 03 & AGENT 04 — Visual Discovery & Computational Physics Wave/Field Coupling
        t0 = time.perf_counter()
        self.registry.mark_running("agent_03", f"Construindo projeção {projection} e hotspots visuais")
        visual_report = self.visual.analyze_and_project(plugin_out, projection=projection)
        self.registry.mark_completed("agent_03", f"{len(visual_report.anomaly_hotspots)} hotspots detectados", (time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        self.registry.mark_running("agent_04", "Avaliando analogia física de campo (Wi-Fi)")
        physics_eval = self.physics.evaluate_field(plugin_out, formalization.physics_tier)
        self.registry.mark_completed("agent_04", f"Tier físico: {formalization.physics_tier.value}", (time.perf_counter() - t0) * 1000)
        self._emit(events, "agent_03", req.problem_id, "visual", "Representação 3D/2D e hotspots visuais extraídos", hotspots=len(visual_report.anomaly_hotspots))

        # 6. AGENT 06 — Pattern Recognition (raw data vs visual verification)
        t0 = time.perf_counter()
        self.registry.mark_running("agent_06", "Extraindo FFT, simetria e divergência de Lyapunov")
        pattern_findings = self.pattern.analyze(plugin_out, visual_report)
        self.registry.mark_completed("agent_06", f"Simetria={pattern_findings['symmetry_index']}", (time.perf_counter() - t0) * 1000)
        self._emit(events, "agent_06", req.problem_id, "pattern", "; ".join(pattern_findings["detected_regimes"]))

        # 7. AGENT 07 & AGENT 08 — Symbolic & Evolutionary Hypothesis Discovery
        t0 = time.perf_counter()
        self.registry.mark_running("agent_07", "Regressão simbólica esparsa SymPy")
        base_hyps = self.symbolic.discover_hypotheses(req.problem_id, plugin_out, plugin_out.suggested_visual_cue)
        self.registry.mark_completed("agent_07", f"{len(base_hyps)} equações candidatas geradas", (time.perf_counter() - t0) * 1000)

        t0 = time.perf_counter()
        self.registry.mark_running("agent_08", "Evolução MAP-Elites preservando critérios imutáveis")
        evolved_hyps, evo_summary = self.evolution.evolve(req.problem_id, req.seed, base_hyps, plugin_out)
        self.registry.mark_completed("agent_08", f"{evo_summary['generations_executed']} gerações evoluídas", (time.perf_counter() - t0) * 1000)
        all_hyps = base_hyps + evolved_hyps

        # 8. AGENT 09 — Quantum-Inspired vs Classical Benchmark
        t0 = time.perf_counter()
        self.registry.mark_running("agent_09", "Benchmarking Quantum-Inspired vs Clássico")
        quantum_bench = self.quantum.benchmark(plugin_out, seed=req.seed)
        self.registry.mark_completed("agent_09", f"Melhor clássico={quantum_bench['classical_best_found']} vs QI={quantum_bench['quantum_inspired_best_found']}", (time.perf_counter() - t0) * 1000)

        # 9. AGENT 10 — Counterexample Hunter
        t0 = time.perf_counter()
        self.registry.mark_running("agent_10", "Atacando hipóteses com aritmética exata")
        counterexamples = self.counterexample.hunt(req.problem_id, all_hyps, seed=req.seed)
        self.registry.mark_completed("agent_10", f"{len(counterexamples)} contraexemplos verificados", (time.perf_counter() - t0) * 1000)
        for cex in counterexamples:
            self.kb.record_counterexample(cex)

        # 10. AGENT 11 — Formal Theorem Prover
        t0 = time.perf_counter()
        self.registry.mark_running("agent_11", "Verificação simbólica auxiliar e esqueleto Lean 4")
        formal_verif = self.formal.verify(formalization)
        self.registry.mark_completed("agent_11", f"Status {formal_verif['assigned_problem_tier']}", (time.perf_counter() - t0) * 1000)

        # 11. AGENT 13 — Scientific Red Team (independent audit)
        t0 = time.perf_counter()
        self.registry.mark_running("agent_13", "Auditoria independente anti-circularidade")
        red_team_audit = self.red_team.audit(req.problem_id, all_hyps, counterexamples, pattern_findings)
        self.registry.mark_completed("agent_13", f"Aprovadas: {red_team_audit['approved_for_testing']} | Rejeitadas: {red_team_audit['rejected']}", (time.perf_counter() - t0) * 1000)
        self._emit(events, "agent_13", req.problem_id, "red_team", f"Red Team: {red_team_audit['approved_for_testing']} aprovadas p/ teste, {red_team_audit['rejected']} rejeitadas")

        # 12. AGENT 14 — Persist experiment, hypotheses & checkpoint
        t0 = time.perf_counter()
        self.registry.mark_running("agent_14", "Persistindo no SQLite + Grafo NetworkX")
        self.kb.record_experiment(exp_record)
        for h in all_hyps:
            self.kb.record_hypothesis(h)
        self.checkpoints.save_problem_checkpoint(
            req.problem_id,
            {
                "last_seed": req.seed,
                "last_strategy": req.strategy,
                "experiment_id": exp_record.experiment_id,
                "sha256_hash": exp_record.sha256_hash,
            },
        )
        self.registry.mark_completed("agent_14", f"Registrado SHA-256 {exp_record.sha256_hash[:10]}", (time.perf_counter() - t0) * 1000)

        # 13. AGENT 15 — Generate 9-file Markdown + PDF scientific dossier
        report_paths: dict[str, str] = {}
        if req.export_reports:
            t0 = time.perf_counter()
            self.registry.mark_running("agent_15", "Gerando dossiê Markdown + PDF vetorial")
            report_paths = self.reporting.generate_dossier(
                formalization=formalization,
                visual_report=visual_report,
                experiment=exp_record,
                adaptive_benchmark=adaptive_bench,
                pattern_findings=pattern_findings,
                hypotheses=all_hyps,
                quantum_benchmark=quantum_bench,
                counterexamples=counterexamples,
                formal_verification=formal_verif,
                red_team_audit=red_team_audit,
                physics_eval=physics_eval,
                references=refs,
                hw=hw,
            )
            self.registry.mark_completed("agent_15", f"{len(report_paths)} arquivos emitidos (MD + PDF)", (time.perf_counter() - t0) * 1000)
            self._emit(events, "agent_15", req.problem_id, "reporting", f"Dossiê completo exportado para research/problems/{req.problem_id}/")

        cycle_id = "cycle_" + compute_sha256([exp_record.experiment_id, req.problem_id, req.seed])[:12]
        self.registry.mark_completed("agent_00", f"Ciclo {cycle_id} concluído", (time.perf_counter() - t_cycle) * 1000)
        self.registry.mark_completed("agent_16", "Estado disponível via API REST e WebSocket", 1.0)

        return DiscoveryCycleResult(
            cycle_id=cycle_id,
            problem_id=req.problem_id,
            strategy=req.strategy,
            mode=req.mode,
            formalization=formalization,
            visual_report=visual_report,
            experiment=exp_record,
            adaptive_benchmark=adaptive_bench,
            pattern_findings=pattern_findings,
            symbolic_hypotheses=all_hyps,
            evolution_summary=evo_summary,
            quantum_benchmark=quantum_bench,
            counterexamples=counterexamples,
            formal_verification=formal_verif,
            red_team_audit=red_team_audit,
            hardware_snapshot=hw,
            report_paths=report_paths,
            events=events,
        )
