"""Base plugin protocol and provenance metadata helpers."""

from __future__ import annotations

import math
import subprocess
from dataclasses import dataclass
from typing import Any, Protocol

import mpmath
import networkx
import numpy
import pydantic
import reportlab
import sympy

from genesis.config import REPO_ROOT


def get_git_commit() -> str:
    """Return current HEAD commit short hash or 'uncommitted-workspace'."""
    try:
        out = subprocess.check_output(
            ["git", "rev-parse", "--short", "HEAD"],
            cwd=REPO_ROOT,
            stderr=subprocess.DEVNULL,
            text=True,
        ).strip()
        return out or "initial"
    except Exception:
        return "workspace-init"


def get_dependency_versions() -> dict[str, str]:
    """Snapshot installed core scientific library versions for reproducibility."""
    return {
        "numpy": getattr(numpy, "__version__", "unknown"),
        "sympy": getattr(sympy, "__version__", "unknown"),
        "mpmath": getattr(mpmath, "__version__", "unknown"),
        "networkx": getattr(networkx, "__version__", "unknown"),
        "pydantic": getattr(pydantic, "__version__", "unknown"),
        "reportlab": getattr(reportlab, "__version__", "unknown"),
    }


def finite_float(val: Any, default: float, lo: float, hi: float) -> float:
    """Coerce parameter to a finite float clamped within [lo, hi]."""
    try:
        v = float(val)
    except (TypeError, ValueError, OverflowError):
        return default
    if not math.isfinite(v):
        return default
    return max(lo, min(hi, v))


def finite_int(val: Any, default: int, lo: int, hi: int) -> int:
    """Coerce parameter to a bounded integer clamped within [lo, hi]."""
    try:
        v = float(val)
    except (TypeError, ValueError, OverflowError):
        return default
    if not math.isfinite(v):
        return default
    return max(lo, min(hi, int(v)))


@dataclass
class PluginRunOutput:
    problem_id: str
    raw_series: dict[str, list[float]]
    matrix_2d: list[list[float]]
    points_3d: list[list[float]]
    metrics: dict[str, Any]
    summary: str
    limitations: list[str]
    suggested_visual_cue: str


class ExperimentPlugin(Protocol):
    problem_id: str

    def run(self, seed: int, params: dict[str, Any], resolution: int = 32) -> PluginRunOutput:
        ...
