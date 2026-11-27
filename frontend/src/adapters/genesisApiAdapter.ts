/**
 * Adapter isolating backend FastAPI REST + WebSocket communication from UI components.
 * Gracefully handles offline mode without crashing the local 3D observatory.
 */

export interface BackendAgentInfo {
  agent_id: string
  code: string
  name: string
  role: string
  status: string
  last_action: string
  runs_count: number
  last_duration_ms: number
}

export interface BackendHardwareSnapshot {
  os_name: string
  cpu_model: string
  physical_cores: number | null
  logical_threads: number
  cpu_percent: number
  ram_total_gb: number
  ram_used_gb: number
  ram_available_gb: number
  disk_free_gb: number
  gpu_name: string
  gpu_vram_mb: number | null
  gpu_utilization_percent: number | null
  gpu_temp_c: number | null
  cuda_available: boolean
  within_safe_limits: boolean
  warnings: string[]
}

export interface BackendKnowledgeSummary {
  counts: Record<string, number>
  scheduler: {
    running: boolean
    mode: string
    cycles_completed: number
    max_cycles_per_session: number
    next_problem_id: string
    last_cycle_id: string | null
    last_problem_id: string | null
    current_strategy: string
  }
}

export interface BackendKnowledgeGraph {
  node_count: number
  edge_count: number
  nodes: Array<{ id: string; kind: string; centrality: number }>
  edges: Array<{ source: string; target: string; relation: string }>
}

async function fetchJson<T>(url: string, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(url, init)
    if (!res.ok) return null
    return (await res.json()) as T
  } catch {
    return null
  }
}

export const genesisApi = {
  async checkHealth(): Promise<{ status: string; counts: Record<string, number> } | null> {
    return fetchJson('/api/health')
  },
  async getAgents(): Promise<{ agents: BackendAgentInfo[]; recent_events: Array<Record<string, unknown>> } | null> {
    return fetchJson('/api/agents')
  },
  async getHardware(): Promise<BackendHardwareSnapshot | null> {
    return fetchJson('/api/hardware')
  },
  async getKnowledgeSummary(): Promise<BackendKnowledgeSummary | null> {
    return fetchJson('/api/knowledge/summary')
  },
  async getKnowledgeGraph(problemId?: string): Promise<BackendKnowledgeGraph | null> {
    const q = problemId ? `?problem_id=${encodeURIComponent(problemId)}` : ''
    return fetchJson(`/api/knowledge/graph${q}`)
  },
  async listExperiments(problemId?: string): Promise<Array<Record<string, unknown>>> {
    const q = problemId ? `?problem_id=${encodeURIComponent(problemId)}` : ''
    const res = await fetchJson<{ items: Array<Record<string, unknown>> }>(`/api/experiments${q}`)
    return res?.items ?? []
  },
  async listHypotheses(problemId?: string): Promise<Array<Record<string, unknown>>> {
    const q = problemId ? `?problem_id=${encodeURIComponent(problemId)}` : ''
    const res = await fetchJson<{ items: Array<Record<string, unknown>> }>(`/api/hypotheses${q}`)
    return res?.items ?? []
  },
  async listCounterexamples(problemId?: string): Promise<Array<Record<string, unknown>>> {
    const q = problemId ? `?problem_id=${encodeURIComponent(problemId)}` : ''
    const res = await fetchJson<{ items: Array<Record<string, unknown>> }>(`/api/counterexamples${q}`)
    return res?.items ?? []
  },
  async listRejections(problemId?: string): Promise<Array<Record<string, unknown>>> {
    const q = problemId ? `?problem_id=${encodeURIComponent(problemId)}` : ''
    const res = await fetchJson<{ items: Array<Record<string, unknown>> }>(`/api/rejections${q}`)
    return res?.items ?? []
  },
  async listBooks(): Promise<Array<Record<string, unknown>>> {
    const res = await fetchJson<{ items: Array<Record<string, unknown>> }>('/api/books')
    return res?.items ?? []
  },
  async getBookPreview(bookId: string, maxChars = 6000): Promise<Record<string, unknown> | null> {
    return fetchJson(`/api/books/${encodeURIComponent(bookId)}?max_chars=${Math.max(200, Math.min(maxChars, 20000))}`)
  },
  async listReferences(problemId?: string): Promise<{ items: Array<Record<string, unknown>>; multilingual: Record<string, string> } | null> {
    const q = problemId ? `?problem_id=${encodeURIComponent(problemId)}` : ''
    return fetchJson(`/api/references${q}`)
  },
  async queryLiveResearch(problemId: string, query: string): Promise<{ added_count: number; items: Array<Record<string, unknown>> } | null> {
    return fetchJson('/api/research/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem_id: problemId, query, include_arxiv: true, include_openalex: true }),
    })
  },
  async runDiscoveryCycle(problemId: string, mode = 'balanced', strategy = 'adaptive', projection = 'cartesian_3d'): Promise<Record<string, unknown> | null> {
    return fetchJson(`/api/cycles/run?projection=${encodeURIComponent(projection)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ problem_id: problemId, mode, seed: 42, strategy, export_reports: true }),
    })
  },
  async startScheduler(mode = 'balanced', maxCycles = 12) {
    return fetchJson('/api/scheduler/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mode, max_cycles: maxCycles }),
    })
  },
  async pauseScheduler() {
    return fetchJson('/api/scheduler/pause', { method: 'POST' })
  },
  async listProblemFiles(problemId: string): Promise<Array<{ name: string; size_bytes: number }>> {
    const res = await fetchJson<{ files: Array<{ name: string; size_bytes: number }> }>(`/api/reports/${encodeURIComponent(problemId)}/files`)
    return res?.files ?? []
  },
}
