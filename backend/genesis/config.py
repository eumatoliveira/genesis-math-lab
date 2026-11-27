"""Configuration, path layout, and home-PC hardware governance limits for GENESIS."""

from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

# Resolve repository root reliably whether executed from repo root or backend/
BACKEND_DIR = Path(__file__).resolve().parent.parent
REPO_ROOT = BACKEND_DIR.parent
RESEARCH_DIR = REPO_ROOT / "research"

RESEARCH_SUBDIRS = [
    "problems",
    "experiments",
    "hypotheses",
    "counterexamples",
    "proofs",
    "datasets",
    "visualizations",
    "benchmarks",
    "references",
    "references/books",
    "reports",
    "rejected-approaches",
    "checkpoints",
]


def ensure_research_tree(base_dir: Path | None = None) -> Path:
    """Create the standardized Section-16 research/ directory tree if missing."""
    target = base_dir or RESEARCH_DIR
    target.mkdir(parents=True, exist_ok=True)
    for sub in RESEARCH_SUBDIRS:
        (target / sub).mkdir(parents=True, exist_ok=True)
    return target


@dataclass
class HardwareLimits:
    """Configurable home-PC resource ceiling (defaults tuned for 32GB RAM / 6c-12t / RTX 3050)."""

    max_lab_ram_gb: float = 14.0          # Section 13: 12 to 16 GB cap on 32 GB host
    max_cpu_percent: float = 70.0         # Section 13: 50% to 70% CPU cap
    min_free_disk_gb: float = 4.0         # Safety floor so C: never fills up
    max_experiment_storage_mb: float = 512.0
    target_fps_min: int = 30
    target_fps_max: int = 60
    default_mode: str = "balanced"        # manual | interactive | eco | balanced | high_performance | continuous


MODE_BUDGETS: dict[str, dict[str, int | float]] = {
    "manual": {"batch_size": 128, "coarse_grid": 18, "refined_grid": 36, "max_ms": 250},
    "interactive": {"batch_size": 256, "coarse_grid": 18, "refined_grid": 44, "max_ms": 180},
    "eco": {"batch_size": 192, "coarse_grid": 18, "refined_grid": 32, "max_ms": 120},
    "balanced": {"batch_size": 512, "coarse_grid": 18, "refined_grid": 54, "max_ms": 350},
    "high_performance": {"batch_size": 1024, "coarse_grid": 24, "refined_grid": 72, "max_ms": 600},
    "continuous": {"batch_size": 384, "coarse_grid": 18, "refined_grid": 48, "max_ms": 280},
}
