"""Core Pydantic domain models, epistemological taxonomies, and provenance schemas."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Any
from pydantic import BaseModel, Field


class EpistemologicalStatus(str, Enum):
    """Strict 9-tier classification mandated by Section 5 (Agent 11)."""

    OBSERVATION = "Observação"
    EMPIRICAL_PATTERN = "Padrão Empírico"
    HYPOTHESIS = "Hipótese"
    CONJECTURE = "Conjectura"
    PARTIAL_RESULT = "Resultado Parcial"
    PROVED_LEMMA = "Lema Demonstrado"
    VERIFIED_COUNTEREXAMPLE = "Contraexemplo Verificado"
    CANDIDATE_PROOF = "Demonstração Candidata"
    FORMALLY_VERIFIED = "Demonstração Formalmente Verificada"


class PhysicsClassification(str, Enum):
    """Strict 4-tier classification mandated by Section 5 (Agent 04)."""

    PROVED_EQUIVALENCE = "Equivalência Demonstrada"
    APPROXIMATE_MODEL = "Modelo Aproximado"
    EXPLORATORY_ANALOGY = "Analogia Exploratória"
    UNVALIDATED_HYPOTHESIS = "Hipótese Não Validada"


class ExecutionMode(str, Enum):
    MANUAL = "manual"
    INTERACTIVE = "interactive"
    ECO = "eco"
    BALANCED = "balanced"
    HIGH_PERFORMANCE = "high_performance"
    CONTINUOUS = "continuous"


class PhilosophicalLens(BaseModel):
    """Explicit philosophical/historical inspiration separated from scientific claims (Section 3)."""

    spiritual_ethical_inspiration: str
    scientist_methodology: str
    conceptual_analogy: str
    separation_notice: str = (
        "Inspiração filosófica e analogias conceituais NÃO constituem evidência experimental nem demonstração formal."
    )


class ProblemFormalization(BaseModel):
    """Structured output of AGENT 02 (Mathematical Decomposition)."""

    problem_id: str
    title: str
    area: str
    current_scientific_status: str
    original_statement: str
    hypotheses: list[str]
    conclusion: str
    variables: dict[str, str]
    domains: dict[str, str]
    constraints: list[str]
    quantifiers: list[str]
    equivalent_formulations: list[str]
    known_invariants: list[str]
    subproblems: list[str]
    special_cases_proved: list[str]
    necessary_conditions: list[str]
    sufficient_conditions: list[str]
    refutation_criteria: str
    formal_tier: EpistemologicalStatus
    physics_tier: PhysicsClassification
    physics_rationale: str
    philosophical_lens: PhilosophicalLens


class HardwareSnapshot(BaseModel):
    """Real local hardware measurement captured by AGENT 12."""

    os_name: str
    cpu_model: str
    physical_cores: int | None
    logical_threads: int
    cpu_percent: float
    ram_total_gb: float
    ram_used_gb: float
    ram_available_gb: float
    disk_free_gb: float
    gpu_name: str
    gpu_vram_mb: float | None = None
    gpu_utilization_percent: float | None = None
    gpu_temp_c: float | None = None
    cuda_available: bool = False
    opencl_vulkan_note: str = "WebGL2/WebGPU via navegador local; CUDA verificada via PyTorch"
    within_safe_limits: bool = True
    warnings: list[str] = Field(default_factory=list)


class ExperimentRecord(BaseModel):
    """Full Section-15 reproducibility schema for every experiment."""

    experiment_id: str
    problem_id: str
    hypothesis_id: str
    agent_id: str
    strategy: str
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    git_commit: str
    dependencies_version: dict[str, str]
    seed: int
    parameters: dict[str, Any]
    numerical_precision: str
    hardware_used: dict[str, Any]
    duration_ms: float
    memory_mb: float
    input_data: dict[str, Any]
    output_data: dict[str, Any]
    success_criteria: str
    validation_result: str
    validation_passed: bool
    limitations: list[str]
    sha256_hash: str


class HypothesisRecord(BaseModel):
    """Generated, evolved, or Red-Team rejected mathematical hypothesis."""

    hypothesis_id: str
    problem_id: str
    parent_id: str | None = None
    generation: int = 0
    origin_agent: str
    visual_cue: str
    expression_sympy: str
    plain_description: str
    in_sample_mse: float
    out_of_sample_mse: float
    complexity_score: float
    epistemological_tier: EpistemologicalStatus
    red_team_verdict: str  # "approved_for_testing" | "rejected"
    red_team_reason: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class CounterexampleRecord(BaseModel):
    """Adversarial witness produced by AGENT 10."""

    counterexample_id: str
    problem_id: str
    hypothesis_id: str
    input_witness: dict[str, Any]
    claimed_property: str
    observed_failure: str
    exact_arithmetic_verified: bool
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AgentInfo(BaseModel):
    """Metadata & live telemetry of one of the 17 GENESIS agents."""

    agent_id: str
    code: str
    name: str
    role: str
    status: str = "idle"  # idle | running | completed | blocked
    last_action: str = "Aguardando ciclo experimental"
    runs_count: int = 0
    last_duration_ms: float = 0.0


class AgentEvent(BaseModel):
    """Structured event emitted across the 17-agent pipeline."""

    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    agent_id: str
    problem_id: str
    stage: str
    message: str
    metrics: dict[str, Any] = Field(default_factory=dict)


class VisualProjectionReport(BaseModel):
    """Documents multidimensional projection and explicitly tracks preserved vs discarded properties."""

    projection_name: str
    source_dimensions: str
    target_dimensions: str
    mapping_formula: str
    preserved_properties: list[str]
    discarded_properties: list[str]
    anomaly_hotspots: list[dict[str, Any]]
    grid_3d_points: list[list[float]]
    curve_2d_points: list[list[float]]


class DiscoveryCycleRequest(BaseModel):
    problem_id: str = "collatz"
    mode: str = "balanced"
    seed: int = 42
    strategy: str = "adaptive"  # adaptive | brute_force | evolutionary | quantum_inspired
    params: dict[str, Any] = Field(default_factory=dict)
    export_reports: bool = True


class DiscoveryCycleResult(BaseModel):
    cycle_id: str
    problem_id: str
    strategy: str
    mode: str
    formalization: ProblemFormalization
    visual_report: VisualProjectionReport
    experiment: ExperimentRecord
    adaptive_benchmark: dict[str, Any]
    pattern_findings: dict[str, Any]
    symbolic_hypotheses: list[HypothesisRecord]
    evolution_summary: dict[str, Any]
    quantum_benchmark: dict[str, Any]
    counterexamples: list[CounterexampleRecord]
    formal_verification: dict[str, Any]
    red_team_audit: dict[str, Any]
    hardware_snapshot: HardwareSnapshot
    report_paths: dict[str, str]
    events: list[AgentEvent]
