"""AGENT 04 — Computational Physics: explores justified wave/EM/field analogies without overclaiming physics."""

from __future__ import annotations

from typing import Any

import numpy as np

from genesis.models import PhysicsClassification
from genesis.plugins.base import PluginRunOutput


class ComputationalPhysicsAgent:
    """AGENT 04: Maps abstract structures to electromagnetic/wave/oscillation analogies (like Wi-Fi) responsibly."""

    agent_id = "agent_04"

    def evaluate_field(self, plugin_out: PluginRunOutput, classification: PhysicsClassification) -> dict[str, Any]:
        mat = np.array(plugin_out.matrix_2d, dtype=float) if plugin_out.matrix_2d else np.zeros((8, 8))
        if mat.ndim != 2 or mat.shape[0] < 2 or mat.shape[1] < 2:
            mat = np.zeros((8, 8), dtype=float)
        mat = np.nan_to_num(mat, nan=0.0, posinf=1e6, neginf=-1e6)
        grad_y, grad_x = np.gradient(mat)
        field_energy = float(np.mean(grad_x * grad_x + grad_y * grad_y))
        spectral_power = float(np.var(mat))

        # Electromagnetic / Wi-Fi resonance analogy: stationary interference nodes represent zeros/invariants
        interference_ratio = round(spectral_power / max(field_energy + spectral_power, 1e-9), 4)

        return {
            "classification": classification.value,
            "wifi_wave_analogy_description": (
                "Frentes de onda eletromagnética (Faraday/Maxwell/Tesla) usadas como metáfora visual para "
                "propagação de restrições, interferência construtiva e regiões de ressonância no espaço de parâmetros."
            ),
            "field_gradient_energy": round(field_energy, 5),
            "spectral_variance": round(spectral_power, 5),
            "coherence_index": interference_ratio,
            "physical_claim_disclaimer": (
                "Classificação estrita aplicada: nenhuma conjectura puramente numérica é tratada como fenômeno físico real sem prova."
            ),
        }
