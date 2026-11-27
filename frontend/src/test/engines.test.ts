import { describe, expect, it } from 'vitest'
import { ALL_PROBLEMS, getProblemById } from '../domain/problemsCatalog'
import { computeSimulationFrame } from '../engines'
import { computeCollatzSequence, computeGoldbachDecompositions } from '../engines/numberTheoryEngine'
import { sievePrimes } from '../engines/mathUtils'
import { evalZetaComplex } from '../engines/zetaAndSacredEngine'

describe('GENESIS Simulation Engines Mathematical Rigor', () => {
  it('computes Collatz(27) with exact 111 steps and peak 9232', () => {
    const res = computeCollatzSequence(27)
    expect(res.steps).toBe(111)
    expect(res.maxValue).toBe(9232)
    expect(res.finalValue).toBe(1)
    expect(res.sequence.slice(0, 5)).toEqual([27, 82, 41, 124, 62])
  })

  it('evaluates Riemann zeta near zero at 0.5 + 14.134725i', () => {
    const z = evalZetaComplex(0.5, 14.134725, 60)
    expect(z.mag).toBeLessThan(0.05)
  })

  it('computes exact Goldbach prime decompositions for even integers', () => {
    const primes = sievePrimes(250)
    const pset = new Set(primes)
    const pairs100 = computeGoldbachDecompositions(100, pset, primes)
    expect(pairs100.length).toBeGreaterThanOrEqual(6)
    expect(pairs100.every(([p, q]) => p + q === 100)).toBe(true)
  })

  it('produces finite, valid 3D geometry and 2D charts across EVERY cataloged problem', () => {
    for (const prob of ALL_PROBLEMS) {
      const frame = computeSimulationFrame(prob, prob.defaultParams, 0.75, 'eco', 'cartesian_3d')
      expect(frame.chart2D.series.length).toBeGreaterThan(0)
      expect(Number.isFinite(frame.residual)).toBe(true)
      expect(Number.isFinite(frame.fieldCoupling.coherence)).toBe(true)

      if (frame.surface) {
        for (let i = 0; i < frame.surface.positions.length; i++) {
          expect(Number.isFinite(frame.surface.positions[i])).toBe(true)
        }
      }
      if (frame.particles) {
        for (let i = 0; i < frame.particles.positions.length; i++) {
          expect(Number.isFinite(frame.particles.positions[i])).toBe(true)
        }
      }
    }
  })

  it('supports stereographic 4D->3D projection cleanly', () => {
    const riemann = getProblemById('riemann-hypothesis')
    const frame = computeSimulationFrame(riemann, riemann.defaultParams, 1.0, 'eco', 'stereographic_4d')
    expect(frame.surface?.positions.length).toBeGreaterThan(0)
  })
})
