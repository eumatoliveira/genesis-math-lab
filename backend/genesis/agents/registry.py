"""Registry & runtime telemetry for all 17 GENESIS agents (AGENT 00 to AGENT 16)."""

from __future__ import annotations

from genesis.models import AgentInfo


AGENT_DEFINITIONS: list[tuple[str, str, str, str]] = [
    ("agent_00", "AGENT 00", "GENESIS Master Orchestrator", "Coordenação geral, priorização por ganho de informação e governança"),
    ("agent_01", "AGENT 01", "Global Scientific Research", "Pesquisa multilíngue em arXiv, OpenAlex, OEIS e livros públicos"),
    ("agent_02", "AGENT 02", "Mathematical Decomposition", "Formalização de hipóteses, domínios, quantificadores e critérios de refutação"),
    ("agent_03", "AGENT 03", "Visual Discovery", "Projeções 3D/ND, grids, campos e detecção de anomalias visuais"),
    ("agent_04", "AGENT 04", "Computational Physics", "Correspondência física rigorosa e analogias de campos/ondas (tipo Wi-Fi)"),
    ("agent_05", "AGENT 05", "Simulation Engine", "Simulação numérica e amostragem adaptativa (18x18 -> refinamento seletivo)"),
    ("agent_06", "AGENT 06", "Pattern Recognition", "Análise espectral FFT, simetria, recorrência, Lyapunov e verificação bruta"),
    ("agent_07", "AGENT 07", "Symbolic Discovery", "Regressão simbólica esparsa SymPy/SINDy com penalidade de complexidade"),
    ("agent_08", "AGENT 08", "Evolutionary Discovery", "Algoritmos evolutivos, MAP-Elites e genealogia de hipóteses"),
    ("agent_09", "AGENT 09", "Quantum-Inspired Computing", "Simulated quantum annealing & amplitude search vs baseline clássico"),
    ("agent_10", "AGENT 10", "Counterexample Hunter", "Busca adversarial exata, casos extremos, overflow e controles negativos"),
    ("agent_11", "AGENT 11", "Formal Theorem Prover", "Verificação simbólica, esqueletos Lean 4 sem sorry/admit e status em 9 níveis"),
    ("agent_12", "AGENT 12", "Hardware Optimization", "Telemetria psutil/GPU RTX 3050, limites 12-16GB RAM / 50-70% CPU e backpressure"),
    ("agent_13", "AGENT 13", "Scientific Red Team", "Revisão independente e rejeição de hipóteses circulares ou superajustadas"),
    ("agent_14", "AGENT 14", "Knowledge and Memory", "Memória persistente SQLite + JSONL + Grafo de Conhecimento NetworkX + SHA-256"),
    ("agent_15", "AGENT 15", "Scientific Reporting", "Geração automática de dossiês de 9 arquivos em Markdown e PDF (ReportLab)"),
    ("agent_16", "AGENT 16", "Scientific UI/UX Bridge", "Streaming WebSocket/REST em tempo real para o laboratório 3D interativo"),
]


class AgentRegistry:
    """Tracks live status, run counts, and execution latency of all 17 GENESIS agents."""

    def __init__(self) -> None:
        self._agents: dict[str, AgentInfo] = {
            aid: AgentInfo(agent_id=aid, code=code, name=name, role=role)
            for aid, code, name, role in AGENT_DEFINITIONS
        }

    def mark_running(self, agent_id: str, action: str) -> None:
        if agent_id in self._agents:
            a = self._agents[agent_id]
            a.status = "running"
            a.last_action = action

    def mark_completed(self, agent_id: str, action: str, duration_ms: float) -> None:
        if agent_id in self._agents:
            a = self._agents[agent_id]
            a.status = "completed"
            a.last_action = action
            a.runs_count += 1
            a.last_duration_ms = round(duration_ms, 2)

    def mark_blocked(self, agent_id: str, reason: str) -> None:
        if agent_id in self._agents:
            a = self._agents[agent_id]
            a.status = "blocked"
            a.last_action = reason

    def snapshot(self) -> list[AgentInfo]:
        return list(self._agents.values())
