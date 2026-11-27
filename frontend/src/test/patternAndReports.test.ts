import { describe, expect, it } from 'vitest'
import { buildMarkdownReport, buildPdfReportBlob } from '../adapters/reportExporter'
import { ALL_PROBLEMS, getProblemById } from '../domain/problemsCatalog'
import { computeSimulationFrame } from '../engines'
import { detectVisualPatterns } from '../engines/patternDetectorEngine'

describe('Visual-First Pattern Detection & Report Exporters', () => {
  it('computes adaptive savings and visual cues for flagship problems', () => {
    for (const id of ['genesis-wave', 'riemann-hypothesis', 'collatz', 'navier-stokes', 'perfect-cuboid']) {
      const prob = getProblemById(id)
      const frame = computeSimulationFrame(prob, prob.defaultParams, 0.5, 'eco', 'cartesian_3d')
      const insights = detectVisualPatterns(prob, frame)
      expect(insights.adaptiveSavingsPercent).toBeGreaterThan(50)
      expect(insights.visualCues.length).toBeGreaterThan(0)
      expect(insights.synthesizedRule).toContain(prob.code)
    }
  })

  it('generates structured Markdown and valid PDF blobs from visual state', async () => {
    const prob = ALL_PROBLEMS[0]
    const frame = computeSimulationFrame(prob, prob.defaultParams, 0.2, 'eco', 'cartesian_3d')
    const insights = detectVisualPatterns(prob, frame)
    const searchState = {
      running: false,
      strategy: 'quantum-inspired' as const,
      iterations: 15,
      ratePerSec: 120,
      bestResidual: 0.012,
      bestCoherence: 0.91,
      bestParams: prob.defaultParams,
      residualHistory: [0.2, 0.08, 0.012],
      hits: [],
    }
    const md = buildMarkdownReport({
      problem: prob,
      params: prob.defaultParams,
      frame,
      insights,
      searchState,
      userNotes: 'Teste visual aprovado.',
    })
    expect(md).toContain(prob.title)
    expect(md).toContain('Separação Epistemológica')

    const pdfBlob = buildPdfReportBlob({
      problem: prob,
      params: prob.defaultParams,
      frame,
      insights,
      searchState,
      userNotes: 'Teste PDF.',
    })
    const header = await pdfBlob.slice(0, 5).text()
    expect(header).toBe('%PDF-')
  })
})
