import { jsPDF } from 'jspdf'
import type { PatternInsightReport, ProblemSpec, SearchState, SimulationFrame } from '../domain/types'

export interface ReportExportPayload {
  problem: ProblemSpec
  params: Record<string, number>
  frame: SimulationFrame
  insights: PatternInsightReport
  searchState: SearchState
  userNotes: string
  canvas3dDataUrl?: string | null
  canvas2dDataUrl?: string | null
}

export function buildMarkdownReport(payload: ReportExportPayload): string {
  const { problem, params, frame, insights, searchState, userNotes } = payload
  const metricsLines = frame.metrics.map((m) => `- **${m.label}:** \`${m.value}\``).join('\n')
  const hitsLines =
    searchState.hits
      .slice(0, 8)
      .map(
        (h) =>
          `- Iteração #${h.iteration} [${h.strategy}] | Resíduo=${h.residual} | Coerência=${h.coherence} | ${h.summary}`,
      )
      .join('\n') || '- Nenhum ciclo automático registrado ainda nesta sessão.'

  return `# GENESIS • Relatório Visual-First — ${problem.title} (${problem.code})

- **ID:** \`${problem.id}\`
- **Área:** ${problem.area}
- **Status Científico Atual:** ${problem.status} — ${problem.statusDetail}
- **Classificação Epistemológica (9 Níveis):** \`${problem.formalTier}\`
- **Classificação Física (4 Níveis):** \`${problem.physicsTier}\` (${problem.physicsRationale})
- **Gerado em:** ${new Date().toISOString()}

> **Separação Epistemológica:** Resultados visuais e experimentais guiam a descoberta de padrões e hipóteses, mas NÃO constituem prova matemática formal.

## 1. Inspiração Filosófica & Ponte Científica
- **Pilar & Princípio:** ${problem.hermeticPrinciple}
- **Nota Filosófica:** ${problem.philosophicalNote}
- **Ponte Científica:** ${problem.scientificBridge}
- **Fórmula de Referência:** \`${problem.formulaLatex}\`

## 2. Parâmetros e Estado Observado
- **Parâmetros Ativos:** \`${JSON.stringify(params)}\`
- **Resumo do Candidato Atual:** ${frame.candidateSummary}
${metricsLines}

## 3. Padrões Visuais & Algoritmo Sintetizado (Visual-First)
- **Regime Observado:** ${insights.regimeLabel}
- **Simetria Espacial:** ${(insights.symmetryScore * 100).toFixed(1)}%
- **Frequência Dominante:** ${insights.dominantFrequency}
- **Economia Computacional (Amostragem Adaptativa vs. Força Bruta):** **${insights.adaptiveSavingsPercent}%** (${insights.adaptiveEvaluations} vs ${insights.bruteForceEvaluations} avaliações)
- **Pistas Visuais:** ${insights.visualCues.join('; ')}
- **Anomalias / Hotspots:** ${insights.detectedAnomalies.join('; ')}

\`\`\`text
${insights.synthesizedRule}
\`\`\`

- **Próxima Hipótese Sugerida:** ${insights.nextHypothesis}

## 4. Histórico da Busca Contínua (${searchState.iterations} iterações)
- **Estratégia:** \`${searchState.strategy}\` | **Menor Resíduo:** \`${Number.isFinite(searchState.bestResidual) ? searchState.bestResidual.toFixed(5) : '—'}\`
${hitsLines}

## 5. Anotações do Pesquisador
${userNotes.trim() ? userNotes : '_Sem anotações manuais registradas._'}
`
}

export function buildPdfReportBlob(payload: ReportExportPayload): Blob {
  const { problem, frame, insights, searchState, userNotes, canvas3dDataUrl, canvas2dDataUrl } = payload
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = 44

  doc.setFillColor(10, 16, 32)
  doc.rect(0, 0, 595, 72, 'F')
  doc.setTextColor(245, 185, 66)
  doc.setFontSize(15)
  doc.text(`GENESIS • ${problem.code}: ${problem.title}`, 36, 34)
  doc.setTextColor(56, 232, 255)
  doc.setFontSize(9)
  doc.text(
    `Status: ${problem.status} | Formal: ${problem.formalTier} | Físico: ${problem.physicsTier}`,
    36,
    54,
  )

  y = 92
  doc.setTextColor(15, 23, 42)
  doc.setFontSize(10)
  const descLines = doc.splitTextToSize(`Enunciado/Descrição: ${problem.description}`, 520)
  doc.text(descLines, 36, y)
  y += descLines.length * 13 + 8

  doc.setFontSize(9.5)
  doc.text(`Fórmula: ${problem.formulaLatex}`, 36, y)
  y += 16
  doc.text(
    `Padrão Visual: ${insights.regimeLabel} | Simetria: ${(insights.symmetryScore * 100).toFixed(1)}% | Economia Adaptativa: ${insights.adaptiveSavingsPercent}%`,
    36,
    y,
  )
  y += 18

  if (canvas3dDataUrl && canvas3dDataUrl.startsWith('data:image/')) {
    try {
      doc.text('Captura do Laboratório 3D (WebGL):', 36, y)
      y += 6
      doc.addImage(canvas3dDataUrl, 'PNG', 36, y, 255, 148)
    } catch {
      // Skip image gracefully in test/headless contexts
    }
  }
  if (canvas2dDataUrl && canvas2dDataUrl.startsWith('data:image/')) {
    try {
      doc.text('Osciloscópio Espectral 2D:', 305, y - 6)
      doc.addImage(canvas2dDataUrl, 'PNG', 305, y, 255, 148)
    } catch {
      // Skip image gracefully in test/headless contexts
    }
  }
  if (canvas3dDataUrl || canvas2dDataUrl) y += 166

  doc.setFontSize(11)
  doc.setTextColor(30, 58, 138)
  doc.text('Métricas Observadas & Regra Algorítmica Sintetizada:', 36, y)
  y += 14
  doc.setFontSize(9)
  doc.setTextColor(30, 41, 59)
  for (const m of frame.metrics) {
    doc.text(`• ${m.label}: ${m.value}`, 42, y)
    y += 12
  }
  y += 4
  const ruleLines = doc.splitTextToSize(insights.synthesizedRule, 520)
  doc.text(ruleLines, 36, y)
  y += ruleLines.length * 11 + 10

  doc.text(
    `Busca Autônoma: ${searchState.iterations} iterações (${searchState.strategy}) | Melhor resíduo: ${Number.isFinite(searchState.bestResidual) ? searchState.bestResidual.toFixed(5) : '—'}`,
    36,
    y,
  )
  y += 14
  if (userNotes.trim()) {
    const noteLines = doc.splitTextToSize(`Anotações: ${userNotes}`, 520)
    doc.text(noteLines, 36, y)
  }

  return doc.output('blob')
}

export function triggerFileDownload(filename: string, content: Blob | string, mime = 'text/markdown;charset=utf-8'): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
