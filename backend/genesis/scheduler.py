"""Autonomous persistent experiment scheduler with hardware backpressure & checkpoint recovery."""

from __future__ import annotations

import threading
import time
from typing import Any

from genesis.agents.orchestrator import GenesisMasterOrchestrator
from genesis.config import MODE_BUDGETS
from genesis.models import DiscoveryCycleRequest


PRIORITY_QUEUE = [
    "collatz",
    "goldbach",
    "perfect-cuboid",
    "riemann-hypothesis",
    "navier-stokes",
    "p-vs-np",
    "yang-mills",
    "magic-square-squares",
    "negative-control-fermat-euler",
]


class AutonomousLabScheduler:
    """Runs bounded autonomous discovery cycles in a background thread with safe pause/resume."""

    def __init__(self, orchestrator: GenesisMasterOrchestrator) -> None:
        self.orchestrator = orchestrator
        self._lock = threading.RLock()
        self._running = False
        self._thread: threading.Thread | None = None
        saved = self.orchestrator.checkpoints.load_scheduler_state() or {}
        self.mode: str = saved.get("mode", "balanced")
        self.cycles_completed: int = int(saved.get("cycles_completed", 0))
        self.max_cycles_per_session: int = int(saved.get("max_cycles_per_session", 25))
        self.cursor: int = int(saved.get("cursor", 0))
        self.last_cycle_id: str | None = saved.get("last_cycle_id")
        self.last_problem_id: str | None = saved.get("last_problem_id")
        self.current_strategy: str = saved.get("current_strategy", "adaptive")

    def status(self) -> dict[str, Any]:
        with self._lock:
            return {
                "running": self._running,
                "mode": self.mode,
                "cycles_completed": self.cycles_completed,
                "max_cycles_per_session": self.max_cycles_per_session,
                "next_problem_id": PRIORITY_QUEUE[self.cursor % len(PRIORITY_QUEUE)],
                "last_cycle_id": self.last_cycle_id,
                "last_problem_id": self.last_problem_id,
                "current_strategy": self.current_strategy,
            }

    def start(self, mode: str = "balanced", max_cycles: int = 12) -> dict[str, Any]:
        with self._lock:
            if self._running:
                return self.status()
            self.mode = mode if mode in MODE_BUDGETS else "balanced"
            self.max_cycles_per_session = max(1, min(int(max_cycles), 100))
            self._running = True
            self._thread = threading.Thread(target=self._loop, daemon=True, name="genesis-scheduler")
            self._thread.start()
            return self.status()

    def pause(self) -> dict[str, Any]:
        with self._lock:
            self._running = False
            self.orchestrator.checkpoints.save_scheduler_state(
                {
                    "mode": self.mode,
                    "cycles_completed": self.cycles_completed,
                    "max_cycles_per_session": self.max_cycles_per_session,
                    "cursor": self.cursor,
                    "last_cycle_id": self.last_cycle_id,
                    "last_problem_id": self.last_problem_id,
                    "current_strategy": self.current_strategy,
                }
            )
            return self.status()

    def _loop(self) -> None:
        session_count = 0
        try:
            while True:
                with self._lock:
                    if not self._running or session_count >= self.max_cycles_per_session:
                        self._running = False
                        break
                    prob_id = PRIORITY_QUEUE[self.cursor % len(PRIORITY_QUEUE)]
                    seed = 42 + self.cycles_completed
                    strategy = self.orchestrator.select_next_strategy(prob_id, self.current_strategy)
                    mode = self.mode

                hw = self.orchestrator.hardware.snapshot(storage_path=self.orchestrator.kb.research_dir)
                if not hw.within_safe_limits:
                    self.pause()
                    break
                if hw.cpu_percent > self.orchestrator.hardware.limits.max_cpu_percent:
                    mode = "eco"
                    time.sleep(0.5)

                res = self.orchestrator.run_discovery_cycle(
                    DiscoveryCycleRequest(
                        problem_id=prob_id,
                        mode=mode,
                        seed=seed,
                        strategy=strategy,
                        export_reports=True,
                    )
                )
                with self._lock:
                    self.cycles_completed += 1
                    session_count += 1
                    self.cursor += 1
                    self.last_cycle_id = res.cycle_id
                    self.last_problem_id = prob_id
                    self.current_strategy = strategy
                    self.orchestrator.checkpoints.save_scheduler_state(
                        {
                            "mode": self.mode,
                            "cycles_completed": self.cycles_completed,
                            "max_cycles_per_session": self.max_cycles_per_session,
                            "cursor": self.cursor,
                            "last_cycle_id": self.last_cycle_id,
                            "last_problem_id": self.last_problem_id,
                            "current_strategy": self.current_strategy,
                        }
                    )
                time.sleep(0.6)
        except Exception:
            self.pause()
        finally:
            with self._lock:
                self._running = False
