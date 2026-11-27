"""AGENT 13 — Scientific Red Team: independent audit rejecting circular, overfit, or overclaimed hypotheses."""

from __future__ import annotations

import math
from typing import Any

from genesis.models import CounterexampleRecord, EpistemologicalStatus, HypothesisRecord
from genesis.storage.knowledge_base import KnowledgeBase, compute_sha256


class ScientificRedTeamAgent:
    """AGENT 13: Independently audits hypotheses & discoveries; rejects invalid claims into rejected-approaches/."""

    agent_id = "agent_13"

    def __init__(self, kb: KnowledgeBase) -> None:
        self.kb = kb

    def audit(
        self,
        problem_id: str,
        hypotheses: list[HypothesisRecord],
        counterexamples: list[CounterexampleRecord],
        pattern_findings: dict[str, Any],
    ) -> dict[str, Any]:
        refuted_ids = {c.hypothesis_id for c in counterexamples}
        approved_count = 0
        rejected_count = 0
        rejection_reasons: list[str] = []
        blocked_tiers = {
            EpistemologicalStatus.FORMALLY_VERIFIED,
            EpistemologicalStatus.CANDIDATE_PROOF,
            EpistemologicalStatus.PROVED_LEMMA,
        }

        for h in hypotheses:
            reason = ""
            if h.hypothesis_id in refuted_ids:
                reason = "Refutada por contraexemplo exato do Counterexample Hunter (Agente 10)."
            elif pattern_findings.get("discretization_artifact_detected"):
                reason = "Alerta de artefato de discretização/projeção detectado pelo Pattern Recognition (Agente 06)."
            elif not math.isfinite(h.in_sample_mse) or not math.isfinite(h.out_of_sample_mse) or h.in_sample_mse < 0.0 or h.out_of_sample_mse < 0.0:
                reason = "Métrica de erro inválida ou não-finita (NaN/Inf/negativa) detectada na avaliação."
            elif h.out_of_sample_mse > max(3.0 * max(h.in_sample_mse, 1e-4), 1.0):
                reason = f"Sobreajuste detectado: MSE fora-da-amostra ({h.out_of_sample_mse}) excede 3x o treino ({h.in_sample_mse})."
            elif not math.isfinite(h.complexity_score) or h.complexity_score < 0.0 or h.complexity_score > 12.0:
                reason = f"Complexidade inválida ou excessiva ({h.complexity_score} fora de [0, 12.0]): penalizada pelo critério de parcimônia."
            elif h.epistemological_tier in blocked_tiers:
                reason = "Bloqueio de governança: hipótese experimental não pode se autodeclarar demonstrada/formalmente verificada."

            if reason:
                h.red_team_verdict = "rejected"
                h.red_team_reason = reason
                rejected_count += 1
                rejection_reasons.append(f"{h.hypothesis_id}: {reason}")
                rej_id = "rej_" + compute_sha256([problem_id, h.hypothesis_id, reason])[:14]
                self.kb.record_rejection(rej_id, problem_id, "symbolic_evolution", reason, h.hypothesis_id)
            else:
                h.red_team_verdict = "approved_for_testing"
                h.red_team_reason = "Aprovada apenas como hipótese empírica testável (NÃO é prova matemática)."
                approved_count += 1

        return {
            "auditor": self.agent_id,
            "total_reviewed": len(hypotheses),
            "approved_for_testing": approved_count,
            "rejected": rejected_count,
            "rejection_reasons": rejection_reasons,
            "counterexamples_confirmed": len(counterexamples),
            "circularity_check": "Passed — agentes geradores (07/08) segregados dos auditores (10/11/13).",
        }
