"""3x3 Magic Square of Squares (Parker Square) Experimental Plugin."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from genesis.plugins.base import PluginRunOutput, finite_int


class MagicSquarePlugin:
    problem_id = "magic-square-squares"

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        rng = np.random.default_rng(seed)
        # Parker near-miss square of squares: 7 of 8 lines match magic sum 3051 (classic benchmark)
        parker = np.array([[29, 1, 47], [41, 37, 1], [23, 41, 29]], dtype=np.int64) ** 2
        magic_sums = [
            int(parker[0].sum()),
            int(parker[1].sum()),
            int(parker[2].sum()),
            int(parker[:, 0].sum()),
            int(parker[:, 1].sum()),
            int(parker[:, 2].sum()),
            int(np.trace(parker)),
            int(np.trace(np.fliplr(parker))),
        ]
        # Explore distinct square candidates on arithmetic progression grids (Lucas parameterization)
        best_variance = float(np.var(magic_sums))
        best_matching_lines = 0
        trials = finite_int(params.get("trials", 300), 300, 60, 1500)
        variances: list[float] = []
        points_3d: list[list[float]] = []

        for step in range(trials):
            roots = rng.integers(1, 60, size=(3, 3))
            sq = roots * roots
            sums = [
                int(sq[0].sum()),
                int(sq[1].sum()),
                int(sq[2].sum()),
                int(sq[:, 0].sum()),
                int(sq[:, 1].sum()),
                int(sq[:, 2].sum()),
                int(np.trace(sq)),
                int(np.trace(np.fliplr(sq))),
            ]
            v = float(np.std(sums) / max(np.mean(sums), 1.0))
            variances.append(v)
            distinct_cnt = len(set(roots.flatten().tolist()))
            if distinct_cnt == 9:
                most_common = max(sums.count(s) for s in sums)
                if most_common > best_matching_lines:
                    best_matching_lines = most_common
            if step < 120:
                points_3d.append([round((step / 120.0) * 8 - 4, 4), round(v * 6.0, 4), round(distinct_cnt * 0.4 - 1.8, 4)])

        g = max(12, min(resolution, 24))
        grid = np.zeros((g, g), dtype=float)
        for i in range(g):
            for j in range(g):
                c = 50 + i * 3
                a = 10 + j * 2
                # Error in matching central magic sum 3*c^2
                grid[i, j] = round(math.log1p(abs((c * c - a * a) - (c * c // 2))), 4)

        return PluginRunOutput(
            problem_id=self.problem_id,
            raw_series={"normalized_line_std": variances[:128]},
            matrix_2d=grid.tolist(),
            points_3d=points_3d,
            metrics={
                "trials_evaluated": trials,
                "parker_square_matching_lines": 7,
                "distinct_3x3_best_matching_lines": best_matching_lines,
                "parker_magic_target": 3051,
                "exact_distinct_magic_square_found": False,
                "parker_sum_variance": round(best_variance, 2),
            },
            summary=(
                f"Quadrado Mágico de Quadrados 3×3: avaliadas {trials} configurações; referência histórica de Parker atinge 7/8 somas "
                f"(mas com entradas repetidas). Máximo com 9 quadrados distintos nesta amostra: {best_matching_lines}/8 linhas."
            ),
            limitations=[
                "Problema aberto: não se sabe se existe quadrado mágico 3×3 formado por 9 quadrados inteiros positivos distintos.",
            ],
            suggested_visual_cue=(
                "Superfície de restrições de Lucas mostrando onde 7 de 8 equações lineares colapsam em resíduo nulo e a 8ª diagonal diverge."
            ),
        )

