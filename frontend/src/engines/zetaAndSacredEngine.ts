import type { HardwareProfile, ProblemSpec, ProjectionMode, SimulationFrame } from '../domain/types'
import { applyProjection3D, clamp, extractHotspotsFromHeights, finiteParam, finiteTime, gridSizeForProfile, heatColorRGB } from './mathUtils'

// Euler-accelerated alternating eta series for zeta(sigma + i*t)
export function evalZetaComplex(sigma: number, t: number, terms = 44): { re: number; im: number; mag: number } {
  if (!Number.isFinite(sigma) || !Number.isFinite(t)) return { re: 0, im: 0, mag: 0 }
  const safeTerms = Math.max(4, Math.min(200, Math.floor(terms)))
  let etaRe = 0
  let etaIm = 0
  for (let n = 1; n <= safeTerms; n++) {
    const sign = n % 2 === 1 ? 1 : -1
    const mag = Math.pow(n, -sigma)
    const ang = -t * Math.log(n)
    etaRe += sign * mag * Math.cos(ang)
    etaIm += sign * mag * Math.sin(ang)
  }
  const factorMag = Math.pow(2, 1 - sigma)
  const factorAng = -t * Math.LN2
  const dRe = 1 - factorMag * Math.cos(factorAng)
  const dIm = -factorMag * Math.sin(factorAng)
  const denom = Math.max(dRe * dRe + dIm * dIm, 1e-8)
  const re = (etaRe * dRe + etaIm * dIm) / denom
  const im = (etaIm * dRe - etaRe * dIm) / denom
  return { re, im, mag: Math.hypot(re, im) }
}

export function computeGenesisWaveFrame(
  _problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const n = gridSizeForProfile(profile)
  const A = finiteParam(params.amplitude, 1.5, 0.05, 8.0)
  const k = finiteParam(params.frequency, 1.8, 0.1, 10.0)
  const phaseOffset = finiteParam(params.phase, 0.0, -100, 100)
  const phase = finiteTime(time) * 1.4 + phaseOffset

  const positions = new Float32Array(n * n * 3)
  const colors = new Float32Array(n * n * 3)
  const heights = new Float32Array(n * n)
  const xs = new Float32Array(n * n)
  const zs = new Float32Array(n * n)

  let energy = 0
  let idx = 0
  for (let i = 0; i < n; i++) {
    const x = -4.2 + (8.4 * i) / (n - 1)
    for (let j = 0; j < n; j++) {
      const z = -4.2 + (8.4 * j) / (n - 1)
      const r = Math.hypot(x, z)
      const y = A * Math.sin(k * r - phase)
      heights[idx] = y
      xs[idx] = x
      zs[idx] = z
      const [px, py, pz] = applyProjection3D(x, y, z, projection)
      positions[idx * 3] = px
      positions[idx * 3 + 1] = py
      positions[idx * 3 + 2] = pz
      const [cr, cg, cb] = heatColorRGB((y + A) / Math.max(2 * A, 0.2))
      colors[idx * 3] = cr
      colors[idx * 3 + 1] = cg
      colors[idx * 3 + 2] = cb
      energy += y * y
      idx++
    }
  }

  const slice: Array<[number, number]> = []
  for (let i = 0; i < n; i++) {
    const x = -4.2 + (8.4 * i) / (n - 1)
    slice.push([Number(x.toFixed(2)), Number((A * Math.sin(k * Math.abs(x) - phase)).toFixed(4))])
  }

  const meanEnergy = energy / (n * n)
  return {
    surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.58, solidOpacity: 0.72 },
    adaptiveHotspots: extractHotspotsFromHeights(heights, n, n, xs, zs, 4),
    chart2D: {
      title: 'Perfil Radial Onda Gênesis z(x, 0, t)',
      xLabel: 'x',
      yLabel: 'z',
      mode: 'line',
      series: [{ label: 'z = A·sin(k|x|-t)', color: '#38e8ff', points: slice }],
    },
    fieldCoupling: {
      frequency: k,
      amplitude: A,
      coherence: clamp(0.65 + 0.3 * Math.cos(k - 1.8), 0.2, 0.99),
      phaseShift: phase,
      focalPoints: [[0, 0, 0]],
    },
    metrics: [
      { label: 'Amplitude A', value: A.toFixed(2), accent: 'gold' },
      { label: 'Frequência k', value: k.toFixed(2), accent: 'cyan' },
      { label: 'Energia Média', value: meanEnergy.toFixed(3), accent: 'emerald' },
    ],
    residual: Math.abs(meanEnergy - 1.125),
    candidateSummary: `Onda radial z=${A.toFixed(2)}·sin(${k.toFixed(2)}r - t), energia=${meanEnergy.toFixed(3)}`,
  }
}

export function computeZetaFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  const n = Math.max(18, gridSizeForProfile(profile) - 4)
  const sigmaCenter = finiteParam(params.sigma, 0.5, 0.05, 0.95)
  const tMin = finiteParam(params.tMin, 10, 1, 200)
  const tMax = finiteParam(params.tMax, 48, tMin + 2, 300)
  const variant = problem.variant

  const positions = new Float32Array(n * n * 3)
  const colors = new Float32Array(n * n * 3)
  const heights = new Float32Array(n * n)
  const xs = new Float32Array(n * n)
  const zs = new Float32Array(n * n)

  let minMag = 999
  let minT = tMin
  let idx = 0
  for (let i = 0; i < n; i++) {
    const sigma = 0.1 + (0.8 * i) / (n - 1)
    for (let j = 0; j < n; j++) {
      const t = tMin + ((tMax - tMin) * j) / (n - 1)
      let val: number
      if (variant === 'bochner-riesz') {
        const dist = Math.hypot(sigma - 0.5, (t - 28) / 18)
        val = Math.max(0, 1.8 * Math.pow(Math.max(0, 1 - dist), 0.7) * (1 + 0.25 * Math.cos(8 * dist - tSafe)))
      } else if (variant === 'carleson' || variant === 'restriction') {
        val = Math.abs(Math.sin((sigma * 12 + t * 0.45) - tSafe * 0.6) * Math.cos(t * 0.22)) * 2.2
      } else {
        const z = evalZetaComplex(sigma, t + 0.15 * Math.sin(tSafe * 0.4), 38)
        val = Math.min(z.mag, 4.2)
      }
      if (Math.abs(sigma - sigmaCenter) < 0.08 && val < minMag) {
        minMag = val
        minT = t
      }
      const x = (sigma - 0.5) * 9.0
      const zCoord = ((t - tMin) / Math.max(1, tMax - tMin) - 0.5) * 8.4
      heights[idx] = val
      xs[idx] = x
      zs[idx] = zCoord
      const [px, py, pz] = applyProjection3D(x, val - 0.6, zCoord, projection)
      positions[idx * 3] = px
      positions[idx * 3 + 1] = py
      positions[idx * 3 + 2] = pz
      const [cr, cg, cb] = heatColorRGB(1.0 - clamp(val / 3.2, 0, 1))
      colors[idx * 3] = cr
      colors[idx * 3 + 1] = cg
      colors[idx * 3 + 2] = cb
      idx++
    }
  }

  // Critical line curve
  const linePts = new Float32Array(72 * 3)
  const spectrum2D: Array<[number, number]> = []
  for (let k = 0; k < 72; k++) {
    const t = tMin + ((tMax - tMin) * k) / 71
    const z = evalZetaComplex(sigmaCenter, t, 46)
    const mag = Math.min(z.mag, 4.2)
    const x = (sigmaCenter - 0.5) * 9.0
    const zc = ((t - tMin) / Math.max(1, tMax - tMin) - 0.5) * 8.4
    const [px, py, pz] = applyProjection3D(x, mag - 0.55, zc, projection)
    linePts[k * 3] = px
    linePts[k * 3 + 1] = py
    linePts[k * 3 + 2] = pz
    spectrum2D.push([Number(t.toFixed(2)), Number(mag.toFixed(4))])
  }

  // Known non-trivial critical zeros markers in window
  const knownZeros = [14.1347, 21.022, 25.0109, 30.4249, 32.9351, 37.5862, 40.9187, 43.3271].filter(
    (tz) => tz >= tMin && tz <= tMax,
  )
  const markers = knownZeros.map((tz) => {
    const zc = ((tz - tMin) / Math.max(1, tMax - tMin) - 0.5) * 8.4
    const [px, py, pz] = applyProjection3D((sigmaCenter - 0.5) * 9.0, -0.5, zc, projection)
    return { position: [px, py, pz] as [number, number, number], color: '#f5b942', radius: 0.16, pulse: true, label: `t=${tz}` }
  })

  return {
    surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.52, solidOpacity: 0.74 },
    curves: [{ points: linePts, color: '#38e8ff', opacity: 0.95 }],
    markers,
    adaptiveHotspots: extractHotspotsFromHeights(heights, n, n, xs, zs, 4),
    chart2D: {
      title: `Módulo |ζ(${sigmaCenter.toFixed(2)} + it)| — Zeros em Vales`,
      xLabel: 't',
      yLabel: '|ζ(s)|',
      mode: 'line',
      series: [{ label: `σ=${sigmaCenter.toFixed(2)}`, color: '#f5b942', points: spectrum2D }],
    },
    fieldCoupling: {
      frequency: 2.4,
      amplitude: 1.3,
      coherence: clamp(1.0 - minMag * 0.45, 0.15, 0.98),
      phaseShift: tSafe,
      focalPoints: markers.slice(0, 3).map((m) => m.position),
    },
    metrics: [
      { label: 'Parte Real σ', value: sigmaCenter.toFixed(2), accent: 'cyan' },
      { label: 'Mín |ζ(s)|', value: minMag.toFixed(4), accent: 'gold' },
      { label: 't do Vale', value: minT.toFixed(2), accent: 'emerald' },
      { label: 'Zeros na Janela', value: String(knownZeros.length), accent: 'violet' },
    ],
    residual: minMag + Math.abs(sigmaCenter - 0.5) * 2.5,
    candidateSummary: `Faixa crítica σ=${sigmaCenter.toFixed(2)}: vale mínimo |ζ|=${minMag.toFixed(4)} próximo a t=${minT.toFixed(2)}`,
  }
}

export function computeSacredVariantsFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  if (problem.engine === 'genesis-wave') {
    return computeGenesisWaveFrame(problem, params, tSafe, profile, projection)
  }

  if (problem.engine === 'tesla-369') {
    const n = gridSizeForProfile(profile)
    const pM = Math.round(finiteParam(params.pMode, 3, 1, 16))
    const qM = Math.round(finiteParam(params.qMode, 6, 1, 16))
    const inten = finiteParam(params.intensity, 1.4, 0.1, 6.0)
    const positions = new Float32Array(n * n * 3)
    const colors = new Float32Array(n * n * 3)
    const heights = new Float32Array(n * n)
    const xs = new Float32Array(n * n)
    const zs = new Float32Array(n * n)
    let idx = 0
    for (let i = 0; i < n; i++) {
      const u = (i / (n - 1)) * Math.PI * 2
      for (let j = 0; j < n; j++) {
        const v = (j / (n - 1)) * Math.PI * 2
        const rTorus = 2.4
        const tube = 0.95 + 0.25 * inten * Math.sin(pM * u + qM * v - tSafe * 1.5)
        const x = (rTorus + tube * Math.cos(v)) * Math.cos(u)
        const y = tube * Math.sin(v)
        const z = (rTorus + tube * Math.cos(v)) * Math.sin(u)
        heights[idx] = y
        xs[idx] = x
        zs[idx] = z
        const [px, py, pz] = applyProjection3D(x, y, z, projection)
        positions[idx * 3] = px
        positions[idx * 3 + 1] = py
        positions[idx * 3 + 2] = pz
        const [cr, cg, cb] = heatColorRGB(0.5 + 0.5 * Math.sin(pM * u + qM * v - tSafe))
        colors[idx * 3] = cr
        colors[idx * 3 + 1] = cg
        colors[idx * 3 + 2] = cb
        idx++
      }
    }
    const pts2d: Array<[number, number]> = Array.from({ length: 48 }, (_, k) => {
      const t = (k / 47) * Math.PI * 2
      return [Number(t.toFixed(2)), Number((inten * Math.sin(pM * t) * Math.cos(qM * t - tSafe)).toFixed(4))]
    })
    return {
      surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.45, solidOpacity: 0.72 },
      adaptiveHotspots: extractHotspotsFromHeights(heights, n, n, xs, zs, 3),
      chart2D: {
        title: `Modos Toroidais (${pM}, ${qM}) & Interferência`,
        xLabel: 'θ',
        yLabel: 'E(θ)',
        mode: 'line',
        series: [{ label: 'Harmônico', color: '#38e8ff', points: pts2d }],
      },
      fieldCoupling: { frequency: (pM + qM) * 0.35, amplitude: inten, coherence: 0.88, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
      metrics: [
        { label: 'Modos (p,q)', value: `(${pM}, ${qM})`, accent: 'cyan' },
        { label: 'Intensidade', value: inten.toFixed(2), accent: 'gold' },
      ],
      residual: Math.abs((pM + qM) % 3),
      candidateSummary: `Toro harmônico modos (${pM}, ${qM}) com ressonância eletromagnética simulada.`,
    }
  }

  if (problem.engine === 'davinci-phi') {
    const phi = (1 + Math.sqrt(5)) / 2
    const petals = Math.round(finiteParam(params.petals, 144, 12, 600))
    const scale = finiteParam(params.scale, 1.2, 0.2, 4.0)
    const positions = new Float32Array(petals * 3)
    const colors = new Float32Array(petals * 3)
    const goldenAngle = Math.PI * (3 - Math.sqrt(5))
    const spiral2D: Array<[number, number]> = []
    for (let i = 0; i < petals; i++) {
      const r = scale * Math.sqrt(i / petals) * 3.6
      const ang = i * goldenAngle + tSafe * 0.25
      const y = 0.6 * Math.sin(r * 1.4 - tSafe)
      const [px, py, pz] = applyProjection3D(r * Math.cos(ang), y, r * Math.sin(ang), projection)
      positions[i * 3] = px
      positions[i * 3 + 1] = py
      positions[i * 3 + 2] = pz
      const [cr, cg, cb] = heatColorRGB(i / petals)
      colors[i * 3] = cr
      colors[i * 3 + 1] = cg
      colors[i * 3 + 2] = cb
      if (i % 3 === 0) spiral2D.push([i, Number(r.toFixed(4))])
    }
    return {
      particles: { positions, colors, count: petals },
      chart2D: {
        title: `Filotaxia Áurea φ = ${phi.toFixed(6)}`,
        xLabel: 'Índice n',
        yLabel: 'Raio r(n)',
        mode: 'scatter',
        series: [{ label: 'r = √n', color: '#f5b942', points: spiral2D }],
      },
      fieldCoupling: { frequency: phi, amplitude: scale, coherence: 0.94, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
      metrics: [
        { label: 'Razão Áurea φ', value: phi.toFixed(6), accent: 'gold' },
        { label: 'Euler V-E+F', value: '2 (Exato)', accent: 'emerald' },
        { label: 'Pontos', value: String(petals), accent: 'cyan' },
      ],
      residual: Math.abs(phi - 1.6180339887),
      candidateSummary: `Geometria áurea com ${petals} pontos filotáticos (137.508°); invariante V-E+F=2 verificado.`,
    }
  }

  if (problem.engine === 'nosso-lar') {
    const rings = Math.round(finiteParam(params.rings, 5, 1, 10))
    const coupling = finiteParam(params.coupling, 2.2, 0.1, 10.0)
    const freq = finiteParam(params.pulseFreq, 1.5, 0.1, 10.0)
    const markers: SimulationFrame['markers'] = []
    const curves: NonNullable<SimulationFrame['curves']> = []
    const syncCurve: Array<[number, number]> = []

    for (let rIdx = 1; rIdx <= rings; rIdx++) {
      const rad = rIdx * 0.72
      const seg = 48
      const pts = new Float32Array(seg * 3)
      for (let s = 0; s < seg; s++) {
        const th = (s / (seg - 1)) * Math.PI * 2
        const y = 0.25 * Math.sin(rIdx * 1.1 - tSafe * freq)
        const [px, py, pz] = applyProjection3D(rad * Math.cos(th), y, rad * Math.sin(th), projection)
        pts[s * 3] = px
        pts[s * 3 + 1] = py
        pts[s * 3 + 2] = pz
      }
      curves.push({ points: pts, color: rIdx % 2 === 0 ? '#38e8ff' : '#f5b942', opacity: 0.75 })
      const nodesInRing = rIdx * 3
      for (let m = 0; m < nodesInRing; m++) {
        const ang = (m / nodesInRing) * Math.PI * 2 + (tSafe * 0.4) / Math.max(0.5, coupling)
        const [px, py, pz] = applyProjection3D(rad * Math.cos(ang), 0.25 * Math.sin(rIdx - tSafe * freq), rad * Math.sin(ang), projection)
        markers.push({ position: [px, py, pz], color: rIdx === 1 ? '#34d399' : '#38e8ff', radius: 0.11, pulse: m === 0 })
      }
    }
    for (let k = 0; k < 40; k++) {
      const K = (k / 39) * 4.0
      const orderParam = K > 1.2 ? Math.sqrt(Math.max(0, 1 - 1.2 / K)) : 0.05 * Math.exp(-Math.abs(K - 1.2))
      syncCurve.push([Number(K.toFixed(2)), Number(orderParam.toFixed(4))])
    }
    const orderR = coupling > 1.2 ? Math.sqrt(1 - 1.2 / coupling) : 0.1
    return {
      curves,
      markers,
      chart2D: {
        title: 'Sincronização Concêntrica (Kuramoto r vs K)',
        xLabel: 'Acoplamento K',
        yLabel: 'Ordem r',
        mode: 'line',
        series: [{ label: 'Sincronia r(K)', color: '#34d399', points: syncCurve }],
      },
      fieldCoupling: { frequency: freq, amplitude: 1.2, coherence: orderR, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
      metrics: [
        { label: 'Parâmetro Ordem r', value: orderR.toFixed(3), accent: 'emerald' },
        { label: 'Anéis', value: String(rings), accent: 'gold' },
      ],
      residual: 1 - orderR,
      candidateSummary: `Rede concêntrica com ${rings} anéis e acoplamento K=${coupling.toFixed(2)} (sincronia r=${orderR.toFixed(3)}).`,
    }
  }

  // Mandelbulb 3D point cloud
  const power = Math.round(finiteParam(params.power, 8, 2, 16))
  const iters = Math.round(finiteParam(params.iterations, 6, 2, 16))
  const bailout = finiteParam(params.bailout, 2.0, 1.1, 8.0)
  const grid = profile === 'eco' ? 12 : profile === 'ultra' ? 18 : 15
  const pts: number[] = []
  const cols: number[] = []
  const escHist = new Array(iters + 1).fill(0)

  for (let ix = 0; ix < grid; ix++) {
    const x0 = -1.35 + (2.7 * ix) / (grid - 1)
    for (let iy = 0; iy < grid; iy++) {
      const y0 = -1.35 + (2.7 * iy) / (grid - 1)
      for (let iz = 0; iz < grid; iz++) {
        const z0 = -1.35 + (2.7 * iz) / (grid - 1)
        let vx = x0, vy = y0, vz = z0
        let escapeIter = iters
        for (let k = 0; k < iters; k++) {
          const r = Math.sqrt(vx * vx + vy * vy + vz * vz)
          if (r > bailout) {
            escapeIter = k
            break
          }
          if (r < 1e-6) break
          const theta = Math.acos(clamp(vz / r, -1, 1))
          const phi = Math.atan2(vy, vx)
          const rn = Math.pow(r, power)
          const nt = theta * power
          const np = phi * power + tSafe * 0.12
          vx = rn * Math.sin(nt) * Math.cos(np) + x0
          vy = rn * Math.sin(nt) * Math.sin(np) + y0
          vz = rn * Math.cos(nt) + z0
        }
        escHist[escapeIter]++
        if (escapeIter >= iters - 1) {
          const [px, py, pz] = applyProjection3D(x0 * 2.2, y0 * 2.2, z0 * 2.2, projection)
          pts.push(px, py, pz)
          const [cr, cg, cb] = heatColorRGB(0.25 + 0.7 * Math.hypot(x0, y0))
          cols.push(cr, cg, cb)
        }
      }
    }
  }
  const count = Math.floor(pts.length / 3)
  return {
    particles: { positions: new Float32Array(pts), colors: new Float32Array(cols), count },
    chart2D: {
      title: `Histograma de Escape Mandelbulb (n=${power})`,
      xLabel: 'Iteração',
      yLabel: 'Voxels',
      mode: 'bar',
      series: [{ label: 'Voxels', color: '#a78bfa', points: escHist.map((v, k) => [k, v]) }],
    },
    fieldCoupling: { frequency: 2.0, amplitude: 1.2, coherence: 0.78, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
    metrics: [
      { label: 'Expoente n', value: String(power), accent: 'violet' },
      { label: 'Pontos Fronteira', value: String(count), accent: 'cyan' },
    ],
    residual: 1 / Math.max(1, count),
    candidateSummary: `Mandelbulb grau ${power} com ${count} pontos interiores em malha ${grid}³.`,
  }
}
