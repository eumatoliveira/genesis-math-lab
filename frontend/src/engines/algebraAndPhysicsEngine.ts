import type { HardwareProfile, ProblemSpec, ProjectionMode, SimulationFrame } from '../domain/types'
import { applyProjection3D, clamp, extractHotspotsFromHeights, finiteParam, finiteTime, gridSizeForProfile, heatColorRGB, sievePrimes } from './mathUtils'

function countEllipticPointsModP(a: number, b: number, p: number): number {
  let count = 1 // point at infinity
  for (let x = 0; x < p; x++) {
    const rhs = (((x * x * x + a * x + b) % p) + p) % p
    for (let y = 0; y < p; y++) {
      if ((y * y) % p === rhs) count++
    }
  }
  return count
}

export function computeAlgebraicFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  if (problem.variant === 'bsd') {
    const a = Math.round(finiteParam(params.a, -1, -20, 20))
    const b = Math.round(finiteParam(params.b, 1, -20, 20))
    const maxP = Math.round(finiteParam(params.maxPrime, 113, 17, 250))
    const primes = sievePrimes(maxP)
    const eulerPoints: Array<[number, number]> = []
    let prod = 1.0
    for (const p of primes) {
      const np = countEllipticPointsModP(a, b, p)
      prod *= np / p
      eulerPoints.push([p, Number(Math.log(Math.max(prod, 1e-4)).toFixed(4))])
    }

    // Plot elliptic curve y^2 = x^3 + ax + b over R in 3D phase ribbon
    const pts: number[] = []
    for (let i = 0; i < 80; i++) {
      const x = -2.2 + (4.8 * i) / 79
      const rhs = x * x * x + a * x + b
      if (rhs >= 0) {
        const y = Math.sqrt(rhs) * 0.65
        const [px, py, pz] = applyProjection3D(x * 1.4, y, Math.sin(tSafe + x) * 0.8, projection)
        pts.push(px, py, pz)
      }
    }
    const curve = new Float32Array(pts)
    return {
      curves: curve.length >= 6 ? [{ points: curve, color: '#34d399', opacity: 0.95 }] : [],
      chart2D: {
        title: `Produto de Euler BSD: ln Π(N_p/p) para y² = x³ + (${a})x + (${b})`,
        xLabel: 'Primo p',
        yLabel: 'ln Π(N_p/p)',
        mode: 'line',
        series: [{ label: 'BSD Produto', color: '#34d399', points: eulerPoints }],
      },
      fieldCoupling: { frequency: 1.9, amplitude: 1.2, coherence: 0.84, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
      metrics: [
        { label: 'Curva', value: `y²=x³+(${a})x+(${b})`, accent: 'emerald' },
        { label: 'Π(N_p/p)', value: prod.toFixed(4), accent: 'gold' },
        { label: 'Primos F_p', value: String(primes.length), accent: 'cyan' },
      ],
      residual: Math.abs(Math.log(Math.max(prod, 1e-4))),
      candidateSummary: `Curva elíptica sobre ${primes.length} corpos finitos F_p: produto BSD = ${prod.toFixed(4)}.`,
    }
  }

  // Hodge Calabi-Yau quintic slice / Jacobian / Kaplansky / Langlands / Zariski / Hilbert 12-13
  const n = Math.min(24, gridSizeForProfile(profile))
  const twist = finiteParam(params.twist, 1.6, 0.1, 8.0)
  const phase = finiteParam(params.phase, 0.5, -20, 20)
  const deg = Math.round(finiteParam(params.degree, 5, 1, 12))
  const positions = new Float32Array(n * n * 3)
  const colors = new Float32Array(n * n * 3)
  const heights = new Float32Array(n * n)
  const xs = new Float32Array(n * n)
  const zs = new Float32Array(n * n)
  const spec2D: Array<[number, number]> = []

  let idx = 0
  for (let i = 0; i < n; i++) {
    const u = -Math.PI + (2 * Math.PI * i) / (n - 1)
    for (let j = 0; j < n; j++) {
      const v = -Math.PI + (2 * Math.PI * j) / (n - 1)
      const x = 1.2 * Math.cos(u) * Math.cosh(v * 0.35)
      const z = 1.2 * Math.sin(u) * Math.cosh(v * 0.35)
      const y = 1.3 * Math.cos(deg * u * 0.35 + phase + tSafe * 0.5) * Math.sin(twist * v * 0.4)
      heights[idx] = y
      xs[idx] = x
      zs[idx] = z
      const [px, py, pz] = applyProjection3D(x, y, z, projection)
      positions[idx * 3] = px
      positions[idx * 3 + 1] = py
      positions[idx * 3 + 2] = pz
      const [cr, cg, cb] = heatColorRGB(0.5 + 0.5 * Math.sin(u * twist + v))
      colors[idx * 3] = cr
      colors[idx * 3 + 1] = cg
      colors[idx * 3 + 2] = cb
      if (i === Math.floor(n / 2)) spec2D.push([Number(v.toFixed(2)), Number(y.toFixed(4))])
      idx++
    }
  }

  return {
    surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.54, solidOpacity: 0.7 },
    adaptiveHotspots: extractHotspotsFromHeights(heights, n, n, xs, zs, 4),
    chart2D: {
      title: `${problem.title} — Corte Transversal Algébrico`,
      xLabel: 'Parâmetro v',
      yLabel: 'Altura Projeção',
      mode: 'line',
      series: [{ label: problem.code, color: '#a78bfa', points: spec2D }],
    },
    fieldCoupling: { frequency: twist, amplitude: 1.25, coherence: 0.77, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
    metrics: [
      { label: 'Deformação', value: twist.toFixed(2), accent: 'violet' },
      { label: 'Status', value: problem.status, accent: problem.status === 'Parcial / Refutado' ? 'gold' : 'cyan' },
    ],
    residual: 0.22,
    candidateSummary: `Projeção algébrica ${problem.code} sob deformação ${twist.toFixed(2)}.`,
  }
}

export function computePhysicsFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile,
  projection: ProjectionMode,
): SimulationFrame {
  const tSafe = finiteTime(time)
  const n = Math.min(26, gridSizeForProfile(profile))
  const variant = problem.variant
  const mass = finiteParam(params.mass, 1.6, 0.1, 8.0)
  const coupling = finiteParam(params.coupling ?? params.beta, 2.2, 0.1, 10.0)
  const strain = finiteParam(params.waveStrain ?? params.noise, 0.4, 0.0, 3.0)

  const positions = new Float32Array(n * n * 3)
  const colors = new Float32Array(n * n * 3)
  const heights = new Float32Array(n * n)
  const xs = new Float32Array(n * n)
  const zs = new Float32Array(n * n)
  const series2D: Array<[number, number]> = []

  let idx = 0
  let energySum = 0
  for (let i = 0; i < n; i++) {
    const x = -4 + (8 * i) / (n - 1)
    for (let j = 0; j < n; j++) {
      const z = -4 + (8 * j) / (n - 1)
      const r = Math.hypot(x, z)
      let y = 0
      if (variant === 'spacetime' || variant === 'cosmic-censorship') {
        const well = -mass / Math.max(0.45, Math.sqrt(r * r + 0.35))
        const gw = strain * Math.cos(2 * Math.atan2(z, x) + 2.4 * r - tSafe * 2.5) * Math.exp(-0.12 * r)
        y = clamp(well + gw + 0.9, -2.8, 2.5)
      } else if (variant === 'yang-mills') {
        const plaq = Math.cos(coupling * Math.sin(x * 1.1 + tSafe) * Math.cos(z * 1.1 - tSafe * 0.7))
        y = plaq * 1.4
      } else {
        y = 1.4 * Math.sin(r * coupling * 0.7 - tSafe * 1.8) * Math.exp(-0.15 * r)
      }
      heights[idx] = y
      xs[idx] = x
      zs[idx] = z
      energySum += Math.abs(y)
      const [px, py, pz] = applyProjection3D(x, y, z, projection)
      positions[idx * 3] = px
      positions[idx * 3 + 1] = py
      positions[idx * 3 + 2] = pz
      const [cr, cg, cb] = heatColorRGB(clamp((y + 2.0) / 4.0, 0, 1))
      colors[idx * 3] = cr
      colors[idx * 3 + 1] = cg
      colors[idx * 3 + 2] = cb
      if (i === Math.floor(n / 2)) series2D.push([Number(z.toFixed(2)), Number(y.toFixed(4))])
      idx++
    }
  }

  return {
    surface: { cols: n, rows: n, positions, colors, wireframeOpacity: 0.58, solidOpacity: 0.72 },
    adaptiveHotspots: extractHotspotsFromHeights(heights, n, n, xs, zs, 4),
    chart2D: {
      title: `${problem.title} — Perfil de Energia / Curvatura`,
      xLabel: 'Coordenada',
      yLabel: 'Potencial / Ação',
      mode: 'line',
      series: [{ label: problem.code, color: '#38e8ff', points: series2D }],
    },
    fieldCoupling: { frequency: 2.1, amplitude: 1.35, coherence: 0.81, phaseShift: tSafe, focalPoints: [[0, 0, 0]] },
    metrics: [
      { label: 'Massa/Acopl.', value: coupling.toFixed(2), accent: 'cyan' },
      { label: 'Ação Média', value: (energySum / (n * n)).toFixed(3), accent: 'gold' },
      { label: 'Tier Físico', value: problem.physicsTier, accent: 'violet' },
    ],
    residual: 0.19,
    candidateSummary: `${problem.code}: ação média=${(energySum / (n * n)).toFixed(3)} (${problem.physicsTier}).`,
  }
}
