import { useEffect, useRef } from 'react'
import type { SimulationFrame } from '../domain/types'

interface Props {
  chart: SimulationFrame['chart2D']
  residualHistory?: number[]
  onCanvasReady?: (canvas: HTMLCanvasElement) => void
}

export function Oscilloscope2D({ chart, residualHistory = [], onCanvasReady }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    onCanvasReady?.(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = 520
    const h = 210
    canvas.width = w
    canvas.height = h

    ctx.fillStyle = '#070b18'
    ctx.fillRect(0, 0, w, h)

    // Subtle scientific grid
    ctx.strokeStyle = 'rgba(56, 232, 255, 0.1)'
    ctx.lineWidth = 1
    for (let x = 44; x < w - 16; x += 44) {
      ctx.beginPath()
      ctx.moveTo(x, 22)
      ctx.lineTo(x, h - 28)
      ctx.stroke()
    }
    for (let y = 26; y < h - 24; y += 32) {
      ctx.beginPath()
      ctx.moveTo(42, y)
      ctx.lineTo(w - 14, y)
      ctx.stroke()
    }

    const allPts = chart.series.flatMap((s) => s.points).filter(([x, y]) => Number.isFinite(x) && Number.isFinite(y))
    if (allPts.length === 0) return

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
    for (const [x, y] of allPts) {
      if (x < minX) minX = x
      if (x > maxX) maxX = x
      if (y < minY) minY = y
      if (y > maxY) maxY = y
    }
    if (maxX === minX) maxX = minX + 1
    if (maxY === minY) maxY = minY + 1

    const padL = 44, padR = 16, padT = 26, padB = 28
    const plotW = w - padL - padR
    const plotH = h - padT - padB

    const mapX = (vx: number) => padL + ((vx - minX) / (maxX - minX)) * plotW
    const mapY = (vy: number) => padT + plotH - ((vy - minY) / (maxY - minY)) * plotH

    for (const s of chart.series) {
      const validPts = s.points.filter(([px, py]) => Number.isFinite(px) && Number.isFinite(py))
      ctx.strokeStyle = s.color
      ctx.fillStyle = s.color
      ctx.lineWidth = 2
      if (chart.mode === 'bar') {
        const bw = Math.max(2, plotW / Math.max(1, validPts.length) - 1.5)
        for (const [px, py] of validPts) {
          const cx = mapX(px)
          const cy = mapY(py)
          ctx.fillRect(cx - bw * 0.5, cy, bw, padT + plotH - cy)
        }
      } else if (chart.mode === 'scatter') {
        for (const [px, py] of validPts) {
          ctx.beginPath()
          ctx.arc(mapX(px), mapY(py), 2.3, 0, Math.PI * 2)
          ctx.fill()
        }
      } else {
        ctx.beginPath()
        validPts.forEach(([px, py], i) => {
          const cx = mapX(px)
          const cy = mapY(py)
          if (i === 0) ctx.moveTo(cx, cy)
          else ctx.lineTo(cx, cy)
        })
        ctx.stroke()
      }
    }

    // Optional residual convergence trace in top-right inset
    const finiteHistory = residualHistory.filter((v) => Number.isFinite(v) && v >= 0)
    if (finiteHistory.length > 2) {
      const rMax = Math.max(...finiteHistory, 1e-4)
      ctx.strokeStyle = 'rgba(245, 185, 66, 0.7)'
      ctx.lineWidth = 1.4
      ctx.beginPath()
      finiteHistory.forEach((rv, i) => {
        const rx = w - 120 + (i / Math.max(1, finiteHistory.length - 1)) * 100
        const ry = 54 - (rv / rMax) * 26
        if (i === 0) ctx.moveTo(rx, ry)
        else ctx.lineTo(rx, ry)
      })
      ctx.stroke()
    }

    ctx.fillStyle = '#cbd5e1'
    ctx.font = '11px JetBrains Mono, monospace'
    ctx.fillText(chart.title.slice(0, 62), 44, 15)
    ctx.fillStyle = '#64748b'
    ctx.font = '10px JetBrains Mono, monospace'
    ctx.fillText(`${chart.xLabel}: ${minX.toFixed(1)} → ${maxX.toFixed(1)}`, 44, h - 8)
    ctx.fillText(`${chart.yLabel}: [${minY.toFixed(2)}, ${maxY.toFixed(2)}]`, w - 175, h - 8)
  }, [chart, residualHistory, onCanvasReady])

  return (
    <canvas
      ref={canvasRef}
      className="h-44 w-full rounded-lg border border-cyan-500/20 bg-[#070b18] object-contain"
    />
  )
}
