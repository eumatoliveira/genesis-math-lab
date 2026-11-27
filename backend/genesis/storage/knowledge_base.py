"""AGENT 14 — Knowledge and Memory: SQLite + JSONL + NetworkX Knowledge Graph + SHA-256 provenance."""

from __future__ import annotations

import contextlib
import hashlib
import json
import sqlite3
from collections.abc import Iterator
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

import networkx as nx

from genesis.config import RESEARCH_DIR, ensure_research_tree
from genesis.models import (
    AgentEvent,
    CounterexampleRecord,
    ExperimentRecord,
    HypothesisRecord,
)


def compute_sha256(payload: Any) -> str:
    """Compute canonical deterministic SHA-256 hash for provenance and artifact integrity."""
    encoded = json.dumps(payload, sort_keys=True, ensure_ascii=False, default=str).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


class KnowledgeBase:
    """Persistent shared scientific memory across all 17 GENESIS agents."""

    def __init__(self, research_dir: Path | None = None) -> None:
        self.research_dir = ensure_research_tree(research_dir or RESEARCH_DIR)
        self.db_path = self.research_dir / "genesis_knowledge.db"
        self.events_log = self.research_dir / "experiments" / "events.jsonl"
        self.rejected_dir = self.research_dir / "rejected-approaches"
        self._init_db()

    @contextlib.contextmanager
    def _connect(self) -> Iterator[sqlite3.Connection]:
        conn = sqlite3.connect(self.db_path, timeout=15.0)
        conn.row_factory = sqlite3.Row
        try:
            with conn:
                yield conn
        finally:
            conn.close()

    def _init_db(self) -> None:
        with self._connect() as conn:
            conn.executescript(
                """
                CREATE TABLE IF NOT EXISTS experiments (
                    experiment_id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    hypothesis_id TEXT NOT NULL,
                    agent_id TEXT NOT NULL,
                    strategy TEXT NOT NULL,
                    timestamp TEXT NOT NULL,
                    seed INTEGER NOT NULL,
                    duration_ms REAL NOT NULL,
                    memory_mb REAL NOT NULL,
                    validation_passed INTEGER NOT NULL,
                    sha256_hash TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_exp_problem ON experiments(problem_id);

                CREATE TABLE IF NOT EXISTS hypotheses (
                    hypothesis_id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    parent_id TEXT,
                    generation INTEGER NOT NULL,
                    origin_agent TEXT NOT NULL,
                    expression_sympy TEXT NOT NULL,
                    in_sample_mse REAL NOT NULL,
                    out_of_sample_mse REAL NOT NULL,
                    complexity_score REAL NOT NULL,
                    epistemological_tier TEXT NOT NULL,
                    red_team_verdict TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                );
                CREATE INDEX IF NOT EXISTS idx_hyp_problem ON hypotheses(problem_id);

                CREATE TABLE IF NOT EXISTS counterexamples (
                    counterexample_id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    hypothesis_id TEXT NOT NULL,
                    observed_failure TEXT NOT NULL,
                    exact_arithmetic_verified INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    payload_json TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS references_catalog (
                    ref_id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    source_type TEXT NOT NULL,
                    language TEXT NOT NULL,
                    title TEXT NOT NULL,
                    authors TEXT NOT NULL,
                    url TEXT NOT NULL,
                    summary TEXT NOT NULL,
                    sha256_hash TEXT NOT NULL,
                    fetched_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS books_catalog (
                    book_id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    author TEXT NOT NULL,
                    language TEXT NOT NULL,
                    source_url TEXT NOT NULL,
                    local_path TEXT NOT NULL,
                    bytes_size INTEGER NOT NULL,
                    sha256_hash TEXT NOT NULL,
                    excerpt TEXT NOT NULL,
                    downloaded_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS rejected_approaches (
                    rejection_id TEXT PRIMARY KEY,
                    problem_id TEXT NOT NULL,
                    strategy TEXT NOT NULL,
                    hypothesis_id TEXT,
                    reason TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );

                CREATE TABLE IF NOT EXISTS graph_edges (
                    edge_id TEXT PRIMARY KEY,
                    source_node TEXT NOT NULL,
                    target_node TEXT NOT NULL,
                    relation TEXT NOT NULL,
                    source_kind TEXT NOT NULL,
                    target_kind TEXT NOT NULL,
                    created_at TEXT NOT NULL
                );
                """
            )

    def record_experiment(self, exp: ExperimentRecord) -> None:
        payload = exp.model_dump()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO experiments (
                    experiment_id, problem_id, hypothesis_id, agent_id, strategy,
                    timestamp, seed, duration_ms, memory_mb, validation_passed,
                    sha256_hash, payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    exp.experiment_id,
                    exp.problem_id,
                    exp.hypothesis_id,
                    exp.agent_id,
                    exp.strategy,
                    exp.timestamp,
                    exp.seed,
                    exp.duration_ms,
                    exp.memory_mb,
                    1 if exp.validation_passed else 0,
                    exp.sha256_hash,
                    json.dumps(payload, ensure_ascii=False),
                ),
            )
        self.add_graph_edge(exp.experiment_id, exp.problem_id, "investigates", "experiment", "problem")
        self.add_graph_edge(exp.experiment_id, exp.hypothesis_id, "tests", "experiment", "hypothesis")

    def record_hypothesis(self, hyp: HypothesisRecord) -> None:
        payload = hyp.model_dump()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO hypotheses (
                    hypothesis_id, problem_id, parent_id, generation, origin_agent,
                    expression_sympy, in_sample_mse, out_of_sample_mse, complexity_score,
                    epistemological_tier, red_team_verdict, created_at, payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    hyp.hypothesis_id,
                    hyp.problem_id,
                    hyp.parent_id,
                    hyp.generation,
                    hyp.origin_agent,
                    hyp.expression_sympy,
                    hyp.in_sample_mse,
                    hyp.out_of_sample_mse,
                    hyp.complexity_score,
                    hyp.epistemological_tier.value,
                    hyp.red_team_verdict,
                    hyp.created_at,
                    json.dumps(payload, ensure_ascii=False),
                ),
            )
        self.add_graph_edge(hyp.hypothesis_id, hyp.problem_id, "models", "hypothesis", "problem")
        if hyp.parent_id:
            self.add_graph_edge(hyp.parent_id, hyp.hypothesis_id, "evolves_into", "hypothesis", "hypothesis")

    def record_counterexample(self, cex: CounterexampleRecord) -> None:
        payload = cex.model_dump()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO counterexamples (
                    counterexample_id, problem_id, hypothesis_id, observed_failure,
                    exact_arithmetic_verified, created_at, payload_json
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    cex.counterexample_id,
                    cex.problem_id,
                    cex.hypothesis_id,
                    cex.observed_failure,
                    1 if cex.exact_arithmetic_verified else 0,
                    cex.created_at,
                    json.dumps(payload, ensure_ascii=False),
                ),
            )
        self.add_graph_edge(cex.counterexample_id, cex.hypothesis_id, "refutes", "counterexample", "hypothesis")
        self.add_graph_edge(cex.counterexample_id, cex.problem_id, "constrains", "counterexample", "problem")
        cex_file = self.research_dir / "counterexamples" / f"{cex.counterexample_id}.json"
        cex_file.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")

    def record_rejection(self, rejection_id: str, problem_id: str, strategy: str, reason: str, hypothesis_id: str | None = None) -> None:
        created_at = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO rejected_approaches (
                    rejection_id, problem_id, strategy, hypothesis_id, reason, created_at
                ) VALUES (?, ?, ?, ?, ?, ?)
                """,
                (rejection_id, problem_id, strategy, hypothesis_id, reason, created_at),
            )
        rej_file = self.rejected_dir / f"{rejection_id}.json"
        rej_file.write_text(
            json.dumps(
                {
                    "rejection_id": rejection_id,
                    "problem_id": problem_id,
                    "strategy": strategy,
                    "hypothesis_id": hypothesis_id,
                    "reason": reason,
                    "created_at": created_at,
                },
                indent=2,
                ensure_ascii=False,
            ),
            encoding="utf-8",
        )

    def record_reference(self, ref: dict[str, Any]) -> None:
        fetched_at = ref.get("fetched_at") or datetime.now(timezone.utc).isoformat()
        sha = compute_sha256(ref)
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO references_catalog (
                    ref_id, problem_id, source_type, language, title, authors,
                    url, summary, sha256_hash, fetched_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    ref["ref_id"],
                    ref.get("problem_id", "general"),
                    ref.get("source_type", "paper"),
                    ref.get("language", "en"),
                    ref["title"],
                    ref.get("authors", "Unknown"),
                    ref["url"],
                    ref.get("summary", ""),
                    sha,
                    fetched_at,
                ),
            )
        self.add_graph_edge(ref["ref_id"], ref.get("problem_id", "general"), "cites", "reference", "problem")

    def record_book(self, book: dict[str, Any]) -> None:
        downloaded_at = book.get("downloaded_at") or datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR REPLACE INTO books_catalog (
                    book_id, title, author, language, source_url, local_path,
                    bytes_size, sha256_hash, excerpt, downloaded_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    book["book_id"],
                    book["title"],
                    book["author"],
                    book["language"],
                    book["source_url"],
                    book["local_path"],
                    book["bytes_size"],
                    book["sha256_hash"],
                    book.get("excerpt", ""),
                    downloaded_at,
                ),
            )

    def add_graph_edge(
        self,
        source_node: str,
        target_node: str,
        relation: str,
        source_kind: str,
        target_kind: str,
    ) -> None:
        edge_id = compute_sha256([source_node, target_node, relation])[:24]
        created_at = datetime.now(timezone.utc).isoformat()
        with self._connect() as conn:
            conn.execute(
                """
                INSERT OR IGNORE INTO graph_edges (
                    edge_id, source_node, target_node, relation, source_kind, target_kind, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
                """,
                (edge_id, source_node, target_node, relation, source_kind, target_kind, created_at),
            )

    def append_event(self, event: AgentEvent) -> None:
        with self.events_log.open("a", encoding="utf-8") as fp:
            fp.write(event.model_dump_json() + "\n")

    def list_experiments(self, problem_id: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        query = "SELECT payload_json FROM experiments"
        params: list[Any] = []
        if problem_id:
            query += " WHERE problem_id = ?"
            params.append(problem_id)
        query += " ORDER BY timestamp DESC LIMIT ?"
        params.append(limit)
        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()
        return [json.loads(r["payload_json"]) for r in rows]

    def list_hypotheses(self, problem_id: str | None = None, limit: int = 80) -> list[dict[str, Any]]:
        query = "SELECT payload_json FROM hypotheses"
        params: list[Any] = []
        if problem_id:
            query += " WHERE problem_id = ?"
            params.append(problem_id)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()
        return [json.loads(r["payload_json"]) for r in rows]

    def list_counterexamples(self, problem_id: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        query = "SELECT payload_json FROM counterexamples"
        params: list[Any] = []
        if problem_id:
            query += " WHERE problem_id = ?"
            params.append(problem_id)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()
        return [json.loads(r["payload_json"]) for r in rows]

    def list_rejections(self, problem_id: str | None = None, limit: int = 50) -> list[dict[str, Any]]:
        query = "SELECT * FROM rejected_approaches"
        params: list[Any] = []
        if problem_id:
            query += " WHERE problem_id = ?"
            params.append(problem_id)
        query += " ORDER BY created_at DESC LIMIT ?"
        params.append(limit)
        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]

    def list_references(self, problem_id: str | None = None, limit: int = 100) -> list[dict[str, Any]]:
        query = "SELECT * FROM references_catalog"
        params: list[Any] = []
        if problem_id:
            query += " WHERE problem_id = ?"
            params.append(problem_id)
        query += " ORDER BY fetched_at DESC LIMIT ?"
        params.append(limit)
        with self._connect() as conn:
            rows = conn.execute(query, params).fetchall()
        return [dict(r) for r in rows]

    def list_books(self) -> list[dict[str, Any]]:
        with self._connect() as conn:
            rows = conn.execute("SELECT * FROM books_catalog ORDER BY title ASC").fetchall()
        return [dict(r) for r in rows]

    def count_summary(self) -> dict[str, int]:
        with self._connect() as conn:
            counts = {}
            for tbl in ["experiments", "hypotheses", "counterexamples", "references_catalog", "books_catalog", "rejected_approaches"]:
                counts[tbl] = int(conn.execute(f"SELECT COUNT(*) FROM {tbl}").fetchone()[0])
            counts["approved_hypotheses"] = int(
                conn.execute("SELECT COUNT(*) FROM hypotheses WHERE red_team_verdict = 'approved_for_testing'").fetchone()[0]
            )
        return counts

    def build_knowledge_graph(self, problem_id: str | None = None, limit: int = 160) -> dict[str, Any]:
        """Build a NetworkX graph exporting nodes, edges, and centrality metrics."""
        graph = nx.DiGraph()
        with self._connect() as conn:
            query = "SELECT * FROM graph_edges"
            params: list[Any] = []
            if problem_id:
                query += " WHERE source_node = ? OR target_node = ?"
                params.extend([problem_id, problem_id])
            query += " ORDER BY created_at DESC LIMIT ?"
            params.append(limit)
            edges = conn.execute(query, params).fetchall()

        for row in edges:
            src = row["source_node"]
            dst = row["target_node"]
            if src not in graph:
                graph.add_node(src, kind=row["source_kind"])
            if dst not in graph:
                graph.add_node(dst, kind=row["target_kind"])
            graph.add_edge(src, dst, relation=row["relation"])

        degree_centrality = nx.degree_centrality(graph) if graph.number_of_nodes() > 0 else {}
        return {
            "node_count": graph.number_of_nodes(),
            "edge_count": graph.number_of_edges(),
            "nodes": [
                {
                    "id": node,
                    "kind": data.get("kind", "concept"),
                    "centrality": round(float(degree_centrality.get(node, 0.0)), 4),
                }
                for node, data in graph.nodes(data=True)
            ],
            "edges": [
                {"source": u, "target": v, "relation": d.get("relation", "related_to")}
                for u, v, d in graph.edges(data=True)
            ],
        }
