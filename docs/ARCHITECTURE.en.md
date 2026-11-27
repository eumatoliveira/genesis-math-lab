# GENESIS — Architecture & Engineering Guide (EN)

## Overview
**GENESIS** is a local-first **Autonomous Visual Mathematical Discovery Laboratory** engineered for conventional desktop hardware (verified on Intel Core i5-10400, 32 GB RAM, NVIDIA RTX 3050). Its core premise is **Visual-First Scientific Discovery**: render mathematical behavior in 3D/ND spaces, detect structural symmetries and anomalies visually, guide adaptive high-resolution sampling selectively to high-gradient regions, synthesize candidate symbolic expressions, attack them adversarially, and log reproducible provenance without overclaiming formal proofs.

## Layered Architecture
1. **Domain Layer (`frontend/src/domain/`, `backend/genesis/models.py`)**:
   - Strict separation across Philosophical Inspiration, Physical Classification (4 tiers), Empirical Evidence, and Epistemological Proof Status (9 tiers).
   - 113 mathematical problems across 12 categories + positive/negative scientific controls + 23 Hilbert reference table.
2. **17-Agent Scientific Pipeline (`backend/genesis/agents/`)**:
   - `AGENT 00` Master Orchestrator coordinates `AGENT 01..16`, enforcing strategy rotation when information gain plateaus.
   - `AGENT 07` (Symbolic Discovery) and `AGENT 08` (Evolutionary MAP-Elites) are strictly isolated from `AGENT 10` (Counterexample Hunter), `AGENT 11` (Formal Theorem Prover), and `AGENT 13` (Independent Red Team).
3. **Adapters & Observability (`frontend/src/adapters/`, `frontend/src/observability/`, `backend/genesis/storage/`)**:
   - REST + WebSocket bridge (`genesisApiAdapter.ts`), LocalStorage persistence (`storageAdapter.ts`), Markdown & Vector PDF exporter (`reportExporter.ts` capturing live WebGL + 2D canvas snapshots), SQLite + JSONL + NetworkX Knowledge Graph with SHA-256 hashes, and `psutil`/GPU hardware telemetry.
4. **GPU Visualizers (`frontend/src/visualizers/`)**:
   - Custom GLSL `LuminousGridShader`, exploratory `WifiFieldOverlay`, `SimulationMeshRenderer` with proper Three.js resource disposal, and synchronized high-DPI `Oscilloscope2D`.

## Architectural Decision Records (ADRs)
See `docs/adr/` for ADR-001 through ADR-004.
