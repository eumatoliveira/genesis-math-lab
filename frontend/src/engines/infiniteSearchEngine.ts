import type { DiscoveryHit, HardwareProfile, ProblemSpec, ProjectionMode, SearchState, SearchStrategy } from '../domain/types'
import { computeSimulationFrame } from './index'
import { clamp, finiteTime, mulberry32 } from './mathUtils'

/**
 * Executes a bounded time-sliced batch of adaptive/quantum-inspired/stochastic experiments
 * within a <= 6ms frame budget so a conventional home PC stays responsive at 60 FPS.
 */
export function stepAutonomousSearch(
  problem: ProblemSpec,
  currentState: SearchState,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
  budgetMs = 5.5,
): SearchState {
  if (!currentState.running) return currentState

  const tSafe = finiteTime(time)
  const startMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
  const maxBatch = profile === 'eco' ? 6 : profile === 'ultra' ? 20 : 12

  let iterations = currentState.iterations
  let bestResidual = Number.isFinite(currentState.bestResidual) ? currentState.bestResidual : Infinity
  let bestCoherence = Number.isFinite(currentState.bestCoherence) ? currentState.bestCoherence : 0.5
  let bestParams = { ...currentState.bestParams }
  const history = [...currentState.residualHistory]
  const hits = [...currentState.hits]
  const rng = mulberry32(iterations + Math.floor(tSafe * 100) + 17)

  const strategy: SearchStrategy = currentState.strategy
  let batchCount = 0

  while (batchCount < maxBatch) {
    const candidate: Record<string, number> = {}
    for (const p of problem.parameters) {
      const span = p.max - p.min
      const base = Number.isFinite(bestParams[p.key]) ? bestParams[p.key] : p.defaultValue
      let nextVal = base
      if (strategy === 'quantum-inspired') {
        // Transverse tunneling jump + phase interference focus
        const temp = Math.max(0.08, Math.exp(-iterations * 0.004))
        const jump = (rng() - 0.5) * span * (0.25 + 0.65 * temp)
        nextVal = base + jump
      } else if (strategy === 'adaptive-refinement') {
        // Focus tightly around current best basin
        nextVal = base + (rng() - 0.5) * span * 0.18
      } else if (strategy === 'annealing') {
        const temp = Math.max(0.05, 1.0 - (iterations % 200) / 200)
        nextVal = base + (rng() - 0.5) * span * 0.45 * temp
      } else if (strategy === 'grid-sweep') {
        const t = ((iterations + batchCount) % 25) / 24
        nextVal = p.min + t * span
      } else {
        nextVal = p.min + rng() * span
      }
      const step = Number.isFinite(p.step) && p.step > 0 ? p.step : 0.01
      const snapped = Math.round(nextVal / step) * step
      candidate[p.key] = Number(clamp(snapped, p.min, p.max).toFixed(4))
    }

    const frame = computeSimulationFrame(problem, candidate, tSafe, 'eco', projection)
    iterations++
    batchCount++

    const r = Number.isFinite(frame.residual) ? frame.residual : 999
    if (r < bestResidual || hits.length === 0) {
      bestResidual = r
      bestCoherence = frame.fieldCoupling.coherence
      bestParams = candidate
      const hit: DiscoveryHit = {
        id: `hit_${iterations}_${Math.round(rng() * 9999)}`,
        iteration: iterations,
        strategy,
        residual: Number(r.toFixed(5)),
        coherence: Number(frame.fieldCoupling.coherence.toFixed(3)),
        params: candidate,
        summary: frame.candidateSummary,
        timestamp: new Date().toLocaleTimeString('pt-BR'),
      }
      hits.unshift(hit)
      if (hits.length > 24) hits.pop()
    }
    history.push(Number(bestResidual.toFixed(5)))
    if (history.length > 60) history.shift()

    const nowMs = typeof performance !== 'undefined' ? performance.now() : Date.now()
    if (nowMs - startMs >= budgetMs) break
  }

  return {
    ...currentState,
    iterations,
    ratePerSec: Math.round(batchCount * 30),
    bestResidual,
    bestCoherence,
    bestParams,
    residualHistory: history,
    hits,
  }
}
