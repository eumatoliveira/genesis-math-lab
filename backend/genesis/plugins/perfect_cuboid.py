"""Perfect Cuboid Open Problem Plugin: exact Euler bricks + integer space-diagonal near-miss explorer."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from genesis.plugins.base import PluginRunOutput, finite_int


def euler_brick_from_pythagorean(u: int, v: int, w: int) -> tuple[int, int, int]:
    """Saunderson parametric family generating guaranteed integer Euler bricks (face diagonals integral)."""
    a = abs(u * (4 * v * v - w * w))
    b = abs(v * (4 * u * u - w * w))
    c = abs(4 * u * v * w)
    return a, b, c


def check_cuboid_exact(a: int, b: int, c: int) -> dict[str, Any]:
    """Evaluate exact integer face diagonals and space diagonal distance using Python BigInt."""
    if a <= 0 or b <= 0 or c <= 0:
        return {"valid_euler_brick": False, "is_perfect_cuboid": False, "space_residual": 10**12}

    d1_sq = a * a + b * b
    d2_sq = a * a + c * c
    d3_sq = b * b + c * c
    g_sq = a * a + b * b + c * c

    r1 = math.isqrt(d1_sq)
    r2 = math.isqrt(d2_sq)
    r3 = math.isqrt(d3_sq)
    rg = math.isqrt(g_sq)

    face_ok = (r1 * r1 == d1_sq) and (r2 * r2 == d2_sq) and (r3 * r3 == d3_sq)
    # Closest integer squared distance to rg^2 or (rg+1)^2
    res_low = abs(g_sq - rg * rg)
    res_high = abs((rg + 1) * (rg + 1) - g_sq)
    space_res = min(res_low, res_high)
    is_perfect = face_ok and (rg * rg == g_sq)

    return {
        "edges": [a, b, c],
        "face_diagonals_sq": [d1_sq, d2_sq, d3_sq],
        "valid_euler_brick": face_ok,
        "space_diag_sq": g_sq,
        "nearest_int_diag": rg if res_low <= res_high else rg + 1,
        "space_residual": space_res,
        "relative_error": space_res / max(g_sq, 1),
        "is_perfect_cuboid": is_perfect,
    }


class PerfectCuboidPlugin:
    problem_id = "perfect-cuboid"

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        # Include the classic minimal Euler brick (44, 117, 240) plus Saunderson parametric sweep
        max_param = finite_int(params.get("max_param", 14), 14, 6, 24)
        bricks: list[dict[str, Any]] = [check_cuboid_exact(44, 117, 240), check_cuboid_exact(85, 132, 720)]

        triples = [(3, 4, 5), (5, 12, 13), (8, 15, 17), (7, 24, 25), (20, 21, 29), (9, 40, 41)]
        for idx, (u, v, w) in enumerate(triples):
            for k in range(1, max_param // 3 + 1):
                a, b, c = euler_brick_from_pythagorean(u * k, v, w)
                if a > 0 and b > 0 and c > 0:
                    res = check_cuboid_exact(a, b, c)
                    if res["valid_euler_brick"]:
                        bricks.append(res)

        bricks.sort(key=lambda x: x["relative_error"])
        points_3d: list[list[float]] = []
        rel_errors: list[float] = []
        for b_info in bricks[:128]:
            a, b, c = b_info["edges"]
            scale = max(math.log1p(a), math.log1p(b), math.log1p(c), 1.0)
            points_3d.append(
                [
                    round((math.log1p(a) / scale) * 4.0 - 2.0, 4),
                    round(-math.log10(max(b_info["relative_error"], 1e-16)) * 0.35, 4),
                    round((math.log1p(b) / scale) * 4.0 - 2.0, 4),
                ]
            )
            rel_errors.append(float(b_info["relative_error"]))

        g = max(12, min(resolution, 28))
        grid = np.zeros((g, g), dtype=float)
        for i in range(1, g + 1):
            for j in range(1, g + 1):
                res = check_cuboid_exact(44 * i, 117 * j, 240)
                grid[i - 1, j - 1] = round(math.log1p(res["space_residual"]), 4)

        best = bricks[0]
        perfect_found = sum(1 for x in bricks if x["is_perfect_cuboid"])

        return PluginRunOutput(
            problem_id=self.problem_id,
            raw_series={
                "relative_space_residuals": rel_errors,
                "best_edges": [float(e) for e in best["edges"]],
            },
            matrix_2d=grid.tolist(),
            points_3d=points_3d,
            metrics={
                "euler_bricks_verified": len(bricks),
                "perfect_cuboids_found": perfect_found,
                "best_brick_edges": best["edges"],
                "best_relative_error": best["relative_error"],
                "classic_minimal_brick": [44, 117, 240],
            },
            summary=(
                f"{len(bricks)} tijolos de Euler válidos gerados com aritmética exata; nenhum cuboide perfeito encontrado "
                f"(menor erro relativo da diagonal espacial={best['relative_error']:.3e} em {best['edges']})."
            ),
            limitations=[
                "A existência de um cuboide perfeito permanece problema em aberto na teoria dos números diofantina.",
                "Buscas exaustivas na literatura já descartaram todas as caixas com menor aresta ou diagonal até bilhões.",
            ],
            suggested_visual_cue=(
                "Vales geométricos da razão (a^2+b^2+c^2)/g^2 se aproximando de 1 ao longo de famílias paramétricas de Saunderson."
            ),
        )
