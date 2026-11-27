"""AGENT 06 — Pattern Recognition: FFT spectrum, symmetry, autocorrelation, Lyapunov & raw-vs-visual verification."""

from __future__ import annotations

import math
from typing import Any

import numpy as np

from genesis.models import VisualProjectionReport
from genesis.plugins.base import PluginRunOutput


class PatternRecognitionAgent:
    """AGENT 06: Analyzes both raw mathematical series AND visual matrices to avoid discretization artifacts."""

    agent_id = "agent_06"

    def analyze(self, plugin_out: PluginRunOutput, visual_report: VisualProjectionReport) -> dict[str, Any]:
        mat = np.array(plugin_out.matrix_2d, dtype=float) if plugin_out.matrix_2d else np.zeros((4, 4), dtype=float)
        if mat.ndim != 2 or mat.size == 0:
            mat = np.zeros((4, 4), dtype=float)
        mat = np.nan_to_num(mat, nan=0.0, posinf=1e6, neginf=-1e6)
        first_key = next(iter(plugin_out.raw_series.keys()), "series")
        series = np.array(plugin_out.raw_series.get(first_key, [0.0, 1.0]), dtype=float)
        series = np.nan_to_num(series, nan=0.0, posinf=1e6, neginf=-1e6)
        if series.size < 4:
            series = np.pad(series, (0, 4 - series.size), mode="edge")

        # 1. Real FFT Spectral Analysis on raw series
        centered = series - np.mean(series)
        fft_mag = np.abs(np.fft.rfft(centered))
        freqs = np.fft.rfftfreq(len(centered), d=1.0)
        if fft_mag.size > 1:
            dom_idx = int(np.argmax(fft_mag[1:]) + 1)
            dominant_freq = float(freqs[dom_idx])
            spectral_flatness = float(np.exp(np.mean(np.log(fft_mag[1:] + 1e-9))) / (np.mean(fft_mag[1:]) + 1e-9))
        else:
            dominant_freq = 0.0
            spectral_flatness = 1.0

        # 2. Reflection & rotational symmetry of the 2D matrix
        denom = float(np.mean(np.abs(mat)) + 1e-8)
        sym_h = max(0.0, 1.0 - float(np.mean(np.abs(mat - np.fliplr(mat)))) / (2.0 * denom))
        sym_v = max(0.0, 1.0 - float(np.mean(np.abs(mat - np.flipud(mat)))) / (2.0 * denom))
        symmetry_index = round(0.5 * (sym_h + sym_v), 4)

        # 3. Finite-difference Lyapunov / divergence indicator on raw series
        diffs = np.abs(np.diff(series))
        lyapunov_proxy = round(float(np.mean(np.log(diffs + 1e-6)) - math.log(float(np.std(series)) + 1e-6)), 4)

        # 4. Raw vs Visual Artifact Check: compare variance of raw series against visual projection coordinates
        raw_std = float(np.std(series))
        vis_y = np.array([p[1] for p in visual_report.grid_3d_points], dtype=float) if visual_report.grid_3d_points else np.zeros(1)
        vis_std = float(np.std(np.nan_to_num(vis_y, nan=0.0, posinf=0.0, neginf=0.0)))
        artifact_warning = bool((raw_std > 1e-6 and vis_std < 1e-6) or (not np.all(np.isfinite(vis_y))))

        regimes: list[str] = []
        if symmetry_index > 0.72:
            regimes.append("Alta simetria espacial detectada")
        if spectral_flatness < 0.45:
            regimes.append(f"Periodicidade espectral forte (f={dominant_freq:.3f})")
        if lyapunov_proxy > -1.0:
            regimes.append("Dinâmica sensível / divergência local elevada")
        if not regimes:
            regimes.append("Comportamento aperiódico / multiescala sem dominância linear")

        return {
            "analyzed_series": first_key,
            "sample_count": int(series.size),
            "dominant_frequency": round(dominant_freq, 4),
            "spectral_flatness": round(spectral_flatness, 4),
            "symmetry_index": symmetry_index,
            "lyapunov_proxy": lyapunov_proxy,
            "raw_std": round(raw_std, 5),
            "visual_y_std": round(vis_std, 5),
            "discretization_artifact_detected": artifact_warning,
            "detected_regimes": regimes,
            "visual_cue": plugin_out.suggested_visual_cue,
        }
