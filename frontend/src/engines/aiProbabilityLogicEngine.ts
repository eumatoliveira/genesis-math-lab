import type { HardwareProfile, ProblemSpec, ProjectionMode, SimulationFrame } from '../domain/types'
import { applyProjection3D, clamp, extractHotspotsFromHeights, finiteParam, finiteTime, gridSizeForProfile, heatColorRGB, mulberry32 } from './mathUtils'

export function computeAiLossFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  const n = Math.min(26, gridSizeForProfile(profile))
  const scale = finiteParam(params.scale, 1.5, 0.2, 5.0)
  const lr = finiteParam(params.lr, 0.15, 0.01, 1.5)
  const positions = new Float32Array(n * n * 3)
  const colors = new Float32Array(n * n * 3)
  const heights = new Float32Array(n * n)
  const xs = new Float32Array(n * n)
  const zs = new Float32Array(n * n)
  const doubleDescent2D: Array<[number, number]> = []

  const lossAt = (x: number, z: number) =>
    0.45 * (x * x - 2.2) ** 2 * 0.28 + 0.65 * Math.sin(x * 1.4 * scale) * Math.cos(z * 1.4) + 0.18 * (z * z)

  let idx = 0
  for (let i = 0; i < n; i++) {
    const x = -3.6 + (7.2 * i) / (n - 1)
    for (let j = 0; j < n; j++) {
      const z = -3.6 + (7.2 * j) / (n - 1)
      const y = clamp(lossAt(x, z) - 0.5, -2.0, 2.8)
      heights[idx] = y
      xs[idx] = x
      zs[idx] = z
      const [px, py, pz] = applyProjection3D(x, y, z, projection)
      positions[idx * 3] = px
      positions[idx * 3 + 1] = py
      positions[idx * 3 + 2] = pz
      const [cr, cg, cb] = heatColorRGB(clamp((y + 1.5) / 3.5, 0, 1))
      colors[idx * 3] = cr
      colors[idx * 3 + 1] = cg
      colors[idx * 3 + 2] = cb
      idx++
    }
  }

  // Optimizer race markers: SGD vs Momentum/Adam
  const tPhase = (tSafe * lr * 6) % 4.0
  const sgdX = -2.2 * Math.exp(-0.4 * tPhase) * Math.cos(tPhase * 1.5)
  const sgdZ = 1.8 * Math.exp(-0.35 * tPhase)
  const adamX = -2.2 * Math.exp(-0.85 * tPhase)
  const adamZ = 1.8 * Math.exp(-0.9 * tPhase)

  for (let k = 1; k <= 36; k++) {
    const ratio = k / 18 // P/N ratio crossing 1.0 interpolation threshold
    const err = 0.25 + 1.45 * Math.exp(-Math.pow((ratio - 1.0) * 4.5, 2)) + 0.35 / (0.6 + ratio)
    doubleDescent2D.push([Number(ratio.toFixed(2)), Number(err.toFixed(4))])
  }

  return {
    surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.54, solidOpacity: 0.72 },
    markers: [
      { position: applyProjection3D(sgdX, lossAt(sgdX, sgdZ) - 0.4, sgdZ, projection), color: '#fb7185', radius: 0.16, pulse: true, label: 'SGD' },
      { position: applyProjection3D(adamX, lossAt(adamX, adamZ) - 0.4, adamZ, projection), color: '#34d399', radius: 0.18, pulse: true, label: 'Adam' },
    ],
    adaptiveHotspots: extractHotspotsFromHeights(heights, n, n, xs, zs, 4),
    chart2D: {
      title: problem.variant === 'double-descent' ? 'Curva Double Descent (Pico P/N = 1.0)' : 'Paisagem de Perda Não-Convexa & Otimizadores',
      xLabel: 'Razão P/N ou Passo',
      yLabel: 'Risco Teste',
      mode: 'line',
      series: [{ label: 'Erro Generalização', color: '#f5b942', points: doubleDescent2D }],
    },
    fieldCoupling: { frequency: 2.0, amplitude: 1.2, coherence: 0.8, phaseShift: tSafe, focalPoints: [[adamX, 0, adamZ]] },
    metrics: [
      { label: 'Loss SGD', value: lossAt(sgdX, sgdZ).toFixed(3), accent: 'rose' },
      { label: 'Loss Adam', value: lossAt(adamX, adamZ).toFixed(3), accent: 'emerald' },
    ],
    residual: Math.max(0, lossAt(adamX, adamZ)),
    candidateSummary: `Corrida SGD vs Adam sobre pontos de sela (Adam loss=${lossAt(adamX, adamZ).toFixed(3)}).`,
  }
}

export function computeProbabilityAndLogicFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  if (problem.engine === 'logic-bb') {
    const states = Math.round(finiteParam(params.states, 4, 2, 8))
    const steps = Math.round(finiteParam(params.steps, 80, 10, 120))
    const tapeWidth = 36
    const grid = new Float32Array(tapeWidth * 3)
    const pts: number[] = []
    const cols: number[] = []

    // Deterministic Busy-Beaver-like 4-state halting Turing tape spacetime evolution
    const tape = new Uint8Array(tapeWidth)
    let head = Math.floor(tapeWidth / 2)
    let state = 0
    let onesCount = 0
    const histSeries: Array<[number, number]> = []

    for (let step = 0; step < steps; step++) {
      const sym = tape[head]
      // Chaotic deterministic rule parameterized by states
      const nextSym = (sym ^ ((state + step) % 2)) as 0 | 1
      tape[head] = nextSym
      const move = ((state + sym) % 2 === 0 ? 1 : -1)
      head = (head + move + tapeWidth) % tapeWidth
      state = (state + 1 + sym) % states
      onesCount = tape.reduce((acc, v) => acc + v, 0)
      if (step % 2 === 0) {
        for (let xIdx = 0; xIdx < tapeWidth; xIdx++) {
          if (tape[xIdx] === 1) {
            const [px, py, pz] = applyProjection3D((xIdx / tapeWidth) * 7 - 3.5, (step / steps) * 3.2 - 1.4, (state - 1.5) * 0.7, projection)
            pts.push(px, py, pz)
            const [cr, cg, cb] = heatColorRGB(state / Math.max(1, states - 1))
            cols.push(cr, cg, cb)
          }
        }
        histSeries.push([step, onesCount])
      }
    }
    void grid
    return {
      particles: { positions: new Float32Array(pts), colors: new Float32Array(cols), count: Math.floor(pts.length / 3) },
      chart2D: {
        title: problem.id === 'decidability-limits' ? 'Fita Espaço-Temporal Busy Beaver (BB(5)=47,176,870 Coq)' : `${problem.title} — Hierarquia Lógica`,
        xLabel: 'Passo t',
        yLabel: 'Símbolos 1 na Fita',
        mode: 'line',
        series: [{ label: 'Σ(t)', color: '#a78bfa', points: histSeries }],
      },
      fieldCoupling: { frequency: 1.5, amplitude: 1.15, coherence: 0.75, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
      metrics: [
        { label: 'Estados', value: String(states), accent: 'violet' },
        { label: '1s na Fita', value: String(onesCount), accent: 'gold' },
        { label: 'Status Lógico', value: problem.status, accent: 'cyan' },
      ],
      residual: 1 / Math.max(1, onesCount),
      candidateSummary: `Simulação discreta (${states} estados, ${steps} passos): ${onesCount} símbolos ativos na fita.`,
    }
  }

  // Probability: KPZ, Critical Percolation, SAW, RMT GUE, Bourgain Slicing
  const maxLattice = profile === 'eco' ? 18 : 26
  const latticeN = Math.round(finiteParam(params.latticeSize, 24, 4, maxLattice))
  const pCrit = finiteParam(params.pControl, 0.5927, 0.05, 0.99)
  const rng = mulberry32(Math.round(pCrit * 10000) + latticeN * 7)
  const pts: number[] = []
  const cols: number[] = []
  let activeSites = 0

  for (let i = 0; i < latticeN; i++) {
    for (let j = 0; j < latticeN; j++) {
      if (rng() < pCrit) {
        activeSites++
        const x = (i / (latticeN - 1)) * 7 - 3.5
        const z = (j / (latticeN - 1)) * 7 - 3.5
        const y = 0.45 * Math.sin((i + j) * 0.35 + tSafe) + (i === 0 || j === 0 ? 0.35 : 0)
        const [px, py, pz] = applyProjection3D(x, y, z, projection)
        pts.push(px, py, pz)
        const [cr, cg, cb] = heatColorRGB(clamp(pCrit, 0, 1))
        cols.push(cr, cg, cb)
      }
    }
  }

  // Wigner surmise curve / KPZ roughness reference
  const curve2D: Array<[number, number]> = Array.from({ length: 30 }, (_, k) => {
    const s = (k + 1) * 0.1
    const wigner = ((32 / (Math.PI * Math.PI)) * s * s * Math.exp((-4 * s * s) / Math.PI))
    return [Number(s.toFixed(2)), Number(wigner.toFixed(4))]
  })

  return {
    particles: { positions: new Float32Array(pts), colors: new Float32Array(cols), count: activeSites },
    chart2D: {
      title: `${problem.title} — Distribuição Crítica (p=${pCrit.toFixed(3)})`,
      xLabel: 'Escala s',
      yLabel: 'Densidade P(s)',
      mode: 'line',
      series: [{ label: 'Curva Universal', color: '#38e8ff', points: curve2D }],
    },
    fieldCoupling: { frequency: 2.0, amplitude: 1.25, coherence: clamp(1 - Math.abs(pCrit - 0.5927) * 2, 0.25, 0.96), phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
    metrics: [
      { label: 'Sítios Ativos', value: `${activeSites}/${latticeN * latticeN}`, accent: 'cyan' },
      { label: 'Parâmetro p', value: pCrit.toFixed(3), accent: 'gold' },
    ],
    residual: Math.abs(pCrit - 0.5927),
    candidateSummary: `Malha estocástica ${latticeN}×${latticeN} com ocupação ${(activeSites / (latticeN * latticeN) * 100).toFixed(1)}%.`,
  }
}
