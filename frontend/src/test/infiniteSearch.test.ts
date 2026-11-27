import { describe, expect, it } from 'vitest'
import { ALL_PROBLEMS } from '../domain/problemsCatalog'
import { stepAutonomousSearch } from '../engines/infiniteSearchEngine'
import type { SearchState, SearchStrategy } from '../domain/types'

describe('Autonomous Time-Sliced Search Engine', () => {
  it('runs all 5 search strategies across representative categories without NaNs', () => {
    const strategies: SearchStrategy[] = [
      'quantum-inspired',
      'adaptive-refinement',
      'annealing',
      'monte-carlo',
      'grid-sweep',
    ]
    const samples = [
      ALL_PROBLEMS[0],
      ALL_PROBLEMS[7],
      ALL_PROBLEMS[15],
      ALL_PROBLEMS[40],
      ALL_PROBLEMS[70],
    ]

    for (const prob of samples) {
      for (const strategy of strategies) {
        let state: SearchState = {
          running: true,
          strategy,
          iterations: 0,
          ratePerSec: 0,
          bestResidual: Infinity,
          bestCoherence: 0.5,
          bestParams: { ...prob.defaultParams },
          residualHistory: [],
          hits: [],
        }
        state = stepAutonomousSearch(prob, state, 0.4, 'eco', 'cartesian_3d', 8)
        expect(state.iterations).toBeGreaterThan(0)
        expect(Number.isFinite(state.bestResidual)).toBe(true)
        expect(state.hits.length).toBeGreaterThan(0)
      }
    }
  })
})
