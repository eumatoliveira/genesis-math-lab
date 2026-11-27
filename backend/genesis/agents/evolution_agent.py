"""AGENT 08 — Evolutionary Discovery: mutates candidate hypotheses via MAP-Elites diversity preserving genealogy."""

from __future__ import annotations

import math
from typing import Any

import numpy as np
import sympy as sp

from genesis.models import EpistemologicalStatus, HypothesisRecord
from genesis.plugins.base import PluginRunOutput
from genesis.storage.knowledge_base import compute_sha256


class EvolutionaryDiscoveryAgent:
    """AGENT 08: Evolves numerical/symbolic search heuristics without ever weakening validation criteria."""

    agent_id = "agent_08"

    def evolve(
        self,
        problem_id: str,
        seed: int,
        base_hypotheses: list[HypothesisRecord],
        plugin_out: PluginRunOutput,
    ) -> tuple[list[HypothesisRecord], dict[str, Any]]:
        if not base_hypotheses:
            return [], {
                "generations_executed": 0,
                "map_elites_niches_filled": 0,
                "validation_criteria_immutable": True,
                "best_parent_id": None,
                "best_evolved_oos_mse": None,
            }

        rng = np.random.default_rng(seed + 101)
        evolved: list[HypothesisRecord] = []
        best_parent = min(
            base_hypotheses,
            key=lambda h: (
                (h.out_of_sample_mse if math.isfinite(h.out_of_sample_mse) and h.out_of_sample_mse >= 0 else 1e30)
                + 0.05 * (h.complexity_score if math.isfinite(h.complexity_score) and h.complexity_score >= 0 else 1e6)
            ),
        )

        # Immutable evaluation objective (Section 5 Agent 08 governance): exact same 70/30 out-of-sample split
        first_key = next(iter(plugin_out.raw_series.keys()), "series")
        y = np.array(plugin_out.raw_series.get(first_key, [1.0, 2.0]), dtype=float)
        y = np.nan_to_num(y, nan=0.0, posinf=1e6, neginf=-1e6)
        if y.size < 10:
            y = np.pad(y, (0, 10 - y.size), mode="edge")
        x = np.linspace(1.0, float(y.size), y.size)
        split = int(max(6, round(y.size * 0.7)))
        x_train, x_test = x[:split], x[split:]
        y_train, y_test = y[:split], y[split:]
        y_var = float(np.var(y)) + 1e-8

        sym_x = sp.Symbol("x", positive=True)
        parent_fn = None
        try:
            parent_expr = sp.sympify(best_parent.expression_sympy, locals={"x": sym_x})
            parent_fn = sp.lambdify(sym_x, parent_expr, modules=["numpy"])
        except Exception:
            parent_fn = None

        def eval_pred(xv: np.ndarray) -> np.ndarray | None:
            if parent_fn is None:
                return None
            try:
                with np.errstate(divide="ignore", invalid="ignore", over="ignore"):
                    raw = np.asarray(parent_fn(xv), dtype=float)
                if raw.ndim == 0:
                    raw = np.full(xv.shape, float(raw), dtype=float)
                if raw.shape != xv.shape or not np.all(np.isfinite(raw)):
                    return None
                return raw
            except Exception:
                return None

        base_pred_tr = eval_pred(x_train)
        base_pred_te = eval_pred(x_test)

        generations = 3
        archive_niches: dict[str, float] = {}
        for gen in range(1, generations + 1):
            scale_factor = float(1.0 + rng.normal(0.0, 0.08 / gen))
            if base_pred_tr is not None and base_pred_te is not None:
                with np.errstate(over="ignore", invalid="ignore"):
                    mutated_is = float(np.mean((y_train - scale_factor * base_pred_tr) ** 2))
                    mutated_oos = float(np.mean((y_test - scale_factor * base_pred_te) ** 2))
            else:
                # Never fabricate MSE improvement when parent expression fails evaluation
                mutated_is = math.inf
                mutated_oos = math.inf

            niche = f"complexity_bin_{min(6, max(1, round(best_parent.complexity_score)))}"
            if math.isfinite(mutated_oos):
                archive_niches[niche] = min(archive_niches.get(niche, 1e9), mutated_oos)

            child_expr = f"({round(scale_factor, 4)}) * ({best_parent.expression_sympy})"
            hid = "hyp_" + compute_sha256([best_parent.hypothesis_id, gen, child_expr, seed])[:14]
            r2_rel = max(-1.0, 1.0 - mutated_oos / y_var) if math.isfinite(mutated_oos) else -1.0
            evolved.append(
                HypothesisRecord(
                    hypothesis_id=hid,
                    problem_id=problem_id,
                    parent_id=best_parent.hypothesis_id,
                    generation=gen,
                    origin_agent=self.agent_id,
                    visual_cue=f"Mutação evolutiva MAP-Elites gen={gen} (nicho={niche})",
                    expression_sympy=child_expr,
                    plain_description=(
                        f"Descendente de {best_parent.hypothesis_id} (geração {gen}) preservando critério imutável "
                        f"de erro fora-da-amostra normalizado (R² relativo={r2_rel:.4f})."
                    ),
                    in_sample_mse=round(mutated_is, 6) if math.isfinite(mutated_is) else math.inf,
                    out_of_sample_mse=round(mutated_oos, 6) if math.isfinite(mutated_oos) else math.inf,
                    complexity_score=round(best_parent.complexity_score + 0.2, 3),
                    epistemological_tier=EpistemologicalStatus.HYPOTHESIS,
                    red_team_verdict="pending",
                    red_team_reason="Aguardando auditoria do Red Team (Agente 13).",
                )
            )

        finite_oos = [h.out_of_sample_mse for h in evolved if math.isfinite(h.out_of_sample_mse)]
        summary = {
            "generations_executed": generations,
            "map_elites_niches_filled": len(archive_niches),
            "validation_criteria_immutable": True,
            "best_parent_id": best_parent.hypothesis_id,
            "best_evolved_oos_mse": round(min(finite_oos), 6) if finite_oos else None,
        }
        return evolved, summary
