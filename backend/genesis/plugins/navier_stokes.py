"""Navier-Stokes & Yang-Mills Experimental Plugins (computational PDE & lattice gauge exploration)."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from genesis.plugins.base import PluginRunOutput, finite_float, finite_int


class NavierStokesPlugin:
    problem_id = "navier-stokes"

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        n = int(min(max(resolution, 18), 40))
        viscosity = finite_float(params.get("viscosity", 0.0025), 0.0025, 1e-5, 0.5)
        steps = finite_int(params.get("steps", 35), 35, 10, 80)
        dt = finite_float(params.get("dt", 0.04), 0.04, 0.001, 0.2)

        y, x = np.meshgrid(np.linspace(0, 2 * math.pi, n, endpoint=False), np.linspace(0, 2 * math.pi, n, endpoint=False))
        # Taylor-Green vortex initial velocity field
        u = np.sin(x) * np.cos(y)
        v = -np.cos(x) * np.sin(y)
        # Deterministic small perturbation
        rng = np.random.default_rng(seed)
        u += 0.12 * rng.standard_normal((n, n))
        v += 0.12 * rng.standard_normal((n, n))

        energies: list[float] = []
        enstrophies: list[float] = []
        peak_vorticity = 0.0
        dx = (2 * math.pi) / n

        def laplacian(f: np.ndarray) -> np.ndarray:
            return (np.roll(f, 1, 0) + np.roll(f, -1, 0) + np.roll(f, 1, 1) + np.roll(f, -1, 1) - 4.0 * f) / (dx * dx)

        for _ in range(steps):
            du_dx = (np.roll(u, -1, 1) - np.roll(u, 1, 1)) / (2 * dx)
            du_dy = (np.roll(u, -1, 0) - np.roll(u, 1, 0)) / (2 * dx)
            dv_dx = (np.roll(v, -1, 1) - np.roll(v, 1, 1)) / (2 * dx)
            dv_dy = (np.roll(v, -1, 0) - np.roll(v, 1, 0)) / (2 * dx)

            u_next = u + dt * (-(u * du_dx + v * du_dy) + viscosity * laplacian(u))
            v_next = v + dt * (-(u * dv_dx + v * dv_dy) + viscosity * laplacian(v))
            if not (np.all(np.isfinite(u_next)) and np.all(np.isfinite(v_next))) or float(np.max(np.abs(u_next))) > 1e4 or float(np.max(np.abs(v_next))) > 1e4:
                u = np.clip(np.nan_to_num(u_next, nan=0.0, posinf=1e3, neginf=-1e3), -1e3, 1e3)
                v = np.clip(np.nan_to_num(v_next, nan=0.0, posinf=1e3, neginf=-1e3), -1e3, 1e3)
                energies.append(1e3)
                enstrophies.append(1e3)
                peak_vorticity = max(peak_vorticity, 1e3)
                break

            # Simple iterative Poisson pressure projection (Gauss-Seidel) for divergence-free constraint
            div = (np.roll(u_next, -1, 1) - np.roll(u_next, 1, 1) + np.roll(v_next, -1, 0) - np.roll(v_next, 1, 0)) / (2 * dx)
            p = np.zeros_like(u_next)
            for _it in range(12):
                p = 0.25 * (np.roll(p, 1, 0) + np.roll(p, -1, 0) + np.roll(p, 1, 1) + np.roll(p, -1, 1) - div * dx * dx)

            u = u_next - (np.roll(p, -1, 1) - np.roll(p, 1, 1)) / (2 * dx)
            v = v_next - (np.roll(p, -1, 0) - np.roll(p, 1, 0)) / (2 * dx)

            vort = (np.roll(v, -1, 1) - np.roll(v, 1, 1) - np.roll(u, -1, 0) + np.roll(u, 1, 0)) / (2 * dx)
            ke = 0.5 * float(np.mean(u * u + v * v))
            ens = 0.5 * float(np.mean(vort * vort))
            energies.append(round(ke, 6))
            enstrophies.append(round(ens, 6))
            peak_vorticity = max(peak_vorticity, float(np.max(np.abs(vort))))

        vort_final = (np.roll(v, -1, 1) - np.roll(v, 1, 1) - np.roll(u, -1, 0) + np.roll(u, 1, 0)) / (2 * dx)
        max_vel = float(np.max(np.hypot(u, v)))
        cfl_raw = max_vel * dt / dx if math.isfinite(max_vel) else 999.0
        cfl = cfl_raw if math.isfinite(cfl_raw) else 999.0
        numerical_blowup = not bool(np.all(np.isfinite(vort_final))) or cfl > 1.0
        vort_clean = np.nan_to_num(vort_final, nan=0.0, posinf=1e3, neginf=-1e3)
        energies_clean = [e if math.isfinite(e) else 1e3 for e in energies]
        enstrophies_clean = [e if math.isfinite(e) else 1e3 for e in enstrophies]
        peak_vort_clean = peak_vorticity if math.isfinite(peak_vorticity) else 1e3

        points_3d: list[list[float]] = []
        stride = max(1, n // 12)
        for i in range(0, n, stride):
            for j in range(0, n, stride):
                points_3d.append([round((i / n) * 8 - 4, 3), round(float(vort_clean[i, j]), 4), round((j / n) * 8 - 4, 3)])

        return PluginRunOutput(
            problem_id=self.problem_id,
            raw_series={
                "kinetic_energy": energies_clean,
                "enstrophy": enstrophies_clean,
            },
            matrix_2d=np.round(vort_clean, 4).tolist(),
            points_3d=points_3d,
            metrics={
                "grid_size": f"{n}x{n}",
                "viscosity": viscosity,
                "steps": steps,
                "final_kinetic_energy": energies_clean[-1],
                "peak_vorticity": round(peak_vort_clean, 4),
                "cfl_number": round(cfl, 4) if math.isfinite(cfl) else 999.0,
                "numerical_stability_ok": not numerical_blowup,
                "classification": "Estável (sem artefato CFL)" if not numerical_blowup else "Alerta numérico CFL > 1 (NÃO é prova de singularidade!)",
            },
            summary=(
                f"Fluido viscoso 2D ({n}×{n}, ν={viscosity}, {steps} passos): energia cinética decaiu de {energies_clean[0]:.4f} para "
                f"{energies_clean[-1]:.4f}; vorticidade máxima={peak_vort_clean:.3f}; CFL={cfl:.3f}."
            ),
            limitations=[
                "Simulação discreta 2D em diferenças finitas não resolve o problema de existência e suavidade em 3D (R³).",
                "Instabilidades numéricas por passo dt elevado (CFL > 1) são artefatos de discretização, não blow-up matemático real.",
            ],
            suggested_visual_cue=(
                "Células de vorticidade contra-rotativas e decaimento exponencial da enstrofia sob difusão viscosa."
            ),
        )


class YangMillsPlugin:
    problem_id = "yang-mills"

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        rng = np.random.default_rng(seed)
        l_size = int(min(max(resolution // 2, 10), 20))
        beta = finite_float(params.get("beta", 2.2), 2.2, 0.05, 20.0)
        sweeps = finite_int(params.get("sweeps", 28), 28, 10, 60)

        # 2D compact U(1) lattice gauge phases on links (exploratory discretization!)
        theta_x = rng.uniform(-math.pi, math.pi, size=(l_size, l_size))
        theta_y = rng.uniform(-math.pi, math.pi, size=(l_size, l_size))

        plaquette_history: list[float] = []
        for _ in range(sweeps):
            # Simple vectorized heat-bath / Metropolis relaxation towards low action
            plaq = theta_x + np.roll(theta_y, -1, 1) - np.roll(theta_x, -1, 0) - theta_y
            proposal_x = theta_x + rng.normal(0, 0.35, size=(l_size, l_size))
            plaq_new = proposal_x + np.roll(theta_y, -1, 1) - np.roll(proposal_x, -1, 0) - theta_y
            delta_s = -beta * (np.cos(plaq_new) - np.cos(plaq))
            accept = (delta_s < 0) | (rng.random((l_size, l_size)) < np.exp(-np.clip(delta_s, -10, 10)))
            theta_x = np.where(accept, proposal_x, theta_x)
            plaq = theta_x + np.roll(theta_y, -1, 1) - np.roll(theta_x, -1, 0) - theta_y
            plaquette_history.append(round(float(np.mean(np.cos(plaq))), 5))

        plaq_final = np.cos(theta_x + np.roll(theta_y, -1, 1) - np.roll(theta_x, -1, 0) - theta_y)
        # Estimate Wilson loops W(R, R) for R=1..4 to demonstrate area law decay
        wilson_loops: list[float] = []
        radii = [1, 2, 3, 4]
        for r in radii:
            # Product of plaquette phases over R x R square
            total_phase = np.zeros((l_size, l_size))
            for di in range(r):
                for dj in range(r):
                    total_phase += np.roll(
                        theta_x + np.roll(theta_y, -1, 1) - np.roll(theta_x, -1, 0) - theta_y,
                        shift=(di, dj),
                        axis=(0, 1),
                    )
            wilson_loops.append(round(float(np.mean(np.cos(total_phase))), 5))

        mass_gap_est = -math.log(max(abs(wilson_loops[1]), 1e-4)) / 4.0
        points_3d = [
            [round((i / l_size) * 8 - 4, 3), round(float(plaq_final[i, j]) * 2.0, 4), round((j / l_size) * 8 - 4, 3)]
            for i in range(l_size)
            for j in range(l_size)
        ]

        return PluginRunOutput(
            problem_id=self.problem_id,
            raw_series={
                "mean_plaquette_convergence": plaquette_history,
                "wilson_loop_r1_to_r4": wilson_loops,
            },
            matrix_2d=np.round(plaq_final, 4).tolist(),
            points_3d=points_3d,
            metrics={
                "lattice": f"{l_size}x{l_size} U(1) proxy",
                "coupling_beta": beta,
                "final_mean_plaquette": plaquette_history[-1],
                "wilson_loop_2x2": wilson_loops[1],
                "effective_mass_gap_proxy": round(mass_gap_est, 4),
            },
            summary=(
                f"Rede de calibre {l_size}×{l_size} (β={beta}): plaqueta média={plaquette_history[-1]:.4f}; "
                f"decaimento de área de Wilson W(2,2)={wilson_loops[1]:.4f}; estimador discreto de gap={mass_gap_est:.4f}."
            ),
            limitations=[
                "Modelo de rede discreta U(1) 2D é aproximação exploratória pedagógica/computacional — NÃO equivale à teoria quântica de campos contínua SU(N) em 4D.",
                "O limite do contínuo (espaçamento a -> 0) exige renormalização não-perturbativa rigorosa.",
            ],
            suggested_visual_cue=(
                "Flutuações de curvatura de calibre (plaquetas) formando textura de energia de vácuo e lei de área para loops de Wilson."
            ),
        )
