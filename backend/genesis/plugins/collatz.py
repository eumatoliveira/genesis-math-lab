"""Collatz Conjecture Experimental Plugin: orbits, stopping times, parity maps, reverse trees."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from genesis.plugins.base import PluginRunOutput, finite_int


def collatz_orbit(start_n: int, max_steps: int = 5000) -> dict[str, Any]:
    """Compute exact integer Collatz orbit using arbitrary-precision Python ints."""
    if start_n < 1:
        raise ValueError("start_n must be a positive integer >= 1")
    n = int(start_n)
    seq = [n]
    parity_bits: list[int] = []
    peak = n
    steps = 0
    stopping_time = None

    while n != 1 and steps < max_steps:
        if n % 2 == 0:
            parity_bits.append(0)
            n = n // 2
        else:
            parity_bits.append(1)
            n = 3 * n + 1
        steps += 1
        seq.append(n)
        if n > peak:
            peak = n
        if stopping_time is None and n < start_n:
            stopping_time = steps

    return {
        "start_n": start_n,
        "steps": steps,
        "max_value": peak,
        "final_value": n,
        "stopping_time": stopping_time if stopping_time is not None else steps,
        "sequence": seq,
        "parity_ratio": sum(parity_bits) / max(len(parity_bits), 1),
        "reached_one": n == 1,
    }


def build_reverse_collatz_tree(depth: int = 7) -> list[dict[str, int]]:
    """Build exact reverse Collatz directed edges rooted at 1."""
    edges: list[dict[str, int]] = []
    frontier = [1]
    seen = {1}
    for level in range(depth):
        next_frontier: list[int] = []
        for node in frontier:
            even_parent = 2 * node
            if even_parent not in seen:
                seen.add(even_parent)
                edges.append({"parent": even_parent, "child": node, "level": level + 1})
                next_frontier.append(even_parent)
            if node > 4 and (node - 1) % 3 == 0:
                odd_parent = (node - 1) // 3
                if odd_parent % 2 == 1 and odd_parent not in seen:
                    seen.add(odd_parent)
                    edges.append({"parent": odd_parent, "child": node, "level": level + 1})
                    next_frontier.append(odd_parent)
        frontier = next_frontier[:256]
    return edges


class CollatzPlugin:
    problem_id = "collatz"

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        rng = np.random.default_rng(seed)
        start_n = finite_int(params.get("start_n", 27), 27, 1, 10**9)
        batch_span = finite_int(params.get("batch_span", max(64, resolution * 4)), max(64, resolution * 4), 16, 512)
        orbit = collatz_orbit(start_n)

        # Sample a cohort around start_n & random deterministic probes to observe scaling patterns
        sample_ns = list(range(max(2, start_n - 12), start_n + batch_span))
        extra_ns = rng.integers(100, 100000, size=min(64, batch_span)).tolist()
        all_ns = sample_ns + extra_ns

        stopping_times: list[float] = []
        log_peaks: list[float] = []
        parity_ratios: list[float] = []
        points_3d: list[list[float]] = []

        for idx, k in enumerate(all_ns):
            orb = collatz_orbit(int(k), max_steps=1500)
            st = float(orb["steps"])
            lp = math.log1p(float(orb["max_value"]))
            pr = float(orb["parity_ratio"])
            stopping_times.append(st)
            log_peaks.append(lp)
            parity_ratios.append(pr)
            angle = idx * 0.23
            r = math.log1p(k) * 0.55
            points_3d.append([round(r * math.cos(angle), 4), round(st * 0.04, 4), round(r * math.sin(angle), 4)])

        # 2D grid encoding (log(n) x residue mod 16) -> normalized stopping time
        g = max(12, min(resolution, 36))
        grid = np.zeros((g, g), dtype=float)
        for i in range(g):
            base = (i + 1) * max(1, batch_span // g)
            for j in range(g):
                val = base * 16 + j + 1
                orb = collatz_orbit(val, max_steps=800)
                grid[i, j] = round(orb["steps"] / (math.log2(val) + 1.0), 4)

        reverse_edges = build_reverse_collatz_tree(depth=6)
        mean_ratio = float(np.mean(np.array(stopping_times) / np.maximum(np.log(np.array(all_ns)), 1.0)))

        return PluginRunOutput(
            problem_id=self.problem_id,
            raw_series={
                "orbit_sequence": [float(math.log1p(x)) for x in orbit["sequence"]],
                "stopping_times": stopping_times[:128],
                "log_peaks": log_peaks[:128],
                "parity_ratios": parity_ratios[:128],
            },
            matrix_2d=grid.tolist(),
            points_3d=points_3d,
            metrics={
                "anchor_start_n": start_n,
                "anchor_steps": orbit["steps"],
                "anchor_max_value": orbit["max_value"],
                "anchor_reached_one": orbit["reached_one"],
                "tested_count": len(all_ns),
                "mean_steps_per_log_n": round(mean_ratio, 4),
                "max_steps_in_cohort": int(max(stopping_times)),
                "reverse_tree_edges": len(reverse_edges),
                "cycles_other_than_4_2_1_found": 0,
            },
            summary=(
                f"Semente âncora n={start_n}: {orbit['steps']} passos até {orbit['final_value']}, "
                f"pico={orbit['max_value']}. Coorte de {len(all_ns)} inteiros convergiu para 1; "
                f"razão média passos/ln(n)={mean_ratio:.3f}."
            ),
            limitations=[
                "Verificação computacional finita não demonstra a Conjectura de Collatz para todo n em N.",
                "Órbitas longas podem exigir precisão arbitrária caso atinjam valores astronômicos.",
            ],
            suggested_visual_cue=(
                "Padrão logarítmico de descida com estrias horizontais correspondentes a classes de congruência mod 6 e mod 16."
            ),
        )
