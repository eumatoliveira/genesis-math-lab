import type { ProjectionMode } from '../domain/types'

export function clamp(v: number, min: number, max: number): number {
  if (!Number.isFinite(v)) return Math.max(min, Math.min(max, 0))
  return Math.max(min, Math.min(max, v))
}

export function finiteParam(v: number | undefined, fallback: number, min: number, max: number): number {
  if (typeof v !== 'number' || !Number.isFinite(v)) return fallback
  return Math.max(min, Math.min(max, v))
}

export function finiteTime(t: number): number {
  return Number.isFinite(t) ? t : 0
}

export function sanitize(v: number, bound = 28): number {
  if (!Number.isFinite(v)) return 0
  return Math.max(-bound, Math.min(bound, v))
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function isPrime(n: number): boolean {
  if (n < 2) return false
  if (n === 2) return true
  if (n % 2 === 0) return false
  const limit = Math.floor(Math.sqrt(n))
  for (let i = 3; i <= limit; i += 2) {
    if (n % i === 0) return false
  }
  return true
}

export function sievePrimes(limit: number): number[] {
  if (!Number.isFinite(limit) || limit < 2) return []
  const safeLimit = Math.min(Math.floor(limit), 2_000_000)
  const flags = new Uint8Array(safeLimit + 1)
  flags.fill(1)
  flags[0] = 0
  flags[1] = 0
  const lim = Math.floor(Math.sqrt(safeLimit))
  for (let p = 2; p <= lim; p++) {
    if (flags[p]) {
      for (let q = p * p; q <= safeLimit; q += p) flags[q] = 0
    }
  }
  const out: number[] = []
  for (let i = 2; i <= safeLimit; i++) {
    if (flags[i]) out.push(i)
  }
  return out
}

export function gcd(a: number, b: number): number {
  let x = Math.abs(Math.trunc(a))
  let y = Math.abs(Math.trunc(b))
  while (y !== 0) {
    const t = x % y
    x = y
    y = t
  }
  return x
}

export function heatColorRGB(tNorm: number): [number, number, number] {
  const t = clamp(tNorm, 0, 1)
  if (t < 0.35) {
    const k = t / 0.35
    return [0.08 + 0.14 * k, 0.18 + 0.65 * k, 0.55 + 0.42 * k] // deep indigo -> celestial cyan
  }
  if (t < 0.7) {
    const k = (t - 0.35) / 0.35
    return [0.22 + 0.72 * k, 0.83 - 0.12 * k, 0.97 - 0.68 * k] // cyan -> golden amber
  }
  const k = (t - 0.7) / 0.3
  return [0.94 + 0.06 * k, 0.71 - 0.38 * k, 0.29 + 0.38 * k] // gold -> warm magenta/amber peak
}

export function applyProjection3D(
  x: number,
  y: number,
  z: number,
  mode: ProjectionMode,
): [number, number, number] {
  const sx = sanitize(x)
  const sy = sanitize(y)
  const sz = sanitize(z)
  if (mode === 'cartesian_3d') return [sx, sy, sz]
  if (mode === 'polar_spherical') {
    const r = Math.hypot(sx, sz)
    const theta = Math.atan2(sz, sx)
    return [
      sanitize(r * Math.cos(theta + sy * 0.18)),
      sanitize(sy),
      sanitize(r * Math.sin(theta + sy * 0.18)),
    ]
  }
  if (mode === 'phase_space') {
    return [
      sanitize(sx * 0.92),
      sanitize(sy * 0.85 + 0.25 * Math.sin(sx * 1.4)),
      sanitize(sz * 0.92 + 0.2 * Math.cos(sy * 1.4)),
    ]
  }
  // stereographic_4d: lift into 4th coordinate w = tanh(||p||/5), then project from S^3
  const w = Math.tanh(Math.sqrt(sx * sx + sy * sy + sz * sz) / 5.0)
  const denom = Math.max(1.8 - w, 0.35)
  return [sanitize((sx * 1.4) / denom), sanitize((sy * 1.4) / denom), sanitize((sz * 1.4) / denom)]
}

export function gridSizeForProfile(profile: 'eco' | 'balanced' | 'ultra'): number {
  if (profile === 'eco') return 22
  if (profile === 'ultra') return 42
  return 32
}

export function extractHotspotsFromHeights(
  heights: Float32Array,
  cols: number,
  rows: number,
  xs: Float32Array,
  zs: Float32Array,
  count = 4,
): Array<{ x: number; z: number; intensity: number }> {
  let sum = 0
  for (let i = 0; i < heights.length; i++) sum += heights[i]
  const mean = sum / Math.max(1, heights.length)
  let varSum = 0
  for (let i = 0; i < heights.length; i++) varSum += (heights[i] - mean) ** 2
  const std = Math.sqrt(varSum / Math.max(1, heights.length)) + 1e-6

  const scored: Array<{ idx: number; score: number }> = []
  for (let r = 1; r < rows - 1; r++) {
    for (let c = 1; c < cols - 1; c++) {
      const idx = r * cols + c
      const gx = heights[idx + 1] - heights[idx - 1]
      const gz = heights[idx + cols] - heights[idx - cols]
      const score = Math.abs(heights[idx] - mean) / std + Math.hypot(gx, gz)
      scored.push({ idx, score })
    }
  }
  scored.sort((a, b) => b.score - a.score)
  return scored.slice(0, count).map((s) => ({
    x: sanitize(xs[s.idx]),
    z: sanitize(zs[s.idx]),
    intensity: clamp(s.score / 5, 0.25, 1.0),
  }))
}
