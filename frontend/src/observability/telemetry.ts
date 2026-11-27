export interface TelemetryLogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error'
  source: string
  message: string
}

class TelemetryStore {
  private fpsSamples: number[] = []
  private computeMsSamples: number[] = []
  private logs: TelemetryLogEntry[] = []
  private listeners = new Set<() => void>()
  private errorCount = 0

  recordFrame(fps: number, computeMs: number): void {
    this.fpsSamples.push(fps)
    this.computeMsSamples.push(computeMs)
    if (this.fpsSamples.length > 60) this.fpsSamples.shift()
    if (this.computeMsSamples.length > 60) this.computeMsSamples.shift()
  }

  log(level: TelemetryLogEntry['level'], source: string, message: string): void {
    if (level === 'error') this.errorCount++
    this.logs.unshift({
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('pt-BR'),
      level,
      source,
      message,
    })
    if (this.logs.length > 80) this.logs.pop()
    this.listeners.forEach((fn) => fn())
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn)
    return () => this.listeners.delete(fn)
  }

  snapshot() {
    const avgFps =
      this.fpsSamples.length > 0
        ? Math.round(this.fpsSamples.reduce((a, b) => a + b, 0) / this.fpsSamples.length)
        : 60
    const avgMs =
      this.computeMsSamples.length > 0
        ? Number((this.computeMsSamples.reduce((a, b) => a + b, 0) / this.computeMsSamples.length).toFixed(2))
        : 0.4
    return {
      avgFps,
      avgComputeMs: avgMs,
      errorCount: this.errorCount,
      logs: this.logs,
    }
  }
}

export const telemetry = new TelemetryStore()
