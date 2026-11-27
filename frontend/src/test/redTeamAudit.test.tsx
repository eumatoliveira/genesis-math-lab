import '@testing-library/jest-dom/vitest'
import { render } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import * as THREE from 'three'
import { ALL_PROBLEMS, getProblemById } from '../domain/problemsCatalog'
import type { SimulationFrame } from '../domain/types'
import { computeSimulationFrame } from '../engines'
import { stepAutonomousSearch } from '../engines/infiniteSearchEngine'
import { clamp, sievePrimes } from '../engines/mathUtils'
import { computeCollatzSequence } from '../engines/numberTheoryEngine'
import { evalZetaComplex } from '../engines/zetaAndSacredEngine'
import { Oscilloscope2D } from '../visualizers/Oscilloscope2D'
import { SimulationMeshRenderer } from '../visualizers/SimulationMeshRenderer'

describe('GENESIS Scientific Red-Team & Memory Safety Audit', () => {
  it('enforces epistemological honesty across all 113+ catalog problems (no open conjecture marked solved, no fake %)', () => {
    const forbiddenOpenTiers = new Set([
      'Demonstração Formalmente Verificada',
      'Demonstração Candidata',
      'Lema Demonstrado',
    ])

    for (const prob of ALL_PROBLEMS) {
      if (prob.status === 'Em aberto') {
        expect(forbiddenOpenTiers.has(prob.formalTier)).toBe(false)
      }
      expect(prob.title).not.toMatch(/\d+%\s*(to|até|para)\s*(solu|proof|prova)/i)
      expect(prob.statusDetail).not.toMatch(/\d+%\s*(to|até|para)\s*(solu|proof|prova)/i)
    }

    expect(getProblemById('langlands-program').formalTier).toBe('Resultado Parcial')
    expect(getProblemById('kaplansky-conjectures').formalTier).toBe('Contraexemplo Verificado')
  })

  it('sanitizes non-finite mathematical inputs without NaN loops or OOM', () => {
    expect(clamp(Number.NaN, 0.25, 1.0)).toBe(0.25)
    expect(clamp(Number.POSITIVE_INFINITY, -1, 1)).toBe(0)
    expect(sievePrimes(Number.NaN)).toEqual([])
    expect(sievePrimes(-5)).toEqual([])

    const collatzNan = computeCollatzSequence(Number.NaN)
    expect(collatzNan.startN).toBe(1)
    expect(collatzNan.steps).toBe(0)
    expect(collatzNan.finalValue).toBe(1)

    const zetaNan = evalZetaComplex(Number.NaN, Number.POSITIVE_INFINITY)
    expect(zetaNan).toEqual({ re: 0, im: 0, mag: 0 })
  })

  it('keeps frontend autonomous search strictly bounded by maxBatch', () => {
    const prob = getProblemById('collatz')
    const res = stepAutonomousSearch(
      prob,
      {
        running: true,
        strategy: 'quantum-inspired',
        iterations: 0,
        ratePerSec: 0,
        bestResidual: Number.POSITIVE_INFINITY,
        bestCoherence: 0.5,
        bestParams: { ...prob.defaultParams },
        residualHistory: [],
        hits: [],
      },
      0.5,
      'eco',
      'cartesian_3d',
      1000,
    )
    expect(res.iterations).toBeLessThanOrEqual(6)
    expect(Number.isFinite(res.bestResidual)).toBe(true)
  })

  it('disposes Three.js BufferGeometries and LineBasicMaterials on unmount and sanitizes NaN/Infinity coordinates', () => {
    const geoDisposeSpy = vi.spyOn(THREE.BufferGeometry.prototype, 'dispose')
    const matDisposeSpy = vi.spyOn(THREE.LineBasicMaterial.prototype, 'dispose')

    const dirtyFrame: SimulationFrame = {
      surface: {
        cols: 2,
        rows: 2,
        positions: new Float32Array([
          0, Number.NaN, 0,
          1, Number.POSITIVE_INFINITY, 0,
          0, 0, 1,
          1, Number.NEGATIVE_INFINITY, 1,
        ]),
        colors: new Float32Array([
          0.2, 0.5, 0.8,
          0.2, 0.5, 0.8,
          0.2, 0.5, 0.8,
          0.2, 0.5, 0.8,
        ]),
      },
      particles: {
        count: 2,
        positions: new Float32Array([0, Number.NaN, 0, 1, 2, 3]),
        colors: new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6]),
      },
      curves: [
        {
          points: new Float32Array([0, 0, 0, 1, Number.NaN, 1]),
          color: '#38e8ff',
          opacity: 0.8,
        },
      ],
      markers: [
        {
          position: [Number.NaN, Number.POSITIVE_INFINITY, 1],
          color: '#f5b942',
          radius: Number.NaN,
        },
      ],
      chart2D: {
        title: 'Sanitized Chart',
        xLabel: 'x',
        yLabel: 'y',
        mode: 'line',
        series: [
          {
            label: 'S',
            color: '#38e8ff',
            points: [
              [0, Number.NaN],
              [1, 2],
              [2, 3],
            ],
          },
        ],
      },
      fieldCoupling: { frequency: 1.5, amplitude: 1.0, coherence: 0.8, phaseShift: 0, focalPoints: [[0, 0, 0]] },
      metrics: [],
      residual: 0.1,
      candidateSummary: 'test',
    }

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const { unmount } = render(
      <SimulationMeshRenderer frame={dirtyFrame} showSurface showWireframe showParticles />,
    )
    unmount()

    expect(geoDisposeSpy).toHaveBeenCalledTimes(3) // surfaceGeometry, particleGeometry, line geometry
    expect(matDisposeSpy).toHaveBeenCalledTimes(1) // line material

    render(
      <Oscilloscope2D chart={dirtyFrame.chart2D} residualHistory={[Number.POSITIVE_INFINITY, 0.5, 0.2, 0.1]} />,
    )

    geoDisposeSpy.mockRestore()
    matDisposeSpy.mockRestore()
    consoleErrorSpy.mockRestore()
  })

  it('prevents NaN leaks and main-thread/OOM freezes on extreme or NaN parameters across engines', () => {
    const seen = new Set<string>()
    for (const prob of ALL_PROBLEMS) {
      const key = `${prob.engine}:${prob.variant}`
      if (seen.has(key)) continue
      seen.add(key)

      const nanParams = Object.fromEntries(Object.keys(prob.defaultParams).map((k) => [k, Number.NaN]))
      const fNan = computeSimulationFrame(prob, nanParams, Number.NaN, 'eco', 'cartesian_3d')
      expect(Number.isFinite(fNan.residual)).toBe(true)
      expect(Number.isFinite(fNan.fieldCoupling.frequency)).toBe(true)
      expect(Number.isFinite(fNan.fieldCoupling.amplitude)).toBe(true)
      expect(Number.isFinite(fNan.fieldCoupling.coherence)).toBe(true)
      for (const s of fNan.chart2D.series) {
        for (const [x, y] of s.points) {
          expect(Number.isFinite(x)).toBe(true)
          expect(Number.isFinite(y)).toBe(true)
        }
      }

      const hugeParams = Object.fromEntries(Object.keys(prob.defaultParams).map((k) => [k, 50_000]))
      const t0 = performance.now()
      const fHuge = computeSimulationFrame(prob, hugeParams, 1.0, 'eco', 'cartesian_3d')
      expect(performance.now() - t0).toBeLessThan(250)
      expect(Number.isFinite(fHuge.residual)).toBe(true)
    }
  })
})
