"""AGENT 03 — Visual Discovery: transforms raw math into multidimensional visual representations + anomaly cues."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from genesis.models import VisualProjectionReport
from genesis.plugins.base import PluginRunOutput


class VisualDiscoveryAgent:
    """AGENT 03: Builds visual projections, preserves/discards property audit, and detects visual anomaly hotspots."""

    agent_id = "agent_03"

    def analyze_and_project(
        self,
        plugin_out: PluginRunOutput,
        projection: str = "cartesian_3d",
    ) -> VisualProjectionReport:
        pts = np.array(plugin_out.points_3d, dtype=float) if plugin_out.points_3d else np.zeros((1, 3))
        pts = np.nan_to_num(pts, nan=0.0, posinf=28.0, neginf=-28.0)
        mat = np.array(plugin_out.matrix_2d, dtype=float) if plugin_out.matrix_2d else np.zeros((12, 12))
        mat = np.nan_to_num(mat, nan=0.0, posinf=1e6, neginf=-1e6)

        transformed: list[list[float]] = []
        if projection == "stereographic_4d":
            preserved = ["Ângulos conformes locais", "Conectividade topológica fora do polo de projeção"]
            discarded = ["Distâncias métricas euclidianas globais", "Volume absoluto em alta dimensão"]
            mapping_formula = "(x, y, z, w) -> (x/(2-w), y/(2-w), z/(2-w)) com w = tanh(||p||/4)"
            for p in pts:
                x, y, z = float(p[0]), float(p[1]), float(p[2])
                w = math.tanh(math.sqrt(x * x + y * y + z * z) / 4.0)
                denom = max(2.0 - w, 0.25)
                transformed.append([round(x / denom, 4), round(y / denom, 4), round(z / denom, 4)])
        elif projection == "polar_spherical":
            preserved = ["Relações radiais de fase e periodicidade angular", "Simetria rotacional"]
            discarded = ["Escala linear cartesiana em X e Z"]
            mapping_formula = "(x, y, z) -> (r*cos(θ), y, r*sin(θ)) com θ = atan2(z, x)"
            for p in pts:
                r = math.hypot(float(p[0]), float(p[2]))
                theta = math.atan2(float(p[2]), float(p[0]))
                transformed.append([round(r * math.cos(theta), 4), round(float(p[1]), 4), round(r * math.sin(theta), 4)])
        else:
            preserved = ["Coordenadas locais da malha experimental", "Gradientes verticais de amplitude/erro"]
            discarded = ["Dimensões paramétricas além de 3 graus de liberdade simultâneos"]
            mapping_formula = "Projeção ortogonal direta (x, valor_observado, z)"
            transformed = [[round(float(p[0]), 4), round(float(p[1]), 4), round(float(p[2]), 4)] for p in pts]

        # Visual anomaly hotspot extraction from 2D matrix (high gradient or extremal valleys)
        mean_val = float(np.mean(mat))
        std_val = float(np.std(mat)) + 1e-8
        z_scores = np.abs((mat - mean_val) / std_val)
        flat_indices = np.argsort(z_scores.ravel())[::-1][:5]
        rows, cols = mat.shape
        hotspots: list[dict[str, Any]] = []
        for idx in flat_indices:
            r_i, c_i = divmod(int(idx), cols)
            hotspots.append(
                {
                    "grid_i": r_i,
                    "grid_j": c_i,
                    "norm_x": round((c_i / max(cols - 1, 1)) * 2 - 1, 3),
                    "norm_z": round((r_i / max(rows - 1, 1)) * 2 - 1, 3),
                    "value": round(float(mat[r_i, c_i]), 4),
                    "z_score": round(float(z_scores[r_i, c_i]), 3),
                }
            )

        # Build 2D primary curve from first available series
        first_series_name = next(iter(plugin_out.raw_series.keys()), "series")
        first_series = plugin_out.raw_series.get(first_series_name, [])[:128]
        curve_2d = [
            [i, round(float(val), 5) if math.isfinite(float(val)) else 0.0]
            for i, val in enumerate(first_series)
        ]

        return VisualProjectionReport(
            projection_name=projection,
            source_dimensions="Espaço experimental multidimensional",
            target_dimensions="3D WebGL + Osciloscópio 2D",
            mapping_formula=mapping_formula,
            preserved_properties=preserved,
            discarded_properties=discarded,
            anomaly_hotspots=hotspots,
            grid_3d_points=transformed[:256],
            curve_2d_points=curve_2d,
        )
