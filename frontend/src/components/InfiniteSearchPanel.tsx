import { Atom, Pause, Play, RotateCcw, Sparkles, Zap } from 'lucide-react'
import type { SearchState, SearchStrategy } from '../domain/types'

interface Props {
  searchState: SearchState
  onToggleRun: () => void
  onReset: () => void
  onChangeStrategy: (s: SearchStrategy) => void
  onReplayHit: (params: Record<string, number>) => void
  onRunBackendCycle: () => void
  runningBackendCycle: boolean
}

const STRATEGIES: Array<{ id: SearchStrategy; label: string }> = [
  { id: 'quantum-inspired', label: 'Quântico-Inspirado (Tunelamento)' },
  { id: 'adaptive-refinement', label: 'Refinamento Adaptativo Visual' },
  { id: 'annealing', label: 'Simulated Annealing' },
  { id: 'monte-carlo', label: 'Monte Carlo' },
  { id: 'grid-sweep', label: 'Varredura Sistemática' },
]

export function InfiniteSearchPanel({
  searchState,
  onToggleRun,
  onReset,
  onChangeStrategy,
  onReplayHit,
  onRunBackendCycle,
  runningBackendCycle,
}: Props) {
  return (
    <div className="min-w-0 space-y-3 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0067B8]">
          <Atom className="h-4 w-4" />
          <span>Busca Científica Contínua & Ciclos de Descoberta</span>
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={onToggleRun}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold text-white ${
              searchState.running
                ? 'bg-rose-600 hover:bg-rose-700'
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            {searchState.running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            <span>{searchState.running ? 'Pausar Loop' : 'Busca Contínua'}</span>
          </button>

          <button
            type="button"
            onClick={onRunBackendCycle}
            disabled={runningBackendCycle}
            className="flex items-center gap-1 rounded-full bg-[#1A73E8] px-3 py-1 text-xs font-semibold text-white hover:bg-[#1557B0] disabled:opacity-50"
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{runningBackendCycle ? 'Orquestrando 17 Agentes...' : 'Ciclo Completo (Python)'}</span>
          </button>

          <button
            type="button"
            onClick={onReset}
            className="rounded-full border border-[#DADCE0] bg-[#F8F9FA] p-1.5 text-[#444746] hover:text-[#1F1F1F]"
            aria-label="Reiniciar busca"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
          <div className="text-[10px] font-medium text-[#444746]">Estratégia Ativa</div>
          <select
            aria-label="Estratégia de busca contínua"
            value={searchState.strategy}
            onChange={(e) => onChangeStrategy(e.target.value as SearchStrategy)}
            className="mt-1 w-full rounded border border-[#DADCE0] bg-white px-2 py-1 text-[11px] text-[#1F1F1F] focus:border-[#1A73E8] focus:outline-none"
          >
            {STRATEGIES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>

        <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
          <div className="text-[10px] font-medium text-[#444746]">Iterações Executadas</div>
          <div className="mt-1 font-mono text-sm font-bold text-[#0067B8]">
            {searchState.iterations.toLocaleString('pt-BR')}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
          <div className="text-[10px] font-medium text-[#444746]">Menor Resíduo</div>
          <div className="mt-1 font-mono text-sm font-bold text-amber-700">
            {Number.isFinite(searchState.bestResidual) ? searchState.bestResidual.toExponential(3) : '—'}
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
          <div className="text-[10px] font-medium text-[#444746]">Coerência Máxima</div>
          <div className="mt-1 font-mono text-sm font-bold text-emerald-700">
            {(searchState.bestCoherence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {searchState.hits.length > 0 && (
        <div>
          <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-amber-800">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Marcos & Melhores Candidatos Descobertos (Clique para Carregar no 3D)</span>
          </div>
          <div className="flex max-h-28 flex-col gap-1 overflow-y-auto">
            {searchState.hits.slice(0, 6).map((hit, idx) => (
              <button
                key={`${hit.iteration}-${idx}`}
                type="button"
                onClick={() => onReplayHit(hit.params)}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#E3E8EF] bg-[#F8F9FA] px-2.5 py-1.5 text-left font-mono text-[10px] hover:border-[#1A73E8]"
              >
                <span className="text-[#1F1F1F]">
                  <strong className="text-[#0067B8]">#{hit.iteration}</strong> · {hit.strategy} · resíduo{' '}
                  {hit.residual.toExponential(2)}
                </span>
                <span className="text-emerald-700">coerência {(hit.coherence * 100).toFixed(1)}%</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
