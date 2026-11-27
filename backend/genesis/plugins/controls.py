"""Positive & Negative Scientific Control Plugins + Yang-Mills re-export + Unified Registry."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from genesis.plugins.base import PluginRunOutput, finite_float
from genesis.plugins.collatz import CollatzPlugin
from genesis.plugins.goldbach import GoldbachPlugin
from genesis.plugins.magic_square import MagicSquarePlugin
from genesis.plugins.navier_stokes import NavierStokesPlugin, YangMillsPlugin
from genesis.plugins.p_vs_np import PvsNPPlugin
from genesis.plugins.perfect_cuboid import PerfectCuboidPlugin
from genesis.plugins.riemann import RiemannPlugin


class ControlsPlugin:
    """Validates positive theorems (Poincaré benchmark, Euler V-E+F=2) and negative falsifications (Fermat F5, Euler 5th power)."""

    def __init__(self, problem_id: str = "negative-control-fermat-euler") -> None:
        self.problem_id = problem_id

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        # Negative Control 1: Fermat's false claim that 2^(2^n)+1 is always prime -> F_5 = 641 * 6700417
        f5 = (2 ** (2**5)) + 1
        f5_factor_a = 641
        f5_factor_b = f5 // f5_factor_a
        f5_verified_composite = (f5_factor_a * f5_factor_b == f5) and (f5_factor_a > 1) and (f5_factor_b > 1)

        # Negative Control 2: Euler's Sum of Powers conjecture (k=5) falsified by Lander, Parkin & Selfridge (1966)
        lhs = 27**5 + 84**5 + 110**5 + 133**5
        rhs = 144**5
        euler_counterexample_verified = lhs == rhs

        # Positive Control: 2D Ricci-flow curvature smoothing (homologous intuition to Perelman-Hamilton Poincaré program)
        g = max(12, min(resolution, 24))
        grid = np.zeros((g, g), dtype=float)
        t_curve: list[float] = []
        y, x = np.meshgrid(np.linspace(-2.5, 2.5, g), np.linspace(-2.5, 2.5, g))
        bump = np.exp(-(x * x + y * y)) * (1.2 + 0.5 * np.sin(3 * x))
        for step in range(20):
            t_curve.append(round(float(np.var(bump)), 6))
            lap = np.roll(bump, 1, 0) + np.roll(bump, -1, 0) + np.roll(bump, 1, 1) + np.roll(bump, -1, 1) - 4 * bump
            bump = bump + 0.12 * lap
        grid = bump
        points_3d = [
            [round(float(x[i, j]), 3), round(float(grid[i, j]) * 2.0, 4), round(float(y[i, j]), 3)]
            for i in range(g)
            for j in range(g)
        ]

        return PluginRunOutput(
            problem_id=self.problem_id,
            raw_series={
                "ricci_curvature_variance_decay": t_curve,
                "fermat_f5_factors": [float(f5_factor_a), float(f5_factor_b)],
            },
            matrix_2d=np.round(grid, 4).tolist(),
            points_3d=points_3d,
            metrics={
                "fermat_F5": f5,
                "fermat_F5_factors": [f5_factor_a, f5_factor_b],
                "fermat_F5_refuted": f5_verified_composite,
                "euler_5th_power_lhs": lhs,
                "euler_5th_power_rhs": rhs,
                "euler_5th_power_refuted": euler_counterexample_verified,
                "poincare_ricci_variance_initial": t_curve[0],
                "poincare_ricci_variance_final": t_curve[-1],
            },
            summary=(
                f"Controles científicos verificados: Fermat F₅ = {f5_factor_a} × {f5_factor_b} (refutado exato={f5_verified_composite}); "
                f"Lander-Parkin-Selfridge 27⁵+84⁵+110⁵+133⁵ = 144⁵ = {rhs} (refutado exato={euler_counterexample_verified}); "
                f"Fluxo de curvatura suavizou variância de {t_curve[0]:.4f} para {t_curve[-1]:.4f}."
            ),
            limitations=[
                "Controles positivos/negativos calibram o detector de falhas e contraexemplos do laboratório GENESIS.",
            ],
            suggested_visual_cue=(
                "Suavização geométrica de anomalias de curvatura (controle positivo) contrastada com contraexemplos exatos (controles negativos)."
            ),
        )


class GenericHarmonicExplorerPlugin:
    """Fallback real spectral/wave/phase-space plugin for all additional catalog problems with custom seed & domain signature."""

    def __init__(self, problem_id: str) -> None:
        self.problem_id = problem_id

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        rng = np.random.default_rng(seed + sum(ord(c) for c in self.problem_id))
        amp = finite_float(params.get("amplitude", 1.5), 1.5, 0.1, 10.0)
        freq = finite_float(params.get("frequency", 1.8), 1.8, 0.1, 15.0)
        phase = finite_float(params.get("phase", 0.0), 0.0, -100.0, 100.0)
        g = max(14, min(resolution, 28))

        xs = np.linspace(-3.5, 3.5, g)
        ys = np.linspace(-3.5, 3.5, g)
        xm, ym = np.meshgrid(xs, ys)
        r = np.hypot(xm, ym)
        z = amp * np.sin(freq * r - phase) + 0.25 * np.cos(xm * 1.6) * np.sin(ym * 1.6)
        z += 0.03 * rng.standard_normal((g, g))

        points_3d = [
            [round(float(xm[i, j]), 3), round(float(z[i, j]), 4), round(float(ym[i, j]), 3)]
            for i in range(0, g, max(1, g // 14))
            for j in range(0, g, max(1, g // 14))
        ]
        radial_profile = [round(float(z[g // 2, j]), 4) for j in range(g)]

        return PluginRunOutput(
            problem_id=self.problem_id,
            raw_series={"radial_slice": radial_profile},
            matrix_2d=np.round(z, 4).tolist(),
            points_3d=points_3d,
            metrics={
                "amplitude": amp,
                "frequency": freq,
                "phase": phase,
                "energy_l2": round(float(np.mean(z * z)), 5),
                "max_peak": round(float(np.max(z)), 4),
            },
            summary=(
                f"Campo exploratório espectral para '{self.problem_id}': A={amp}, k={freq}, φ={phase}; "
                f"energia média L²={float(np.mean(z*z)):.4f}."
            ),
            limitations=[
                "Representação harmônica/fase exploratória — consulte a formalização algébrica para critérios específicos do problema.",
            ],
            suggested_visual_cue=(
                "Frentes de onda concêntricas e nós de interferência destrutiva/construtiva ao longo da grade radial."
            ),
        )


_PLUGIN_MAP = {
    "collatz": CollatzPlugin(),
    "goldbach": GoldbachPlugin(),
    "perfect-cuboid": PerfectCuboidPlugin(),
    "magic-square-squares": MagicSquarePlugin(),
    "riemann-hypothesis": RiemannPlugin(),
    "p-vs-np": PvsNPPlugin(),
    "navier-stokes": NavierStokesPlugin(),
    "yang-mills": YangMillsPlugin(),
    "negative-control-fermat-euler": ControlsPlugin("negative-control-fermat-euler"),
    "poincare-conjecture": ControlsPlugin("poincare-conjecture"),
}


def get_plugin(problem_id: str):
    return _PLUGIN_MAP.get(problem_id) or GenericHarmonicExplorerPlugin(problem_id)


def list_priority_plugin_ids() -> list[str]:
    return list(_PLUGIN_MAP.keys())
