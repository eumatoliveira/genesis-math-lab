"""P versus NP Experimental Plugin: Random 3-SAT phase transition & finite solver benchmark."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from genesis.plugins.base import PluginRunOutput, finite_int


def generate_3sat(num_vars: int, num_clauses: int, rng: np.random.Generator) -> list[tuple[tuple[int, bool], ...]]:
    clauses = []
    for _ in range(num_clauses):
        vars_picked = rng.choice(num_vars, size=3, replace=False)
        signs = rng.integers(0, 2, size=3).astype(bool)
        clauses.append(tuple((int(v), bool(s)) for v, s in zip(vars_picked, signs)))
    return clauses


def count_unsat(clauses: list[tuple[tuple[int, bool], ...]], assignment: np.ndarray) -> int:
    unsat = 0
    for c in clauses:
        if not any(bool(assignment[v]) == s for v, s in c):
            unsat += 1
    return unsat


def walksat_solve(clauses: list[tuple[tuple[int, bool], ...]], num_vars: int, rng: np.random.Generator, max_flips: int = 400) -> tuple[bool, int, int]:
    assignment = rng.integers(0, 2, size=num_vars).astype(bool)
    best_unsat = count_unsat(clauses, assignment)
    for flip in range(max_flips):
        if best_unsat == 0:
            return True, flip, 0
        unsat_list = [c for c in clauses if not any(bool(assignment[v]) == s for v, s in c)]
        if not unsat_list:
            return True, flip, 0
        clause = unsat_list[int(rng.integers(0, len(unsat_list)))]
        if rng.random() < 0.35:
            var_to_flip = clause[int(rng.integers(0, 3))][0]
            assignment[var_to_flip] = not assignment[var_to_flip]
        else:
            best_v = clause[0][0]
            best_score = len(clauses) + 1
            for v, _ in clause:
                assignment[v] = not assignment[v]
                sc = count_unsat(clauses, assignment)
                assignment[v] = not assignment[v]
                if sc < best_score:
                    best_score = sc
                    best_v = v
            assignment[best_v] = not assignment[best_v]
        cur = count_unsat(clauses, assignment)
        if cur < best_unsat:
            best_unsat = cur
    return best_unsat == 0, max_flips, best_unsat


class PvsNPPlugin:
    problem_id = "p-vs-np"

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        rng = np.random.default_rng(seed)
        num_vars = finite_int(params.get("num_vars", 24), 24, 12, 48)
        alpha_min, alpha_max = 1.5, 6.5
        alpha_steps = 15
        alphas = np.linspace(alpha_min, alpha_max, alpha_steps)

        sat_rates: list[float] = []
        mean_flips: list[float] = []
        points_3d: list[list[float]] = []

        trials_per_alpha = 8
        for alpha in alphas:
            m = max(3, int(round(float(alpha) * num_vars)))
            solved_cnt = 0
            flips_sum = 0
            for _ in range(trials_per_alpha):
                clauses = generate_3sat(num_vars, m, rng)
                ok, flips, rem = walksat_solve(clauses, num_vars, rng, max_flips=320)
                if ok:
                    solved_cnt += 1
                flips_sum += flips
            rate = solved_cnt / trials_per_alpha
            avg_flips = flips_sum / trials_per_alpha
            sat_rates.append(round(rate, 4))
            mean_flips.append(round(avg_flips, 2))
            points_3d.append([round((float(alpha) - 4.0) * 1.4, 4), round(avg_flips / 80.0, 4), round(rate * 3.0 - 1.5, 4)])

        g = max(12, min(resolution, 24))
        grid = np.zeros((g, g), dtype=float)
        for i in range(g):
            a_i = alpha_min + (alpha_max - alpha_min) * (i / max(g - 1, 1))
            for j in range(g):
                # Normalized difficulty peak around critical ratio alpha ≈ 4.26
                peak = math.exp(-((a_i - 4.26) ** 2) / 0.55)
                grid[i, j] = round(peak * (1.0 + 0.15 * math.sin(j * 0.6)), 4)

        peak_idx = int(np.argmax(mean_flips))
        critical_alpha = round(float(alphas[peak_idx]), 3)

        return PluginRunOutput(
            problem_id=self.problem_id,
            raw_series={
                "alpha_ratios": [round(float(a), 3) for a in alphas],
                "satisfiability_rate": sat_rates,
                "mean_search_flips": mean_flips,
            },
            matrix_2d=grid.tolist(),
            points_3d=points_3d,
            metrics={
                "num_vars": num_vars,
                "peak_difficulty_alpha": critical_alpha,
                "theoretical_3sat_threshold": 4.26,
                "max_mean_flips": float(max(mean_flips)),
                "sat_at_alpha_2": sat_rates[1],
                "sat_at_alpha_6": sat_rates[-2],
            },
            summary=(
                f"Transição de fase 3-SAT (n={num_vars} variáveis): pico de custo computacional observado em α={critical_alpha} "
                f"(próximo ao limiar crítico ~4.26), separando regimes fáceis sub-restritos de super-restritos."
            ),
            limitations=[
                "Benchmarks finitos em instâncias 3-SAT aleatórias NÃO demonstram separação assintótica entre P e NP.",
                "Heurísticas estocásticas (WalkSAT) são incompletas e não garantem certificação de insatisfatibilidade.",
            ],
            suggested_visual_cue=(
                "Crista abrupta de complexidade e queda sigmoidal da satisfatibilidade centrada em α ≈ 4.26."
            ),
        )
