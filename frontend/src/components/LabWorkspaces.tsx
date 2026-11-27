import {
  AlertTriangle,
  BookOpen,
  Bot,
  CheckCircle2,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  GitBranch,
  Globe2,
  Play,
  RefreshCw,
  Search,
  ShieldAlert,
  Square,
  X,
  XCircle,
} from 'lucide-react'
import { useState } from 'react'
import {
  genesisApi,
  type BackendAgentInfo,
  type BackendHardwareSnapshot,
  type BackendKnowledgeGraph,
  type BackendKnowledgeSummary,
} from '../adapters/genesisApiAdapter'
import { HILBERT_23_PROBLEMS, OPEN_SOURCE_STACK, PUBLIC_RESEARCH_CATALOGS } from '../domain/openSourceCatalog'
import { METHODOLOGY_SCIENTISTS, PILLARS } from '../domain/pillars'
import { getStudyPathProblems } from '../domain/problemsCatalog'
import type { ProblemSpec } from '../domain/types'

interface SharedWorkspaceProps {
  selectedProblem: ProblemSpec
  backendOnline: boolean
  agents: BackendAgentInfo[]
  recentEvents: Array<Record<string, unknown>>
  hardware: BackendHardwareSnapshot | null
  knowledgeSummary: BackendKnowledgeSummary | null
  knowledgeGraph: BackendKnowledgeGraph | null
  experiments: Array<Record<string, unknown>>
  hypotheses: Array<Record<string, unknown>>
  counterexamples: Array<Record<string, unknown>>
  rejections: Array<Record<string, unknown>>
  books: Array<Record<string, unknown>>
  references: Array<Record<string, unknown>>
  multilingualTerms: Record<string, string>
  problemFiles: Array<{ name: string; size_bytes: number }>
  onRefreshBackend: () => void
  onSelectProblem: (p: ProblemSpec) => void
  onExportLocalMd: () => void
  onExportLocalPdf: () => void
}

export function AgentsObservatoryView({
  selectedProblem,
  agents,
  recentEvents,
  knowledgeSummary,
  onRefreshBackend,
}: Pick<SharedWorkspaceProps, 'selectedProblem' | 'agents' | 'recentEvents' | 'knowledgeSummary' | 'onRefreshBackend'>) {
  const [schedMode, setSchedMode] = useState('balanced')
  const [busy, setBusy] = useState(false)

  const triggerCycle = async () => {
    setBusy(true)
    await genesisApi.runDiscoveryCycle(selectedProblem.id, schedMode, 'adaptive')
    onRefreshBackend()
    setBusy(false)
  }

  const toggleScheduler = async () => {
    setBusy(true)
    if (knowledgeSummary?.scheduler.running) {
      await genesisApi.pauseScheduler()
    } else {
      await genesisApi.startScheduler(schedMode, 10)
    }
    onRefreshBackend()
    setBusy(false)
  }

  return (
    <div className="min-w-0 space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#1F1F1F]">
            <Bot className="h-5 w-5 shrink-0 text-[#0067B8]" />
            <span>Observatório Multiagente (17 Agentes Especializados)</span>
          </h2>
          <p className="mt-0.5 text-xs text-[#444746]">
            Separação rigorosa: Geração (01–09) isolada da Refutação & Auditoria Red Team (10, 11, 13, 14).
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Modo de execução do scheduler"
            value={schedMode}
            onChange={(e) => setSchedMode(e.target.value)}
            className="rounded-lg border border-[#DADCE0] bg-[#F8F9FA] px-2.5 py-1.5 text-xs text-[#1F1F1F]"
          >
            <option value="manual">Manual</option>
            <option value="interactive">Interativo</option>
            <option value="eco">Econômico</option>
            <option value="balanced">Balanceado</option>
            <option value="high_performance">Alto Desempenho</option>
            <option value="continuous">Pesquisa Contínua</option>
          </select>

          <button
            type="button"
            onClick={triggerCycle}
            disabled={busy}
            className="flex items-center gap-1.5 rounded-full bg-[#1A73E8] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1557B0] disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${busy ? 'animate-spin' : ''}`} />
            <span>Executar Ciclo em {selectedProblem.code}</span>
          </button>

          <button
            type="button"
            onClick={toggleScheduler}
            disabled={busy}
            className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold text-white ${
              knowledgeSummary?.scheduler.running
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {knowledgeSummary?.scheduler.running ? <Square className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{knowledgeSummary?.scheduler.running ? 'Pausar Loop Autônomo' : 'Iniciar Loop Autônomo'}</span>
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {agents.map((ag) => (
          <div key={ag.agent_id} className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-3.5 shadow-2xs">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-[11px] font-bold text-[#0067B8]">{ag.code}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  ag.status === 'completed'
                    ? 'bg-emerald-50 text-emerald-700'
                    : ag.status === 'running'
                      ? 'bg-[#E8F0FE] text-[#1A73E8]'
                      : 'bg-[#F1F3F4] text-[#444746]'
                }`}
              >
                {ag.status} · {ag.runs_count}×
              </span>
            </div>
            <div className="mt-1 font-display text-xs font-bold text-[#1F1F1F]">{ag.name}</div>
            <p className="mt-1 text-[11px] text-[#444746]">{ag.role}</p>
            <div className="mt-2 truncate border-t border-[#F1F5F9] pt-1.5 font-mono text-[10px] text-[#0067B8]">
              {ag.last_action} ({ag.last_duration_ms}ms)
            </div>
          </div>
        ))}
      </div>

      <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
          Logs Científicos em Tempo Real (Eventos dos Agentes)
        </h3>
        <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto font-mono text-[11px]">
          {recentEvents.map((ev, i) => (
            <div
              key={i}
              className="break-words rounded-lg border border-[#E3E8EF] bg-[#F8F9FA] px-2.5 py-1.5 text-[#1F1F1F]"
            >
              <span className="font-bold text-[#0067B8]">[{String(ev.agent_id ?? '')}]</span>{' '}
              <span className="font-semibold text-[#1A73E8]">({String(ev.problem_id ?? '')})</span>{' '}
              {String(ev.message ?? '')}
            </div>
          ))}
          {recentEvents.length === 0 && (
            <p className="text-[#444746]">Execute um ciclo para visualizar eventos estruturados dos 17 agentes.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function KnowledgeEvolutionView({
  hypotheses,
  knowledgeGraph,
  rejections,
}: Pick<SharedWorkspaceProps, 'hypotheses' | 'knowledgeGraph' | 'rejections'>) {
  const nodes = knowledgeGraph?.nodes.slice(0, 26) ?? []
  const edges = knowledgeGraph?.edges.slice(0, 36) ?? []
  const nodePos = new Map<string, { x: number; y: number }>()
  nodes.forEach((n, idx) => {
    const ang = (idx / Math.max(1, nodes.length)) * Math.PI * 2
    const r = idx % 2 === 0 ? 115 : 68
    nodePos.set(n.id, { x: 260 + r * Math.cos(ang), y: 150 + r * Math.sin(ang) })
  })

  return (
    <div className="min-w-0 space-y-4 p-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-[#1F1F1F]">
            <GitBranch className="h-4 w-4 shrink-0 text-[#1A73E8]" />
            <span>
              Grafo Científico NetworkX ({knowledgeGraph?.node_count ?? 0} nós / {knowledgeGraph?.edge_count ?? 0} arestas)
            </span>
          </h2>
          {/* Dark Obsidian scientific canvas for sharp glowing node legibility */}
          <svg
            viewBox="0 0 520 300"
            className="mt-3 h-72 w-full rounded-xl border border-[#1E293B] bg-[#081B33]"
          >
            {edges.map((e, idx) => {
              const p1 = nodePos.get(e.source)
              const p2 = nodePos.get(e.target)
              if (!p1 || !p2) return null
              return (
                <line
                  key={idx}
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke={e.relation === 'refutes' ? '#fb7185' : '#38e8ff'}
                  strokeOpacity={0.38}
                  strokeWidth={1.2}
                />
              )
            })}
            {nodes.map((n) => {
              const p = nodePos.get(n.id)
              if (!p) return null
              const color =
                n.kind === 'problem'
                  ? '#f5b942'
                  : n.kind === 'counterexample'
                    ? '#fb7185'
                    : n.kind === 'hypothesis'
                      ? '#a78bfa'
                      : '#38e8ff'
              return (
                <g key={n.id}>
                  <circle cx={p.x} cy={p.y} r={n.kind === 'problem' ? 8 : 5} fill={color} />
                  <text x={p.x + 9} y={p.y + 3} fill="#e2e8f0" fontSize="8" fontFamily="monospace">
                    {n.id.slice(0, 14)}
                  </text>
                </g>
              )
            })}
          </svg>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-rose-800">
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>Abordagens Rejeitadas pelo Red Team ({rejections.length})</span>
          </h3>
          <p className="mt-1 text-xs text-[#444746]">
            Resultados negativos registrados para evitar repetição de estratégias fracassadas ou sobreajustadas.
          </p>
          <div className="mt-3 max-h-64 space-y-2 overflow-y-auto">
            {rejections.map((r, i) => (
              <div key={i} className="rounded-xl border border-rose-200 bg-rose-50/70 p-2.5 text-xs">
                <div className="flex flex-wrap justify-between gap-1 font-mono text-[10px] font-semibold text-rose-800">
                  <span>
                    {String(r.problem_id)} · {String(r.hypothesis_id ?? '')}
                  </span>
                  <span>{String(r.strategy)}</span>
                </div>
                <div className="mt-1 break-words text-[#1F1F1F]">{String(r.reason)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
        <h3 className="font-display text-sm font-bold text-[#1F1F1F]">
          Árvore de Evolução de Hipóteses Simbólicas & MAP-Elites ({hypotheses.length})
        </h3>
        <div className="mt-3 grid gap-2.5 md:grid-cols-2">
          {hypotheses.slice(0, 12).map((h, i) => {
            const approved = h.red_team_verdict === 'approved_for_testing'
            return (
              <div key={i} className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-mono text-[11px] font-bold text-[#0067B8]">
                    {String(h.hypothesis_id)} (Gen {String(h.generation)})
                  </span>
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      approved ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {approved ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                    {approved ? 'Aprovada p/ Teste' : 'Rejeitada'}
                  </span>
                </div>
                <div className="mt-1.5 max-w-full overflow-x-auto font-mono text-[11px] text-[#1F1F1F]">
                  {String(h.expression_sympy)}
                </div>
                <div className="mt-1 break-words text-[11px] text-[#444746]">{String(h.plain_description)}</div>
                <div className="mt-1.5 flex justify-between font-mono text-[10px] text-[#5F6368]">
                  <span>OOS MSE: {String(h.out_of_sample_mse)}</span>
                  <span>{String(h.problem_id)}</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export function ProofCounterexampleView({
  selectedProblem,
  counterexamples,
}: Pick<SharedWorkspaceProps, 'selectedProblem' | 'counterexamples'>) {
  const [collatzProbe, setCollatzProbe] = useState('27')
  const [probeResult, setProbeResult] = useState<string>('')

  const runExactProbe = async () => {
    const rawN = Number.parseInt(collatzProbe, 10)
    const n = Number.isFinite(rawN) ? Math.max(1, Math.min(rawN, 1e12)) : 27
    try {
      const r = await fetch(`/api/probe/collatz/${n}`)
      if (r.ok) {
        const d = await r.json()
        setProbeResult(`Python BigInt Exato n=${d.start_n}: ${d.steps} passos, pico=${d.max_value}, final=${d.final_value}`)
        return
      }
      if (r.status >= 400 && r.status < 500) {
        setProbeResult(`Entrada fora do intervalo permitido [1, 1e12] (HTTP ${r.status}).`)
        return
      }
    } catch {
      // fallback note below
    }
    setProbeResult('Backend offline — inicie uvicorn para sondas BigInt arbitrárias.')
  }

  return (
    <div className="min-w-0 space-y-4 p-4">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
          <h2 className="font-display text-sm font-bold text-[#1F1F1F]">
            Workspace de Prova Formal (Agente 11 — Lean 4 / SymPy)
          </h2>
          <p className="mt-1 text-xs text-[#444746]">
            Proibido usar <code className="rounded bg-rose-50 px-1 text-rose-700">sorry</code> ou{' '}
            <code className="rounded bg-rose-50 px-1 text-rose-700">admit</code> para simular provas concluídas. Status
            atual de <strong>{selectedProblem.title}</strong>:{' '}
            <span className="hl-key font-semibold">{selectedProblem.formalTier}</span>.
          </p>
          <pre className="mt-3 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-[#1E293B] bg-[#081B33] p-3.5 font-mono text-[11px] leading-relaxed text-emerald-200">
{`-- Esqueleto Formal Lean 4 (Enunciado apenas — sem prova automática fraudulenta)
-- Problema: ${selectedProblem.title} (${selectedProblem.code})
-- Status: ${selectedProblem.status} (${selectedProblem.formalTier})
-- Fórmula: ${selectedProblem.formulaLatex}`}
          </pre>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              type="number"
              value={collatzProbe}
              onChange={(e) => setCollatzProbe(e.target.value)}
              className="w-36 rounded-lg border border-[#DADCE0] bg-[#F8F9FA] px-2.5 py-1.5 font-mono text-xs text-[#1F1F1F] focus:border-[#1A73E8] focus:outline-none"
            />
            <button
              type="button"
              onClick={runExactProbe}
              className="rounded-full bg-[#0067B8] px-4 py-1.5 text-xs font-semibold text-white hover:bg-[#00569C]"
            >
              Testar Sonda BigInt Exata (Collatz)
            </button>
          </div>
          {probeResult && (
            <div className="mt-2 break-words rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 font-mono text-xs text-emerald-800">
              {probeResult}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-rose-800">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Contraexemplos Verificados (Agente 10 — Controles Negativos & Ataques)</span>
          </h3>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {counterexamples.map((c, i) => (
              <div key={i} className="rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs">
                <div className="font-mono text-[10px] font-bold text-rose-800">
                  {String(c.counterexample_id)} · {String(c.problem_id)}
                </div>
                <div className="mt-1 break-words text-[#1F1F1F]">
                  <strong>Afirmação:</strong> {String(c.claimed_property)}
                </div>
                <div className="mt-0.5 break-words text-amber-900">
                  <strong>Falha Verificada:</strong> {String(c.observed_failure)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function HistoryHardwareView({
  hardware,
  experiments,
}: Pick<SharedWorkspaceProps, 'hardware' | 'experiments'>) {
  return (
    <div className="min-w-0 space-y-4 p-4">
      <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-[#1F1F1F]">
          <Cpu className="h-4 w-4 shrink-0 text-[#0067B8]" />
          <span>Monitor de Hardware Doméstico (Agente 13 — Telemetria Real)</span>
        </h2>
        {hardware ? (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-3">
              <div className="text-[10px] font-medium text-[#444746]">CPU ({hardware.logical_threads} Threads)</div>
              <div className="font-mono text-base font-bold text-[#0067B8]">{hardware.cpu_percent}% uso</div>
              <div className="truncate text-[10px] text-[#5F6368]">{hardware.cpu_model}</div>
            </div>
            <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-3">
              <div className="text-[10px] font-medium text-[#444746]">Memória RAM (Teto Lab 14 GB)</div>
              <div className="font-mono text-base font-bold text-emerald-700">
                {hardware.ram_available_gb} / {hardware.ram_total_gb} GB livre
              </div>
              <div className="text-[10px] text-[#5F6368]">Em uso host: {hardware.ram_used_gb} GB</div>
            </div>
            <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-3">
              <div className="text-[10px] font-medium text-[#444746]">GPU & Aceleração Gráfica</div>
              <div className="truncate font-mono text-sm font-bold text-amber-800">{hardware.gpu_name}</div>
              <div className="text-[10px] text-[#5F6368]">
                VRAM: {hardware.gpu_vram_mb ? `${hardware.gpu_vram_mb} MB` : 'WebGL2'} · Temp:{' '}
                {hardware.gpu_temp_c ?? '—'}°C
              </div>
            </div>
            <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-3">
              <div className="text-[10px] font-medium text-[#444746]">Disco Livre & Segurança</div>
              <div className="font-mono text-base font-bold text-violet-700">{hardware.disk_free_gb} GB</div>
              <div className="text-[10px] font-medium text-emerald-700">
                {hardware.within_safe_limits ? 'Dentro dos limites seguros' : 'Backpressure Ativo'}
              </div>
            </div>
          </div>
        ) : (
          <p className="mt-2 text-xs text-[#444746]">Conecte ao backend FastAPI para telemetria psutil/GPU ao vivo.</p>
        )}
      </div>

      <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
        <h3 className="font-display text-sm font-bold text-[#1F1F1F]">
          Histórico de Experimentos Reproduzíveis (SQLite + SHA-256)
        </h3>
        <div className="mt-3 max-w-full overflow-x-auto">
          <table className="w-full text-left font-mono text-[11px]">
            <thead className="border-b border-[#E3E8EF] text-[#444746]">
              <tr>
                <th className="py-2 pr-3">ID Experimento</th>
                <th className="py-2 pr-3">Problema</th>
                <th className="py-2 pr-3">Estratégia</th>
                <th className="py-2 pr-3">Seed</th>
                <th className="py-2 pr-3">Duração</th>
                <th className="py-2">Hash SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {experiments.map((e, i) => (
                <tr key={i} className="border-b border-[#F1F5F9] text-[#1F1F1F]">
                  <td className="py-1.5 pr-3 text-[#0067B8]">{String(e.experiment_id)}</td>
                  <td className="py-1.5 pr-3">{String(e.problem_id)}</td>
                  <td className="py-1.5 pr-3">{String(e.strategy)}</td>
                  <td className="py-1.5 pr-3">{String(e.seed)}</td>
                  <td className="py-1.5 pr-3">{String(e.duration_ms)} ms</td>
                  <td className="py-1.5 text-amber-800">{String(e.sha256_hash ?? '').slice(0, 18)}...</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function ReportsSourcesView({
  selectedProblem,
  books,
  references,
  multilingualTerms,
  problemFiles,
  onRefreshBackend,
  onSelectProblem,
  onExportLocalMd,
  onExportLocalPdf,
}: SharedWorkspaceProps) {
  const [searchQ, setSearchQ] = useState(selectedProblem.title)
  const [searching, setSearching] = useState(false)
  const [bookReader, setBookReader] = useState<Record<string, unknown> | null>(null)
  const studyPath = getStudyPathProblems()

  const runLiveSearch = async () => {
    setSearching(true)
    await genesisApi.queryLiveResearch(selectedProblem.id, searchQ)
    onRefreshBackend()
    setSearching(false)
  }

  const openBook = async (b: Record<string, unknown>) => {
    const id = String(b.book_id ?? '')
    if (!id) return
    const res = await genesisApi.getBookPreview(id, 4500)
    setBookReader(res ?? b)
  }

  return (
    <div className="min-w-0 space-y-4 p-4">
      {/* 9-File Backend Dossier + Local WebGL Snapshot Export */}
      <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0">
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-[#1F1F1F]">
              <FileText className="h-4 w-4 shrink-0 text-[#0067B8]" />
              <span>Central de Relatórios Científicos — {selectedProblem.title}</span>
            </h2>
            <p className="mt-0.5 text-xs text-[#444746]">
              Exportação instantânea local (com captura 3D + osciloscópio) e dossiês de 9 arquivos em{' '}
              <code className="rounded bg-[#F8F9FA] px-1 text-[#0067B8]">research/problems/{selectedProblem.id}/</code>.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onExportLocalMd}
              className="rounded-full border border-[#DADCE0] bg-[#F8F9FA] px-3.5 py-1.5 text-xs font-medium text-[#1F1F1F] hover:border-[#1A73E8]"
            >
              Exportar Sessão .MD
            </button>
            <button
              type="button"
              onClick={onExportLocalPdf}
              className="rounded-full bg-[#0067B8] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#00569C]"
            >
              Exportar Sessão .PDF (3D)
            </button>
          </div>
        </div>

        {problemFiles.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {problemFiles.map((f) => (
              <a
                key={f.name}
                href={`/api/reports/${encodeURIComponent(selectedProblem.id)}/download/${encodeURIComponent(f.name)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-[#DADCE0] bg-[#F8F9FA] px-2.5 py-1 font-mono text-[11px] text-[#0067B8] hover:border-[#1A73E8]"
              >
                <Download className="h-3 w-3" />
                <span>{f.name}</span>
                <span className="text-[#5F6368]">({Math.max(1, Math.round(f.size_bytes / 1024))} KB)</span>
              </a>
            ))}
          </div>
        )}
      </div>

      {/* Live Multilingual Search + Downloaded Open-Access Monographs & Classics */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#1F1F1F]">
            <Globe2 className="h-4 w-4 shrink-0 text-[#1A73E8]" />
            <span>Pesquisa Científica Ao Vivo (arXiv + OpenAlex Multilíngue)</span>
          </h3>
          <div className="mt-2 flex flex-wrap gap-2">
            <input
              type="text"
              value={searchQ}
              onChange={(e) => setSearchQ(e.target.value)}
              className="min-w-0 flex-1 rounded-lg border border-[#DADCE0] bg-[#F8F9FA] px-3 py-1.5 text-xs text-[#1F1F1F] focus:border-[#1A73E8] focus:outline-none"
            />
            <button
              type="button"
              onClick={runLiveSearch}
              disabled={searching}
              className="flex items-center gap-1 rounded-full bg-[#1A73E8] px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-[#1557B0]"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{searching ? 'Buscando...' : 'Consultar APIs'}</span>
            </button>
          </div>
          {Object.keys(multilingualTerms).length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Object.entries(multilingualTerms).map(([lang, term]) => (
                <span
                  key={lang}
                  className="rounded-full border border-[#E3E8EF] bg-[#F8F9FA] px-2.5 py-0.5 font-mono text-[10px] text-[#1F1F1F]"
                >
                  <strong className="text-[#1A73E8]">{lang.toUpperCase()}:</strong> {term}
                </span>
              ))}
            </div>
          )}
          <div className="mt-3 max-h-60 space-y-2 overflow-y-auto">
            {references.slice(0, 12).map((ref, idx) => (
              <a
                key={idx}
                href={String(ref.url ?? '#')}
                target="_blank"
                rel="noreferrer"
                className="block rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5 text-xs hover:border-[#1A73E8]"
              >
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#0067B8]">
                  <span>
                    {String(ref.source_type ?? 'ref').toUpperCase()} · {String(ref.language ?? 'en')}
                  </span>
                  <ExternalLink className="h-3 w-3" />
                </div>
                <div className="mt-0.5 break-words font-semibold text-[#1F1F1F]">{String(ref.title)}</div>
                <div className="truncate text-[11px] text-[#444746]">{String(ref.authors)}</div>
              </a>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
          <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#1F1F1F]">
            <BookOpen className="h-4 w-4 shrink-0 text-emerald-700" />
            <span>Livros & Monografias Baixados ({books.length} Obras SHA-256)</span>
          </h3>
          <div className="mt-3 max-h-72 space-y-2 overflow-y-auto">
            {books.map((b, idx) => (
              <div key={idx} className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-3 text-xs">
                <div className="flex flex-wrap items-center justify-between gap-2 font-semibold text-[#1F1F1F]">
                  <span className="min-w-0 break-words">{String(b.title)}</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => void openBook(b)}
                      className="rounded-md bg-[#E8F0FE] px-2 py-0.5 text-[11px] font-semibold text-[#1A73E8] hover:bg-[#D2E3FC]"
                    >
                      Ler
                    </button>
                    <a
                      href={String(b.source_url)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] font-semibold text-[#0067B8] hover:underline"
                    >
                      Fonte
                    </a>
                  </div>
                </div>
                <div className="text-[11px] font-medium text-[#0067B8]">{String(b.author)}</div>
                <p className="mt-1 text-[11px] text-[#444746]">{String(b.excerpt)}</p>
                <div className="mt-1 font-mono text-[10px] text-[#5F6368]">
                  {Math.round(Number(b.bytes_size ?? 0) / 1024)} KB · SHA256: {String(b.sha256_hash ?? '').slice(0, 16)}...
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {bookReader && (
        <div className="rounded-2xl border border-[#1A73E8]/40 bg-[#F8F9FA] p-4 shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-display text-sm font-bold text-[#1F1F1F]">{String(bookReader.title ?? '')}</h4>
              <div className="text-xs text-[#0067B8]">{String(bookReader.author ?? '')}</div>
            </div>
            <button
              type="button"
              onClick={() => setBookReader(null)}
              className="rounded-lg border border-[#DADCE0] bg-white p-1 text-[#444746]"
              aria-label="Fechar prévia do livro"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <pre className="mt-3 max-h-64 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-xl border border-[#E3E8EF] bg-white p-3 font-mono text-[11px] text-[#1F1F1F]">
            {String(bookReader.preview ?? bookReader.excerpt ?? '')}
          </pre>
        </div>
      )}

      {/* Pilares Filosóficos & Cientistas + Trilha 10 + 23 Hilbert + Open Source */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
          <h3 className="font-display text-sm font-bold text-[#1F1F1F]">Pilares Filosóficos & Metodologia Científica</h3>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {Object.values(PILLARS).map((p) => (
              <div key={p.id} className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5 text-[11px]">
                <div className="font-bold" style={{ color: p.color }}>
                  {p.name}
                </div>
                <div className="mt-0.5 text-[#444746]">{p.methodologyRole}</div>
              </div>
            ))}
          </div>
          <h4 className="mt-3 font-display text-xs font-bold text-[#0067B8]">Trilha de Estudo Recomendada (1 → 10)</h4>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {studyPath.map((sp) => (
              <button
                key={sp.id}
                type="button"
                onClick={() => onSelectProblem(sp)}
                className="rounded-full border border-[#DADCE0] bg-[#EBF3FA] px-2.5 py-1 text-[11px] font-medium text-[#004E8C] hover:border-[#0067B8]"
              >
                {sp.studyOrder}. {sp.title}
              </button>
            ))}
          </div>
        </div>

        <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
          <h3 className="font-display text-sm font-bold text-[#1F1F1F]">Ecossistema Open Source & Catálogos Mundiais</h3>
          <div className="mt-2 max-h-56 space-y-1.5 overflow-y-auto text-[11px]">
            {OPEN_SOURCE_STACK.map((o) => (
              <a
                key={o.name}
                href={o.url}
                target="_blank"
                rel="noreferrer"
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E3E8EF] bg-[#F8F9FA] px-2.5 py-1.5 hover:border-[#1A73E8]"
              >
                <span className="min-w-0">
                  <strong className="text-[#1F1F1F]">{o.name}</strong> —{' '}
                  <span className="text-[#444746]">{o.role}</span>
                </span>
                <span className="shrink-0 font-mono text-[10px] font-semibold text-emerald-700">{o.ecosystem}</span>
              </a>
            ))}
            {PUBLIC_RESEARCH_CATALOGS.map((c) => (
              <a
                key={c.name}
                href={c.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 rounded-lg border border-[#E3E8EF] bg-[#F8F9FA] px-2.5 py-1.5 hover:border-[#0067B8]"
              >
                <span className="min-w-0 font-medium text-[#0067B8]">
                  {c.name}: <span className="font-normal text-[#444746]">{c.scope}</span>
                </span>
                <ExternalLink className="h-3 w-3 shrink-0 text-[#5F6368]" />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
        <h3 className="font-display text-sm font-bold text-[#1F1F1F]">
          Os 23 Problemas de Hilbert (1900) — Status Atualizado
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {HILBERT_23_PROBLEMS.map((h) => (
            <div key={h.number} className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5 text-[11px]">
              <div className="flex justify-between gap-2">
                <span className="font-mono font-bold text-[#0067B8]">Hilbert #{h.number}</span>
                <span className="font-semibold text-[#1A73E8]">{h.status}</span>
              </div>
              <div className="mt-0.5 font-semibold text-[#1F1F1F]">{h.title}</div>
              <div className="text-[#444746]">{h.summary}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
        <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#444746]">
          Referências Metodológicas Históricas
        </h3>
        <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {METHODOLOGY_SCIENTISTS.map((s) => (
            <div key={s.name} className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5 text-[11px]">
              <div className="font-bold text-[#0067B8]">{s.name}</div>
              <div className="mt-0.5 text-[#444746]">{s.contribution}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
