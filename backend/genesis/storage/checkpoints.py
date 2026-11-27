"""Checkpoint manager enabling safe pause/resume across continuous research cycles."""

from __future__ import annotations

import json
import re
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from genesis.config import RESEARCH_DIR, ensure_research_tree


class CheckpointStore:
    """Stores resumable scheduler & problem-sweep state as atomic JSON checkpoints."""

    def __init__(self, research_dir: Path | None = None) -> None:
        self.research_dir = ensure_research_tree(research_dir or RESEARCH_DIR)
        self.checkpoint_dir = self.research_dir / "checkpoints"
        self.checkpoint_dir.mkdir(parents=True, exist_ok=True)
        self.scheduler_path = self.checkpoint_dir / "scheduler_state.json"

    def save_scheduler_state(self, state: dict[str, Any]) -> Path:
        payload = {
            **state,
            "saved_at": datetime.now(timezone.utc).isoformat(),
        }
        tmp = self.scheduler_path.with_suffix(".tmp")
        tmp.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
        tmp.replace(self.scheduler_path)
        return self.scheduler_path

    def load_scheduler_state(self) -> dict[str, Any] | None:
        if not self.scheduler_path.exists():
            return None
        try:
            return json.loads(self.scheduler_path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None

    def save_problem_checkpoint(self, problem_id: str, state: dict[str, Any]) -> Path:
        safe_id = re.sub(r"[^a-zA-Z0-9_-]", "_", problem_id) or "problem"
        path = self.checkpoint_dir / f"{safe_id}.json"
        payload = {
            "problem_id": problem_id,
            **state,
            "saved_at": datetime.now(timezone.utc).isoformat(),
        }
        path.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
        return path

    def load_problem_checkpoint(self, problem_id: str) -> dict[str, Any] | None:
        safe_id = re.sub(r"[^a-zA-Z0-9_-]", "_", problem_id) or "problem"
        path = self.checkpoint_dir / f"{safe_id}.json"
        if not path.exists():
            return None
        try:
            return json.loads(path.read_text(encoding="utf-8"))
        except (OSError, json.JSONDecodeError):
            return None
