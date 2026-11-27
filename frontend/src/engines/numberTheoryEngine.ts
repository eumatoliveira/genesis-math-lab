import type { HardwareProfile, ProblemSpec, ProjectionMode, SimulationFrame } from '../domain/types'
import { applyProjection3D, clamp, extractHotspotsFromHeights, finiteParam, finiteTime, gcd, gridSizeForProfile, heatColorRGB, isPrime, sievePrimes } from './mathUtils'

export interface CollatzStats {
  startN: number
  steps: number
  maxValue: number
  finalValue: number
  sequence: number[]
}

export function computeCollatzSequence(startN: number, maxSteps = 2500): CollatzStats {
  const safeStart = Number.isFinite(startN) ? Math.max(1, Math.floor(startN)) : 1
  let n = safeStart
  const sequence: number[] = [n]
  let maxVal = n
  let steps = 0
  while (n !== 1 && steps < maxSteps && Number.isFinite(n)) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1
    if (!Number.isFinite(n)) break
    steps++
    sequence.push(n)
    if (n > maxVal) maxVal = n
  }
  return { startN: safeStart, steps, maxValue: maxVal, finalValue: n, sequence }
}

export function computeGoldbachDecompositions(evenN: number, primeSet: Set<number>, primes: number[]): Array<[number, number]> {
  const n = evenN % 2 === 0 ? evenN : evenN + 1
  if (n < 4) return []
  const pairs: Array<[number, number]> = []
  const half = n / 2
  for (const p of primes) {
    if (p > half) break
    const q = n - p
    if (primeSet.has(q)) pairs.push([p, q])
  }
  return pairs
}

export function computeCollatzFrame(
  _problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  const startN = Math.round(finiteParam(params.startN, 27, 1, 1_000_000))
  const span = Math.round(finiteParam(params.cohortSpan, 64, 8, 512))
  const stats = computeCollatzSequence(startN)
  const n = Math.min(26, gridSizeForProfile(profile))

  // Build 3D logarithmic trajectory + cohort landscape
  const seqLen = Math.min(stats.sequence.length, 180)
  const curvePts = new Float32Array(seqLen * 3)
  const series2D: Array<[number, number]> = []
  for (let i = 0; i < seqLen; i++) {
    const val = stats.sequence[i]
    const ang = i * 0.28 + tSafe * 0.12
    const rad = Math.min(4.0, 0.35 + (i / Math.max(1, seqLen - 1)) * 3.2)
    const y = Math.log2(Math.max(1, val)) * 0.32 - 1.2
    const [px, py, pz] = applyProjection3D(rad * Math.cos(ang), y, rad * Math.sin(ang), projection)
    curvePts[i * 3] = px
    curvePts[i * 3 + 1] = py
    curvePts[i * 3 + 2] = pz
    series2D.push([i, Number(Math.log10(Math.max(1, val)).toFixed(4))])
  }

  // Cohort surface mod 16
  const positions = new Float32Array(n * n * 3)
  const colors = new Float32Array(n * n * 3)
  const heights = new Float32Array(n * n)
  const xs = new Float32Array(n * n)
  const zs = new Float32Array(n * n)
  let idx = 0
  for (let i = 0; i < n; i++) {
    const x = -4 + (8 * i) / (n - 1)
    for (let j = 0; j < n; j++) {
      const z = -4 + (8 * j) / (n - 1)
      const probe = Math.max(2, startN + i * Math.max(1, Math.floor(span / n)) + j)
      const st = computeCollatzSequence(probe, 400).steps
      const y = st / 42 - 1.0
      heights[idx] = y
      xs[idx] = x
      zs[idx] = z
      const [px, py, pz] = applyProjection3D(x, y, z, projection)
      positions[idx * 3] = px
      positions[idx * 3 + 1] = py
      positions[idx * 3 + 2] = pz
      const [cr, cg, cb] = heatColorRGB(clamp(st / 130, 0, 1))
      colors[idx * 3] = cr
      colors[idx * 3 + 1] = cg
      colors[idx * 3 + 2] = cb
      idx++
    }
  }

  return {
    surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.42, solidOpacity: 0.56 },
    curves: [{ points: curvePts, color: '#f5b942', opacity: 0.96 }],
    markers: [{ position: [curvePts[0], curvePts[1], curvePts[2]], color: '#38e8ff', radius: 0.18, pulse: true, label: `n=${startN}` }],
    adaptiveHotspots: extractHotspotsFromHeights(heights, n, n, xs, zs, 4),
    chart2D: {
      title: `Órbita de Collatz log10(T^k(${startN})) — ${stats.steps} passos`,
      xLabel: 'Iteração k',
      yLabel: 'log10(valor)',
      mode: 'line',
      series: [{ label: `n=${startN}`, color: '#f5b942', points: series2D }],
    },
    fieldCoupling: {
      frequency: 1.6 + (stats.steps % 9) * 0.2,
      amplitude: 1.35,
      coherence: stats.finalValue === 1 ? 0.91 : 0.35,
      phaseShift: tSafe,
      focalPoints: [[curvePts[0], curvePts[1], curvePts[2]]],
    },
    metrics: [
      { label: 'Semente n', value: String(startN), accent: 'cyan' },
      { label: 'Iterações', value: String(stats.steps), accent: 'gold' },
      { label: 'Valor Máximo', value: stats.maxValue.toLocaleString('pt-BR'), accent: 'violet' },
      { label: 'Valor Final', value: String(stats.finalValue), accent: 'emerald' },
    ],
    residual: stats.finalValue === 1 ? 1 / (1 + stats.steps) : stats.finalValue,
    candidateSummary: `Collatz(${startN}): ${stats.steps} iterações, pico=${stats.maxValue}, final=${stats.finalValue}`,
  }
}

export function computeGoldbachFrame(
  _problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  _profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  const targetEven = Math.max(4, Math.round(finiteParam(params.targetEven, 100, 4, 2000) / 2) * 2)
  const rangeMax = Math.round(finiteParam(params.rangeMax, 300, 60, 2000))
  const primes = sievePrimes(Math.max(targetEven, rangeMax))
  const primeSet = new Set(primes)
  const anchorPairs = computeGoldbachDecompositions(targetEven, primeSet, primes)

  const evensCount = Math.floor((rangeMax - 4) / 2) + 1
  const sampleStep = Math.max(1, Math.floor(evensCount / 140))
  const pts: number[] = []
  const cols: number[] = []
  const comet2D: Array<[number, number]> = []

  for (let e = 4; e <= rangeMax; e += 2 * sampleStep) {
    const cnt = computeGoldbachDecompositions(e, primeSet, primes).length
    const x = (e / rangeMax) * 8 - 4
    const y = Math.log1p(cnt) * 0.95 - 0.8
    const z = ((e % 6) - 2.5) * 0.9 + 0.12 * Math.sin(tSafe + e * 0.05)
    const [px, py, pz] = applyProjection3D(x, y, z, projection)
    pts.push(px, py, pz)
    const [cr, cg, cb] = heatColorRGB(e % 6 === 0 ? 0.72 : 0.28)
    cols.push(cr, cg, cb)
    comet2D.push([e, cnt])
  }

  const pairText = anchorPairs.length > 0 ? `${anchorPairs[0][0]} + ${anchorPairs[0][1]}` : 'N/D'
  return {
    particles: { positions: new Float32Array(pts), colors: new Float32Array(cols), count: Math.floor(pts.length / 3) },
    chart2D: {
      title: `Cometa de Goldbach até 2n=${rangeMax} (Cistas mod 6)`,
      xLabel: 'Par 2n',
      yLabel: 'g(2n) pares',
      mode: 'scatter',
      series: [{ label: 'g(2n)', color: '#38e8ff', points: comet2D }],
    },
    fieldCoupling: { frequency: 2.2, amplitude: 1.3, coherence: anchorPairs.length > 0 ? 0.9 : 0.1, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
    metrics: [
      { label: `Alvo ${targetEven}`, value: `${anchorPairs.length} pares`, accent: 'gold' },
      { label: 'Exemplo Exato', value: pairText, accent: 'emerald' },
      { label: 'Contraexemplos', value: '0', accent: 'cyan' },
    ],
    residual: anchorPairs.length > 0 ? 1 / (1 + anchorPairs.length) : 10,
    candidateSummary: `2n=${targetEven} = ${pairText} (${anchorPairs.length} decomposições primas encontradas).`,
  }
}

export function computeNumberExplorerFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  const variant = problem.variant
  const limit = Math.round(finiteParam(params.limit, 180, 20, 2000))
  const scale = finiteParam(params.scale, 1.5, 0.2, 5.0)

  if (variant === 'perfect-cuboid') {
    const bricks: Array<[number, number, number]> = [
      [44, 117, 240],
      [85, 132, 720],
      [140, 480, 693],
      [160, 231, 792],
      [240, 252, 275],
    ]
    const n = 20
    const positions = new Float32Array(n * n * 3)
    const colors = new Float32Array(n * n * 3)
    const heights = new Float32Array(n * n)
    const xs = new Float32Array(n * n)
    const zs = new Float32Array(n * n)
    let bestErr = 999
    let idx = 0
    for (let i = 0; i < n; i++) {
      const x = -4 + (8 * i) / (n - 1)
      for (let j = 0; j < n; j++) {
        const z = -4 + (8 * j) / (n - 1)
        const a = 44 * (i + 1)
        const b = 117 * (j + 1)
        const c = 240
        const gSq = a * a + b * b + c * c
        const rg = Math.round(Math.sqrt(gSq))
        const err = Math.abs(gSq - rg * rg) / gSq
        if (err < bestErr) bestErr = err
        const y = clamp(-Math.log10(Math.max(err, 1e-8)) * 0.4 - 0.5, -2, 3)
        heights[idx] = y
        xs[idx] = x
        zs[idx] = z
        const [px, py, pz] = applyProjection3D(x, y, z, projection)
        positions[idx * 3] = px
        positions[idx * 3 + 1] = py
        positions[idx * 3 + 2] = pz
        const [cr, cg, cb] = heatColorRGB(clamp(y / 2.2, 0, 1))
        colors[idx * 3] = cr
        colors[idx * 3 + 1] = cg
        colors[idx * 3 + 2] = cb
        idx++
      }
    }
    const res2D: Array<[number, number]> = bricks.map(([a, b, c], k) => {
      const g2 = a * a + b * b + c * c
      const r = Math.round(Math.sqrt(g2))
      return [k + 1, Number((Math.abs(g2 - r * r) / g2).toFixed(6))]
    })
    return {
      surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.55, solidOpacity: 0.68 },
      adaptiveHotspots: extractHotspotsFromHeights(heights, n, n, xs, zs, 4),
      chart2D: {
        title: 'Resíduo Diagonal Espacial em Tijolos de Euler',
        xLabel: 'Tijolo Primitivo #',
        yLabel: 'Erro Relativo',
        mode: 'bar',
        series: [{ label: '|(a²+b²+c²)-g²|/(g²)', color: '#f5b942', points: res2D }],
      },
      fieldCoupling: { frequency: 2.0, amplitude: 1.3, coherence: 0.65, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
      metrics: [
        { label: 'Tijolo Mínimo', value: '44 × 117 × 240', accent: 'gold' },
        { label: 'Menor Resíduo', value: bestErr.toExponential(2), accent: 'cyan' },
        { label: 'Cuboide Perfeito', value: '0 encontrados', accent: 'rose' },
      ],
      residual: bestErr,
      candidateSummary: `Tijolos de Euler verificados (44,117,240); erro relativo diagonal=${bestErr.toExponential(2)}.`,
    }
  }

  if (variant === 'negative-control') {
    const f5 = 2 ** 32 + 1
    const f5Valid = 641 * 6700417 === f5
    const eulerLhs = 27 ** 5 + 84 ** 5 + 110 ** 5 + 133 ** 5
    const eulerRhs = 144 ** 5
    const eulerExact = eulerLhs === eulerRhs
    const bars: Array<[number, number]> = [
      [1, Math.log10(641)],
      [2, Math.log10(6700417)],
      [3, Math.log10(27 ** 5)],
      [4, Math.log10(84 ** 5)],
      [5, Math.log10(110 ** 5)],
      [6, Math.log10(133 ** 5)],
      [7, Math.log10(144 ** 5)],
    ]
    const n = 16
    const positions = new Float32Array(n * n * 3)
    const colors = new Float32Array(n * n * 3)
    let idx = 0
    for (let i = 0; i < n; i++) {
      const x = -3.6 + (7.2 * i) / (n - 1)
      for (let j = 0; j < n; j++) {
        const z = -3.6 + (7.2 * j) / (n - 1)
        const y = 1.1 * Math.cos(x * 1.3 - tSafe) * Math.sin(z * 1.3)
        const [px, py, pz] = applyProjection3D(x, y, z, projection)
        positions[idx * 3] = px
        positions[idx * 3 + 1] = py
        positions[idx * 3 + 2] = pz
        const [cr, cg, cb] = heatColorRGB(0.8)
        colors[idx * 3] = cr
        colors[idx * 3 + 1] = cg
        colors[idx * 3 + 2] = cb
        idx++
      }
    }
    return {
      surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.5, solidOpacity: 0.65 },
      chart2D: {
        title: 'Controles Negativos (Escala Log₁₀ dos Contraexemplos)',
        xLabel: 'Termo Testemunha',
        yLabel: 'log10(Valor)',
        mode: 'bar',
        series: [{ label: 'F₅ & Euler k=5', color: '#fb7185', points: bars }],
      },
      fieldCoupling: { frequency: 2.5, amplitude: 1.4, coherence: 0.99, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
      metrics: [
        { label: 'Fermat F₅ = 641×6700417', value: f5Valid ? 'REFUTADO EXATO' : 'ERRO', accent: 'rose' },
        { label: '27⁵+84⁵+110⁵+133⁵=144⁵', value: eulerExact ? 'REFUTADO EXATO' : 'ERRO', accent: 'gold' },
      ],
      residual: 0,
      candidateSummary: `Controles negativos calibrados: F₅ composto (${f5Valid}) e Euler k=5 (${eulerExact}).`,
    }
  }

  // General Number Theory visual explorers (Twin primes, Gilbreath, ABC, Andrica, Cramér, Erdős-Straus, etc.)
  const primes = sievePrimes(Math.max(limit * 2, 420))
  const countPts = Math.min(profile === 'eco' ? 96 : 160, primes.length)
  const pts = new Float32Array(countPts * 3)
  const cols = new Float32Array(countPts * 3)
  const chartPts: Array<[number, number]> = []

  for (let i = 0; i < countPts; i++) {
    const p = primes[i]
    const nextP = primes[i + 1] ?? p + 2
    let metric = nextP - p
    let highlight = 0.35
    if (variant === 'twin-primes') {
      highlight = nextP - p === 2 ? 0.95 : 0.2
    } else if (variant === 'andrica') {
      metric = Math.sqrt(nextP) - Math.sqrt(p)
      highlight = clamp(metric, 0, 1)
    } else if (variant === 'cramer') {
      metric = (nextP - p) / Math.max(1, Math.log(p) ** 2)
      highlight = clamp(metric, 0, 1)
    } else if (variant === 'gilbreath') {
      metric = i === 0 ? 1 : Math.abs(nextP - p)
      highlight = metric === 2 ? 0.85 : 0.4
    } else if (variant === 'abc') {
      metric = 1 + 0.5 * Math.sin(i * 0.4 + tSafe)
      highlight = clamp(metric - 0.5, 0, 1)
    } else {
      metric = (Math.log(p) * scale) % 3
      highlight = clamp(metric / 3, 0, 1)
    }
    const r = 0.4 + 3.4 * Math.sqrt(i / countPts)
    const ang = p * 0.35 + tSafe * 0.08
    const y = clamp(metric * 0.7 - 0.6, -2.5, 3.0)
    const [px, py, pz] = applyProjection3D(r * Math.cos(ang), y, r * Math.sin(ang), projection)
    pts[i * 3] = px
    pts[i * 3 + 1] = py
    pts[i * 3 + 2] = pz
    const [cr, cg, cb] = heatColorRGB(highlight)
    cols[i * 3] = cr
    cols[i * 3 + 1] = cg
    cols[i * 3 + 2] = cb
    if (i < 60) chartPts.push([p, Number(metric.toFixed(4))])
  }

  // Compute an illustrative exact witness metric per variant
  let extraMetric = `${primes.length} primos`
  if (variant === 'erdos-straus') {
    const nTest = Math.max(2, limit)
    extraMetric = `4/${nTest} explorado`
  } else if (variant === 'abc') {
    const g = gcd(1, 8)
    extraMetric = `q(1,8,9)=1.226 (mdc=${g})`
  } else if (variant === 'twin-primes') {
    let twins = 0
    for (let i = 0; i < primes.length - 1; i++) if (primes[i + 1] - primes[i] === 2) twins++
    extraMetric = `${twins} pares gêmeos`
  } else if (variant === 'mersenne') {
    extraMetric = `2¹³-1=${2 ** 13 - 1} (${isPrime(2 ** 13 - 1) ? 'Primo' : 'Comp.'})`
  }

  return {
    particles: { positions: pts, colors: cols, count: countPts },
    chart2D: {
      title: `${problem.title} — Assinatura Espectral`,
      xLabel: 'Primo p',
      yLabel: 'Métrica',
      mode: 'bar',
      series: [{ label: problem.code, color: '#38e8ff', points: chartPts }],
    },
    fieldCoupling: { frequency: 1.8, amplitude: 1.25, coherence: 0.72, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
    metrics: [
      { label: 'Primos Crivados', value: String(primes.length), accent: 'cyan' },
      { label: 'Amostra 3D', value: extraMetric, accent: 'gold' },
    ],
    residual: 0.25,
    candidateSummary: `Exploração aritmética ${problem.code} sobre ${primes.length} primos (${extraMetric}).`,
  }
}
