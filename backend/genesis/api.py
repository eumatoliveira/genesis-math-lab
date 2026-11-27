"""AGENT 16 — Scientific UI/UX Bridge: FastAPI REST + WebSocket backend for GENESIS."""

from __future__ import annotations

import asyncio
import json
import math
import re
from pathlib import Path
from typing import Any

from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from pydantic import BaseModel

from genesis.agents.orchestrator import GenesisMasterOrchestrator
from genesis.config import MODE_BUDGETS
from genesis.models import DiscoveryCycleRequest
from genesis.plugins.collatz import collatz_orbit
from genesis.plugins.controls import get_plugin
from genesis.plugins.perfect_cuboid import check_cuboid_exact
from genesis.scheduler import AutonomousLabScheduler


class ResearchQueryRequest(BaseModel):
    problem_id: str = "collatz"
    query: str = "Collatz conjecture"
    include_arxiv: bool = True
    include_openalex: bool = True
    oeis_id: str | None = None


class SchedulerStartRequest(BaseModel):
    mode: str = "balanced"
    max_cycles: int = 12


_SAFE_ID_RE = re.compile(r"^[a-zA-Z0-9_-]{1,80}$")
_SAFE_OEIS_RE = re.compile(r"^[a-zA-Z0-9_-]{1,24}$")
_SAFE_FILENAME_RE = re.compile(r"^[a-zA-Z0-9._-]{1,120}$")
_ALLOWED_PROJECTIONS = {"cartesian_3d", "polar_spherical", "phase_space", "stereographic_4d"}
_ALLOWED_STRATEGIES = {"adaptive", "brute_force", "evolutionary", "quantum_inspired"}


def _validate_problem_id(problem_id: str) -> str:
    if not _SAFE_ID_RE.fullmatch(problem_id):
        raise HTTPException(status_code=400, detail="Invalid problem_id format")
    return problem_id


def _json_safe(value: Any) -> Any:
    """Recursively convert non-finite floats (NaN/Inf) to None for strict RFC 8259 JSON compliance."""
    if isinstance(value, float):
        return value if math.isfinite(value) else None
    if isinstance(value, dict):
        return {k: _json_safe(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [_json_safe(v) for v in value]
    return value


def create_app(research_dir: Path | None = None) -> FastAPI:
    app = FastAPI(
        title="GENESIS — Autonomous Visual Mathematical Discovery Laboratory API",
        version="1.0.0",
    )
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    orchestrator = GenesisMasterOrchestrator(research_dir=research_dir)
    scheduler = AutonomousLabScheduler(orchestrator)
    ws_clients: list[WebSocket] = []

    @app.get("/api/health")
    def health() -> dict[str, Any]:
        return {
            "status": "ok",
            "service": "GENESIS Scientific Backend",
            "research_dir": str(orchestrator.kb.research_dir),
            "counts": orchestrator.kb.count_summary(),
        }

    @app.get("/api/agents")
    def get_agents() -> dict[str, Any]:
        return {
            "agents": [a.model_dump() for a in orchestrator.registry.snapshot()],
            "recent_events": [e.model_dump() for e in orchestrator.recent_events[-40:]],
        }

    @app.get("/api/hardware")
    def get_hardware() -> dict[str, Any]:
        return orchestrator.hardware.snapshot(storage_path=orchestrator.kb.research_dir).model_dump()

    @app.get("/api/knowledge/summary")
    def get_knowledge_summary() -> dict[str, Any]:
        return {
            "counts": orchestrator.kb.count_summary(),
            "scheduler": scheduler.status(),
        }

    @app.get("/api/knowledge/graph")
    def get_knowledge_graph(problem_id: str | None = None, limit: int = 160) -> dict[str, Any]:
        safe_id = _validate_problem_id(problem_id) if problem_id is not None else None
        return orchestrator.kb.build_knowledge_graph(problem_id=safe_id, limit=max(1, min(limit, 500)))

    @app.get("/api/experiments")
    def list_experiments(problem_id: str | None = None, limit: int = 40) -> dict[str, Any]:
        safe_id = _validate_problem_id(problem_id) if problem_id is not None else None
        return {"items": orchestrator.kb.list_experiments(problem_id=safe_id, limit=max(1, min(limit, 500)))}

    @app.get("/api/hypotheses")
    def list_hypotheses(problem_id: str | None = None, limit: int = 60) -> dict[str, Any]:
        safe_id = _validate_problem_id(problem_id) if problem_id is not None else None
        return {"items": _json_safe(orchestrator.kb.list_hypotheses(problem_id=safe_id, limit=max(1, min(limit, 500))))}

    @app.get("/api/counterexamples")
    def list_counterexamples(problem_id: str | None = None, limit: int = 40) -> dict[str, Any]:
        safe_id = _validate_problem_id(problem_id) if problem_id is not None else None
        return {"items": _json_safe(orchestrator.kb.list_counterexamples(problem_id=safe_id, limit=max(1, min(limit, 500))))}

    @app.get("/api/rejections")
    def list_rejections(problem_id: str | None = None, limit: int = 40) -> dict[str, Any]:
        safe_id = _validate_problem_id(problem_id) if problem_id is not None else None
        return {"items": orchestrator.kb.list_rejections(problem_id=safe_id, limit=max(1, min(limit, 500)))}

    @app.get("/api/books")
    def list_books() -> dict[str, Any]:
        return {"items": orchestrator.kb.list_books()}

    @app.get("/api/books/{book_id}")
    def read_book_preview(book_id: str, max_chars: int = 6000) -> dict[str, Any]:
        safe_chars = max(100, min(max_chars, 50000))
        books = [b for b in orchestrator.kb.list_books() if b["book_id"] == book_id]
        if not books:
            raise HTTPException(status_code=404, detail="Book not found")
        book = books[0]
        p = Path(book["local_path"])
        if p.exists() and p.suffix.lower() != ".pdf":
            text = p.read_text(encoding="utf-8", errors="replace")[:safe_chars]
        else:
            text = book.get("excerpt", "")[:safe_chars]
        return {**book, "preview": text}

    @app.get("/api/references")
    def list_references(problem_id: str | None = None, limit: int = 80) -> dict[str, Any]:
        safe_id = _validate_problem_id(problem_id) if problem_id is not None else None
        safe_limit = max(1, min(limit, 500))
        return {
            "items": orchestrator.kb.list_references(problem_id=safe_id, limit=safe_limit),
            "multilingual": orchestrator.research.get_multilingual_terms(safe_id or "collatz"),
        }

    @app.post("/api/research/query")
    async def query_public_research(req: ResearchQueryRequest) -> dict[str, Any]:
        safe_id = _validate_problem_id(req.problem_id)
        if req.oeis_id and not _SAFE_OEIS_RE.fullmatch(req.oeis_id):
            raise HTTPException(status_code=400, detail="Invalid oeis_id format")

        def _run_queries() -> list[dict[str, Any]]:
            added: list[dict[str, Any]] = []
            if req.include_arxiv:
                added.extend(orchestrator.research.search_arxiv(req.query, safe_id))
            if req.include_openalex:
                added.extend(orchestrator.research.search_openalex(req.query, safe_id))
            if req.oeis_id:
                oeis_item = orchestrator.research.fetch_oeis_sequence(req.oeis_id, safe_id)
                if oeis_item:
                    added.append(oeis_item)
            return added

        added = await asyncio.to_thread(_run_queries)
        return {"added_count": len(added), "items": added}

    @app.post("/api/cycles/run")
    async def run_cycle(req: DiscoveryCycleRequest, projection: str = "cartesian_3d") -> JSONResponse:
        _validate_problem_id(req.problem_id)
        if req.mode not in MODE_BUDGETS:
            raise HTTPException(status_code=400, detail="Invalid execution mode")
        if req.strategy not in _ALLOWED_STRATEGIES:
            raise HTTPException(status_code=400, detail="Invalid strategy")
        if projection not in _ALLOWED_PROJECTIONS:
            raise HTTPException(status_code=400, detail="Invalid projection")
        result = await asyncio.to_thread(orchestrator.run_discovery_cycle, req, projection=projection)
        payload = _json_safe(result.model_dump())
        dead: list[WebSocket] = []
        for ws in list(ws_clients):
            try:
                await ws.send_text(json.dumps({"type": "cycle_completed", "cycle_id": result.cycle_id, "problem_id": result.problem_id}, allow_nan=False))
            except Exception:
                dead.append(ws)
        for ws in dead:
            if ws in ws_clients:
                ws_clients.remove(ws)
        return JSONResponse(content=payload)

    @app.get("/api/probe/collatz/{start_n}")
    def probe_collatz(start_n: int) -> dict[str, Any]:
        if start_n < 1 or start_n > 10**12:
            raise HTTPException(status_code=400, detail="start_n out of bounds [1, 1e12]")
        return collatz_orbit(start_n)

    @app.get("/api/probe/cuboid")
    def probe_cuboid(a: int = 44, b: int = 117, c: int = 240) -> dict[str, Any]:
        if max(abs(a), abs(b), abs(c)) > 10**100:
            raise HTTPException(status_code=400, detail="Edge length out of bounds (|x| <= 1e100)")
        return check_cuboid_exact(a, b, c)

    @app.get("/api/probe/plugin/{problem_id}")
    def probe_plugin(problem_id: str, seed: int = 42, resolution: int = 24) -> dict[str, Any]:
        safe_id = _validate_problem_id(problem_id)
        safe_res = max(8, min(resolution, 64))
        out = get_plugin(safe_id).run(seed=seed, params={}, resolution=safe_res)
        return {
            "problem_id": out.problem_id,
            "metrics": out.metrics,
            "summary": out.summary,
            "suggested_visual_cue": out.suggested_visual_cue,
            "limitations": out.limitations,
            "points_3d": out.points_3d[:256],
            "raw_series": out.raw_series,
        }

    @app.post("/api/scheduler/start")
    def scheduler_start(req: SchedulerStartRequest) -> dict[str, Any]:
        return scheduler.start(mode=req.mode, max_cycles=req.max_cycles)

    @app.post("/api/scheduler/pause")
    def scheduler_pause() -> dict[str, Any]:
        return scheduler.pause()

    @app.get("/api/scheduler/status")
    def scheduler_status() -> dict[str, Any]:
        return scheduler.status()

    @app.get("/api/reports/{problem_id}/files")
    def list_problem_reports(problem_id: str) -> dict[str, Any]:
        safe_id = _validate_problem_id(problem_id)
        pdir = orchestrator.kb.research_dir / "problems" / safe_id
        if not pdir.exists():
            return {"problem_id": safe_id, "files": []}
        files = [
            {"name": f.name, "size_bytes": f.stat().st_size}
            for f in sorted(pdir.iterdir())
            if f.is_file()
        ]
        return {"problem_id": safe_id, "files": files}

    @app.get("/api/reports/{problem_id}/download/{filename}")
    def download_problem_report(problem_id: str, filename: str):
        safe_id = _validate_problem_id(problem_id)
        safe_name = Path(filename).name
        if not _SAFE_FILENAME_RE.fullmatch(safe_name) or safe_name in {".", ".."}:
            raise HTTPException(status_code=400, detail="Invalid filename")
        pdir = (orchestrator.kb.research_dir / "problems" / safe_id).resolve()
        target = (pdir / safe_name).resolve()
        if not target.is_relative_to(pdir) or not target.exists() or not target.is_file():
            raise HTTPException(status_code=404, detail="Report file not found")
        media = "application/pdf" if target.suffix.lower() == ".pdf" else "text/markdown; charset=utf-8"
        return FileResponse(path=target, media_type=media, filename=f"{safe_id}-{safe_name}")

    @app.websocket("/ws/lab")
    async def lab_ws(websocket: WebSocket) -> None:
        await websocket.accept()
        ws_clients.append(websocket)
        try:
            while True:
                hw_snap = await asyncio.to_thread(
                    orchestrator.hardware.snapshot,
                    orchestrator.kb.research_dir,
                )
                snap = _json_safe({
                    "type": "heartbeat",
                    "hardware": hw_snap.model_dump(),
                    "scheduler": scheduler.status(),
                    "counts": orchestrator.kb.count_summary(),
                })
                await websocket.send_text(json.dumps(snap, allow_nan=False))
                await asyncio.sleep(2.5)
        except WebSocketDisconnect:
            if websocket in ws_clients:
                ws_clients.remove(websocket)
        except Exception:
            if websocket in ws_clients:
                ws_clients.remove(websocket)

    return app


app = create_app()
