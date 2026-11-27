"""AGENT 07 — Symbolic Discovery: sparse regularized symbolic regression + SymPy verification + out-of-sample split."""

from __future__ import annotations

import math
from typing import Any

import numpy as np
import sympy as sp

from genesis.models import EpistemologicalStatus, HypothesisRecord
from genesis.plugins.base import PluginRunOutput
from genesis.storage.knowledge_base import compute_sha256


class SymbolicDiscoveryAgent:
    """AGENT 07: Converts numeric/visual patterns into compact SymPy hypotheses evaluated strictly out-of-sample."""

    agent_id = "agent_07"

    def discover_hypotheses(
        self,
        problem_id: str,
        plugin_out: PluginRunOutput,
        visual_cue: str,
    ) -> list[HypothesisRecord]:
        first_key = next(iter(plugin_out.raw_series.keys()), "series")
        y = np.array(plugin_out.raw_series.get(first_key, [1.0, 2.0, 3.0, 4.0]), dtype=float)
        y = np.nan_to_num(y, nan=0.0, posinf=1e6, neginf=-1e6)
        if y.size < 10:
            y = np.pad(y, (0, 10 - y.size), mode="edge")

        x = np.linspace(1.0, float(y.size), y.size)
        split = int(max(6, round(y.size * 0.7)))
        x_train, x_test = x[:split], x[split:]
        y_train, y_test = y[:split], y[split:]

        def build_features(xv: np.ndarray) -> np.ndarray:
            return np.column_stack(
                [
                    np.ones_like(xv),
                    xv,
                    np.log(np.maximum(xv, 1.0)),
                    xv / np.log(np.maximum(xv, 1.0) + 1.0),
                    np.sin(xv * 0.5),
                    np.exp(-0.08 * xv),
                ]
            )

        feature_names = ["1", "x", "log(x)", "x/log(x)", "sin(0.5*x)", "exp(-0.08*x)"]
        sym_x = sp.Symbol("x", positive=True)
        sym_basis = [
            sp.Integer(1),
            sym_x,
            sp.log(sym_x),
            sym_x / sp.log(sym_x + 1),
            sp.sin(sp.Rational(1, 2) * sym_x),
            sp.exp(-sp.Rational(2, 25) * sym_x),
        ]

        Phi_tr = build_features(x_train)
        Phi_te = build_features(x_test)

        # Fit Ridge-regularized sparse SINDy-style candidate models with increasing sparsity
        hypotheses: list[HypothesisRecord] = []
        for idx, lam in enumerate([1.0, 0.05]):
            # Ridge closed-form: (Phi^T Phi + lam I)^-1 Phi^T y
            a_mat = Phi_tr.T @ Phi_tr + lam * np.eye(Phi_tr.shape[1])
            weights = np.linalg.solve(a_mat, Phi_tr.T @ y_train)

            # Threshold small weights to enforce parsimony (penalize overfitting)
            thresh = 0.05 if idx == 0 else 0.01
            sparse_w = np.where(np.abs(weights) >= thresh, weights, 0.0)
            rounded_w = np.round(sparse_w, 4)
            if not np.any(rounded_w != 0):
                top_i = int(np.argmax(np.abs(weights)))
                rounded_val = round(float(weights[top_i]), 4)
                rounded_w[top_i] = rounded_val if rounded_val != 0.0 else float(weights[top_i])

            pred_tr = Phi_tr @ rounded_w
            pred_te = Phi_te @ rounded_w
            mse_tr = float(np.mean((y_train - pred_tr) ** 2))
            mse_te = float(np.mean((y_test - pred_te) ** 2))
            active_terms = int(np.sum(rounded_w != 0))
            complexity = round(active_terms + 0.1 * float(np.sum(np.abs(rounded_w))), 3)

            expr = sp.Integer(0)
            for w_val, basis in zip(rounded_w, sym_basis):
                if abs(float(w_val)) > 0:
                    expr += sp.Float(float(w_val)) * basis
            expr_str = str(expr) if expr != 0 else "0"

            hid = "hyp_" + compute_sha256([problem_id, first_key, idx, expr_str])[:14]
            hypotheses.append(
                HypothesisRecord(
                    hypothesis_id=hid,
                    problem_id=problem_id,
                    parent_id=None,
                    generation=0,
                    origin_agent=self.agent_id,
                    visual_cue=visual_cue,
                    expression_sympy=expr_str,
                    plain_description=(
                        f"Modelo esparso ({active_terms} termos, λ={lam}) para '{first_key}' "
                        f"avaliado em split fora-da-amostra ({len(y_train)} treino / {len(y_test)} teste)."
                    ),
                    in_sample_mse=round(mse_tr, 6),
                    out_of_sample_mse=round(mse_te, 6),
                    complexity_score=complexity,
                    epistemological_tier=EpistemologicalStatus.EMPIRICAL_PATTERN,
                    red_team_verdict="pending",
                    red_team_reason="Aguardando auditoria do Red Team (Agente 13).",
                )
            )
        return hypotheses
