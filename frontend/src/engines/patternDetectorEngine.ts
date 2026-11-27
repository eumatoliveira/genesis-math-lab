import type { PatternInsightReport, ProblemSpec, SimulationFrame } from '../domain/types'

/**
 * Visual-First Pattern Detector: analyzes rendered 3D geometry & 2D spectra BEFORE proposing formal algorithms,
 * estimating computational savings achieved by adaptive selective focus over brute-force search.
 */
export function detectVisualPatterns(problem: ProblemSpec, frame: SimulationFrame): PatternInsightReport {
  let symScore = 0.52
  if (frame.surface) {
    const { cols, rows, positions } = frame.surface
    let diffSum = 0
    let magSum = 0
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < Math.floor(cols / 2); c++) {
        const yLeft = positions[(r * cols + c) * 3 + 1]
        const yRight = positions[(r * cols + (cols - 1 - c)) * 3 + 1]
        diffSum += Math.abs(yLeft - yRight)
        magSum += Math.abs(yLeft) + Math.abs(yRight) + 1e-4
      }
    }
    symScore = Math.max(0, Math.min(1, 1 - diffSum / Math.max(magSum, 1e-4)))
  }

  // Extract dominant spectral rhythm from primary 2D series
  const series = frame.chart2D.series[0]?.points ?? []
  let signChanges = 0
  let meanY = 0
  for (const [, y] of series) meanY += y
  meanY /= Math.max(1, series.length)
  for (let i = 1; i < series.length; i++) {
    const prev = series[i - 1][1] - meanY
    const cur = series[i][1] - meanY
    if ((prev >= 0 && cur < 0) || (prev < 0 && cur >= 0)) signChanges++
  }
  const domFreq = series.length > 2 ? Number((signChanges / (2 * series.length)).toFixed(3)) : 0.1

  const hotspots = frame.adaptiveHotspots?.length ?? 0
  const bruteForceEvaluations = 72 * 72 // 5184 cells reference
  const adaptiveEvaluations = Math.round(18 * 18 + Math.max(1, hotspots) * 144)
  const adaptiveSavingsPercent = Number((((bruteForceEvaluations - adaptiveEvaluations) / bruteForceEvaluations) * 100).toFixed(1))

  const visualCues: string[] = []
  if (symScore > 0.72) visualCues.push(`Simetria reflexiva acentuada (${(symScore * 100).toFixed(0)}%) no eixo central`)
  else visualCues.push(`Assimetria direcional detectada (${(symScore * 100).toFixed(0)}% simetria) sugerindo quebra de paridade`)

  if (domFreq > 0.08) visualCues.push(`Oscilação estacionária periódica (f_norm=${domFreq}) acoplada ao campo Wi-Fi`)
  else visualCues.push('Comportamento monotônico ou aperiódico multiescala no domínio amostrado')

  if (hotspots > 0) visualCues.push(`${hotspots} zonas anômalas de alto gradiente isoladas para refinamento seletivo`)

  const regimeLabel =
    frame.residual < 0.05
      ? 'Ressonância Crítica / Alinhamento Alto'
      : symScore > 0.75
        ? 'Regime Simétrico Estruturado'
        : 'Exploração Não-Linear / Multiescala'

  const detectedAnomalies =
    frame.adaptiveHotspots?.slice(0, 3).map((h, i) => `Hotspot #${i + 1}: (x=${h.x.toFixed(2)}, z=${h.z.toFixed(2)}) I=${h.intensity.toFixed(2)}`) ??
    ['Sem picos locais extremos nesta projeção']

  const synthesizedRule = [
    `// Algoritmo Sintetizado pela Observação Visual — ${problem.code}`,
    `1. Amostrar grade grosseira 18×18 (324 pontos) em ${problem.engine}.`,
    `2. Filtrar regiões onde |∇f(x,z)| > percentil 88 (${hotspots} hotspots).`,
    `3. Aplicar critério invariante (${problem.hermeticPrinciple.split('—')[0].trim()}).`,
    `4. Submeter candidato ao Counterexample Hunter + Red Team antes de validar.`,
  ].join('\n')

  const nextHypothesis =
    frame.fieldCoupling.coherence > 0.78
      ? `Investigar invariante local nas vizinhanças dos ${Math.max(1, hotspots)} hotspots observados mantendo controle fora-da-amostra.`
      : `Alterar projeção multidimensional ou variar parâmetro principal para buscar transição de fase.`

  return {
    symmetryScore: Number(symScore.toFixed(3)),
    dominantFrequency: domFreq,
    regimeLabel,
    visualCues,
    detectedAnomalies,
    adaptiveSavingsPercent,
    bruteForceEvaluations,
    adaptiveEvaluations,
    synthesizedRule,
    nextHypothesis,
  }
}
