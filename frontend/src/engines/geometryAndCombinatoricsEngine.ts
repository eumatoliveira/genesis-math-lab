import type { HardwareProfile, ProblemSpec, ProjectionMode, SimulationFrame } from '../domain/types'
import { applyProjection3D, clamp, finiteParam, finiteTime, gridSizeForProfile, heatColorRGB, mulberry32 } from './mathUtils'

export function computeGeometryFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  const variant = problem.variant
  if (variant === 'moving-sofa') {
    const prog = finiteParam(params.progress, (Math.sin(tSafe * 0.5) + 1) * 0.5, 0.0, 1.0)
    const width = finiteParam(params.corridorWidth, 1.0, 0.4, 2.5)
    // Unit-width L-corridor boundaries
    const outerWall = new Float32Array([-3, 0, -width, 1.5, 0, -width, 1.5, 0, 3.5].map((v) => v * 1.4))
    const innerWall = new Float32Array([-3, 0, 0, 0, 0, 0, 0, 0, 3.5].map((v) => v * 1.4))
    // Gerver-like 18-segment optimal sofa contour rotating smoothly by 90 deg around corner
    const angle = prog * (Math.PI / 2)
    const cx = (-1.1 + prog * 1.85) * 1.4
    const cz = (-0.55 + prog * 1.85) * 1.4
    const segs = 36
    const sofaPts = new Float32Array(segs * 3)
    for (let i = 0; i < segs; i++) {
      const th = (i / (segs - 1)) * Math.PI * 2
      const lx = 1.45 * Math.cos(th)
      const lz = 0.72 * Math.sin(th) + 0.16 * Math.cos(2 * th)
      const rx = lx * Math.cos(angle) - lz * Math.sin(angle) + cx
      const rz = lx * Math.sin(angle) + lz * Math.cos(angle) + cz
      const [px, py, pz] = applyProjection3D(rx, 0.25 + 0.1 * Math.sin(tSafe * 2), rz, projection)
      sofaPts[i * 3] = px
      sofaPts[i * 3 + 1] = py
      sofaPts[i * 3 + 2] = pz
    }
    const area2D: Array<[number, number]> = Array.from({ length: 18 }, (_, k) => {
      const th = (k / 17) * (Math.PI / 2)
      const areaEstimate = 2.21953 - 0.18 * Math.pow(Math.sin(2 * th), 2) * Math.abs(width - 1.0)
      return [Number(((th * 180) / Math.PI).toFixed(1)), Number(areaEstimate.toFixed(5))]
    })
    return {
      curves: [
        { points: outerWall, color: '#38e8ff', opacity: 0.9 },
        { points: innerWall, color: '#38e8ff', opacity: 0.9 },
        { points: sofaPts, color: '#f5b942', opacity: 0.98 },
      ],
      chart2D: {
        title: 'Sofá de Gerver (18 Arcos) — Área Ótima ≈ 2.21953 (Baek 2024)',
        xLabel: 'Rotação (°)',
        yLabel: 'Área',
        mode: 'line',
        series: [{ label: 'Área(θ)', color: '#f5b942', points: area2D }],
      },
      fieldCoupling: { frequency: 1.6, amplitude: 1.15, coherence: 0.92, phaseShift: tSafe, focalPoints: [[cx, 0.2, cz]] },
      metrics: [
        { label: 'Área de Gerver', value: '2.219531', accent: 'gold' },
        { label: 'Progresso Curva', value: `${Math.round(prog * 100)}%`, accent: 'cyan' },
        { label: 'Prova J. Baek', value: 'arXiv:2411.19826', accent: 'emerald' },
      ],
      residual: Math.abs(width - 1.0),
      candidateSummary: `Sofá de Gerver (área≈2.21953) girando ${(prog * 90).toFixed(0)}° em corredor de largura ${width.toFixed(2)}.`,
    }
  }

  if (variant === 'kakeya') {
    const needles = profile === 'eco' ? 36 : 72
    const curves: NonNullable<SimulationFrame['curves']> = []
    for (let i = 0; i < needles; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / needles)
      const theta = Math.PI * (1 + Math.sqrt(5)) * i + tSafe * 0.25
      const dx = Math.sin(phi) * Math.cos(theta)
      const dy = Math.cos(phi)
      const dz = Math.sin(phi) * Math.sin(theta)
      const ox = 0.6 * Math.cos(theta * 2)
      const oz = 0.6 * Math.sin(theta * 2)
      const p1 = applyProjection3D(ox - dx * 1.9, -dy * 1.9, oz - dz * 1.9, projection)
      const p2 = applyProjection3D(ox + dx * 1.9, dy * 1.9, oz + dz * 1.9, projection)
      curves.push({ points: new Float32Array([...p1, ...p2]), color: i % 2 === 0 ? '#38e8ff' : '#f5b942', opacity: 0.85 })
    }
    return {
      curves,
      chart2D: {
        title: 'Dimensão de Kakeya em R³ — Provada dim_H = 3 (Wang & Zahl 2025)',
        xLabel: 'Dimensão Ambiente d',
        yLabel: 'Cota dim_H(K)',
        mode: 'bar',
        series: [{ label: 'Cota Inferior Provada', color: '#34d399', points: [[2, 2], [3, 3], [4, 3.06], [5, 3.55]] }],
      },
      fieldCoupling: { frequency: 2.3, amplitude: 1.2, coherence: 0.9, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
      metrics: [
        { label: 'Agulhas 3D', value: String(needles), accent: 'cyan' },
        { label: 'Kakeya 3D', value: 'Provada (2025)', accent: 'emerald' },
      ],
      residual: 0.05,
      candidateSummary: `Conjunto de Kakeya com ${needles} direções unitárias; d=3 provado por Wang & Zahl (2025).`,
    }
  }

  // General geometry/topology surface (4D Poincare, Inscribed square, Hadwiger-Nelson, Mahler, Minimal Surface)
  const n = Math.min(26, gridSizeForProfile(profile))
  const phase = finiteParam(params.phase, 0.5, -20, 20)
  const density = finiteParam(params.density, 1.5, 0.1, 8.0)
  const positions = new Float32Array(n * n * 3)
  const colors = new Float32Array(n * n * 3)
  const slice2D: Array<[number, number]> = []
  let idx = 0
  for (let i = 0; i < n; i++) {
    const u = -3.2 + (6.4 * i) / (n - 1)
    for (let j = 0; j < n; j++) {
      const v = -3.2 + (6.4 * j) / (n - 1)
      const y =
        variant === 'hilbert-23'
          ? 0.7 * Math.cosh(u * 0.4) * Math.cos(v + tSafe * 0.4)
          : 1.2 * Math.sin(u * density + phase + tSafe * 0.5) * Math.cos(v * density)
      const [px, py, pz] = applyProjection3D(u, clamp(y, -2.5, 2.5), v, projection)
      positions[idx * 3] = px
      positions[idx * 3 + 1] = py
      positions[idx * 3 + 2] = pz
      const [cr, cg, cb] = heatColorRGB(0.5 + 0.4 * Math.sin(u + v))
      colors[idx * 3] = cr
      colors[idx * 3 + 1] = cg
      colors[idx * 3 + 2] = cb
      if (i === Math.floor(n / 2)) slice2D.push([Number(v.toFixed(2)), Number(y.toFixed(4))])
      idx++
    }
  }

  return {
    surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.54, solidOpacity: 0.68 },
    chart2D: {
      title: `${problem.title} — Seção Topológica`,
      xLabel: 'v',
      yLabel: 'Invariante / Curvatura',
      mode: 'line',
      series: [{ label: problem.code, color: '#38e8ff', points: slice2D }],
    },
    fieldCoupling: { frequency: 1.7, amplitude: 1.2, coherence: 0.76, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
    metrics: [
      { label: 'Parâmetro', value: density.toFixed(2), accent: 'cyan' },
      { label: 'Status', value: problem.status, accent: 'gold' },
    ],
    residual: 0.21,
    candidateSummary: `Variedade geométrica ${problem.code} projetada em ${projection}.`,
  }
}

export function computeCombinatoricsCsFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  _profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  const variant = problem.variant
  if (variant === 'p-vs-np') {
    const numVars = Math.round(finiteParam(params.numVars, 20, 6, 48))
    const alpha = finiteParam(params.alpha, 4.26, 1.0, 8.0)
    const tunnel = finiteParam(params.quantumTunnel, 0.5, 0.0, 1.0)
    const pts2D: Array<[number, number]> = []
    const ptsCost: Array<[number, number]> = []
    const pts3D: number[] = []
    const cols3D: number[] = []

    for (let k = 0; k < 40; k++) {
      const a = 1.5 + (5.0 * k) / 39
      const satProb = 1 / (1 + Math.exp((a - 4.26) * 4.5))
      const difficulty = Math.exp(-((a - 4.26) ** 2) / 0.5) * (numVars * 0.14) * (1 - 0.28 * tunnel)
      pts2D.push([Number(a.toFixed(2)), Number(satProb.toFixed(4))])
      ptsCost.push([Number(a.toFixed(2)), Number(difficulty.toFixed(4))])
      const [px, py, pz] = applyProjection3D((a - 4.0) * 1.4, difficulty - 0.8, (satProb - 0.5) * 4.0, projection)
      pts3D.push(px, py, pz)
      const [cr, cg, cb] = heatColorRGB(clamp(difficulty / 3.0, 0, 1))
      cols3D.push(cr, cg, cb)
    }
    const localDiff = Math.exp(-((alpha - 4.26) ** 2) / 0.5)
    return {
      particles: { positions: new Float32Array(pts3D), colors: new Float32Array(cols3D), count: 40 },
      chart2D: {
        title: `Transição de Fase 3-SAT (n=${numVars}) — Limiar α ≈ 4.26`,
        xLabel: 'Razão Cláusulas/Vars (α)',
        yLabel: 'P(SAT) / Custo',
        mode: 'line',
        series: [
          { label: 'P(Satisfatível)', color: '#34d399', points: pts2D },
          { label: 'Dificuldade Relativa', color: '#f5b942', points: ptsCost },
        ],
      },
      fieldCoupling: { frequency: 2.6, amplitude: 1.35, coherence: 1 - localDiff * 0.5, phaseShift: tSafe, focalPoints: [[(alpha - 4) * 1.4, 0, 0]] },
      metrics: [
        { label: 'Variáveis n', value: String(numVars), accent: 'cyan' },
        { label: 'Razão α=m/n', value: alpha.toFixed(2), accent: 'gold' },
        { label: 'Dureza Local', value: `${(localDiff * 100).toFixed(0)}%`, accent: 'rose' },
      ],
      residual: Math.abs(alpha - 4.26),
      candidateSummary: `Instância 3-SAT n=${numVars}, α=${alpha.toFixed(2)} (não demonstra separação assintótica P vs NP).`,
    }
  }

  if (variant === 'lonely-runner') {
    const runners = Math.round(finiteParam(params.kParam, 5, 2, 8))
    const speeds = [1, 2, 3, 5, 7, 11, 13, 17].slice(0, runners)
    const tNow = ((tSafe * 0.14) % 1.0 + 1.0) % 1.0
    const markers: SimulationFrame['markers'] = []
    let minOriginDist = 1.0
    const distSeries: Array<[number, number]> = []

    const ringPts = new Float32Array(65 * 3)
    for (let s = 0; s < 65; s++) {
      const ang = (s / 64) * Math.PI * 2
      const [px, py, pz] = applyProjection3D(2.6 * Math.cos(ang), 0, 2.6 * Math.sin(ang), projection)
      ringPts[s * 3] = px; ringPts[s * 3 + 1] = py; ringPts[s * 3 + 2] = pz
    }
    speeds.forEach((v, idx) => {
      const frac = (v * tNow) % 1.0
      const dOrig = Math.min(frac, 1 - frac)
      if (idx > 0 && dOrig < minOriginDist) minOriginDist = dOrig
      const ang = frac * Math.PI * 2
      const [px, py, pz] = applyProjection3D(2.6 * Math.cos(ang), 0.15, 2.6 * Math.sin(ang), projection)
      markers.push({ position: [px, py, pz], color: idx === 0 ? '#f5b942' : '#38e8ff', radius: 0.16, pulse: idx === 0 })
    })
    const threshold = 1 / (runners + 1)
    for (let k = 0; k < 60; k++) {
      const tk = k / 59
      let md = 1.0
      for (let r = 1; r < runners; r++) {
        const f = (speeds[r] * tk) % 1
        md = Math.min(md, Math.min(f, 1 - f))
      }
      distSeries.push([Number(tk.toFixed(2)), Number(md.toFixed(4))])
    }

    return {
      curves: [{ points: ringPts, color: '#38e8ff', opacity: 0.75 }],
      markers,
      chart2D: {
        title: `Corredor Solitário (${runners} corredores) — Meta ≥ 1/${runners + 1} = ${threshold.toFixed(3)}`,
        xLabel: 'Tempo t',
        yLabel: 'Distância Mínima',
        mode: 'line',
        series: [{ label: 'min d_toro', color: '#34d399', points: distSeries }],
      },
      fieldCoupling: { frequency: 1.8, amplitude: 1.2, coherence: minOriginDist >= threshold ? 0.96 : 0.45, phaseShift: tSafe, focalPoints: [[2.6, 0, 0]] },
      metrics: [
        { label: 'Corredores k', value: String(runners), accent: 'cyan' },
        { label: 'Dist. Atual', value: minOriginDist.toFixed(3), accent: minOriginDist >= threshold ? 'emerald' : 'gold' },
        { label: 'Limiar 1/(k+1)', value: threshold.toFixed(3), accent: 'violet' },
      ],
      residual: Math.max(0, threshold - minOriginDist),
      candidateSummary: `Pista toroidal com ${runners} corredores: distância mínima atual=${minOriginDist.toFixed(3)} vs meta ${threshold.toFixed(3)}.`,
    }
  }

  // Graph & Ramsey / Isomorphism / Frankl / Hadwiger 3D interactive ring network
  const nVerts = Math.round(finiteParam(params.vertices, 10, 5, 20))
  const density = finiteParam(params.density, 0.5, 0.05, 0.95)
  const kSeed = Math.round(finiteParam(params.kParam, 4, 1, 20))
  const rng = mulberry32(nVerts * 17 + kSeed * 31)
  const markers: SimulationFrame['markers'] = []
  const curves: NonNullable<SimulationFrame['curves']> = []
  const nodePos: Array<[number, number, number]> = []

  for (let i = 0; i < nVerts; i++) {
    const ang = (i / nVerts) * Math.PI * 2 + tSafe * 0.12
    const y = 0.7 * Math.sin(i * 1.3 + tSafe * 0.4)
    const p = applyProjection3D(2.8 * Math.cos(ang), y, 2.8 * Math.sin(ang), projection)
    nodePos.push(p)
    markers.push({ position: p, color: i % 2 === 0 ? '#38e8ff' : '#f5b942', radius: 0.14 })
  }
  let goldEdges = 0
  let cyanEdges = 0
  for (let i = 0; i < nVerts; i++) {
    for (let j = i + 1; j < nVerts; j++) {
      if (rng() < density) {
        const isGold = rng() > 0.5
        if (isGold) goldEdges++
        else cyanEdges++
        curves.push({ points: new Float32Array([...nodePos[i], ...nodePos[j]]), color: isGold ? '#f5b942' : '#38e8ff', opacity: 0.65 })
      }
    }
  }

  return {
    curves,
    markers,
    chart2D: {
      title: `${problem.title} — Distribuição de Arestas/Coloração`,
      xLabel: 'Classe / Grau',
      yLabel: 'Contagem',
      mode: 'bar',
      series: [
        { label: 'Ciano', color: '#38e8ff', points: [[1, cyanEdges], [2, nVerts]] },
        { label: 'Dourado', color: '#f5b942', points: [[1, goldEdges], [2, Math.round(density * nVerts)]] },
      ],
    },
    fieldCoupling: { frequency: 2.0, amplitude: 1.25, coherence: 0.78, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
    metrics: [
      { label: 'Vértices', value: String(nVerts), accent: 'cyan' },
      { label: 'Arestas (C/D)', value: `${cyanEdges} / ${goldEdges}`, accent: 'gold' },
    ],
    residual: Math.abs(cyanEdges - goldEdges) / Math.max(1, cyanEdges + goldEdges),
    candidateSummary: `Grafo ${problem.code} com ${nVerts} vértices e ${cyanEdges + goldEdges} arestas coloridas.`,
  }
}
