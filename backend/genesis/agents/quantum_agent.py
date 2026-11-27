"""AGENT 09 — Quantum-Inspired Computing: Simulated Quantum Annealing vs classical baseline benchmark."""

from __future__ import annotations

import math
import time
from typing import Any

import numpy as np

from genesis.plugins.base import PluginRunOutput


class QuantumInspiredAgent:
    """AGENT 09: Benchmarks classical path-integral quantum-inspired tunneling against pure Monte Carlo."""

    agent_id = "agent_09"

    def benchmark(self, plugin_out: PluginRunOutput, seed: int) -> dict[str, Any]:
        mat = np.array(plugin_out.matrix_2d, dtype=float) if plugin_out.matrix_2d else np.zeros((4, 4), dtype=float)
        if mat.ndim != 2 or mat.size == 0:
            mat = np.zeros((4, 4), dtype=float)
        mat = np.nan_to_num(mat, nan=0.0, posinf=1e6, neginf=-1e6)
        rows, cols = mat.shape
        rng_q = np.random.default_rng(seed + 7)
        rng_c = np.random.default_rng(seed + 7)

        steps = 120
        # Target: locate global minimum energy valley in the 2D landscape
        global_min = float(np.min(mat))

        # 1. Classical Random Restart / Metropolis baseline
        t0_c = time.perf_counter()
        ci, cj = int(rng_c.integers(0, rows)), int(rng_c.integers(0, cols))
        best_c = float(mat[ci, cj])
        for s in range(steps):
            ni = (ci + int(rng_c.integers(-2, 3))) % rows
            nj = (cj + int(rng_c.integers(-2, 3))) % cols
            val = float(mat[ni, nj])
            temp = max(0.05, 1.0 - s / steps)
            if val < best_c or rng_c.random() < math.exp(-max(0.0, val - best_c) / temp):
                ci, cj = ni, nj
                best_c = min(best_c, val)
        ms_c = (time.perf_counter() - t0_c) * 1000.0

        # 2. Quantum-Inspired Multi-Trotter Tunneling + Phase Interference
        t0_q = time.perf_counter()
        trotter_replicas = 4
        coords = [(int(rng_q.integers(0, rows)), int(rng_q.integers(0, cols))) for _ in range(trotter_replicas)]
        best_q = min(float(mat[r, c]) for r, c in coords)
        for s in range(steps):
            gamma = 1.6 * (1.0 - s / steps) + 0.05  # transverse tunneling field decay
            for rep in range(trotter_replicas):
                ri, rj = coords[rep]
                # Long-range tunneling jump proportional to transverse field gamma
                jump = max(1, int(round(gamma * 2.5)))
                ni = (ri + int(rng_q.integers(-jump, jump + 1))) % rows
                nj = (rj + int(rng_q.integers(-jump, jump + 1))) % cols
                val = float(mat[ni, nj])
                cur = float(mat[ri, rj])
                # Coupling to neighbor replica encourages coherent valley convergence
                neighbor_i, neighbor_j = coords[(rep + 1) % trotter_replicas]
                coupling_bonus = -0.05 * math.hypot(ni - neighbor_i, nj - neighbor_j)
                if val + coupling_bonus < cur or rng_q.random() < math.exp(-max(0.0, val - cur) / max(gamma, 0.05)):
                    coords[rep] = (ni, nj)
                    if val < best_q:
                        best_q = val
        ms_q = (time.perf_counter() - t0_q) * 1000.0

        return {
            "method": "Simulated Quantum Annealing (4 réplicas de Trotter com campo transverso Γ decrescente)",
            "classical_baseline": "Metropolis-Hastings clássico em hardware convencional",
            "landscape_global_min_observed": round(global_min, 5),
            "classical_best_found": round(best_c, 5),
            "quantum_inspired_best_found": round(best_q, 5),
            "classical_ms": round(ms_c, 3),
            "quantum_inspired_ms": round(ms_q, 3),
            "quantum_inspired_improved_valley": best_q <= best_c,
            "honest_caveat": (
                "Executa em CPU clássica simulando tunelamento de barreiras estreitas; "
                "NÃO oferece aceleração quântica assintótica universal sobre NP-difíceis."
            ),
        }
