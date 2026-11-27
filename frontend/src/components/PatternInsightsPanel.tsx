import { BookText, Download, FileCode2, Lightbulb, ShieldAlert } from 'lucide-react'
import type { PatternInsightReport, ProblemSpec } from '../domain/types'

interface Props {
  problem: ProblemSpec
  insights: PatternInsightReport
  notes: string
  onChangeNotes: (val: string) => void
  onExportMarkdown: () => void
  onExportPdf: () => void
}

export function PatternInsightsPanel({
  problem,
  insights,
  notes,
  onChangeNotes,
  onExportMarkdown,
  onExportPdf,
}: Props) {
  return (
    <div className="min-w-0 space-y-3 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1A73E8]">
          <Lightbulb className="h-4 w-4 text-amber-600" />
          <span>Leitura de Padrões & Algoritmo Sintetizado (Visual → Código)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onExportMarkdown}
            className="flex items-center gap-1 rounded-full border border-[#DADCE0] bg-[#F8F9FA] px-3 py-1 text-[11px] font-medium text-[#1F1F1F] hover:border-[#1A73E8]"
          >
            <FileCode2 className="h-3 w-3" /> Markdown
          </button>
          <button
            type="button"
            onClick={onExportPdf}
            className="flex items-center gap-1 rounded-full bg-[#0067B8] px-3 py-1 text-[11px] font-semibold text-white hover:bg-[#00569C]"
          >
            <Download className="h-3 w-3" /> PDF Científico
          </button>
        </div>
      </div>

      {/* Philosophy & Epistemological Separation Banner */}
      <div className="grid gap-2 md:grid-cols-2">
        <div className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#EBF3FA]/65 p-2.5 text-[11px]">
          <span className="font-bold text-[#0067B8]">Inspiração Filosófica / Hermética:</span>{' '}
          <span className="text-[#1F1F1F]">{problem.hermeticPrinciple}</span>
          <p className="mt-1 text-[#444746]">{problem.philosophicalNote}</p>
        </div>

        <div className="min-w-0 rounded-xl border border-amber-200 bg-amber-50/75 p-2.5 text-[11px]">
          <div className="flex items-center gap-1 font-bold text-amber-900">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0" />
            <span>Correspondência Física: {problem.physicsTier}</span>
          </div>
          <p className="mt-1 text-[#444746]">{problem.physicsRationale}</p>
        </div>
      </div>

      {/* Detected Visual Patterns */}
      <div className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
        <div className="mb-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-[#1F1F1F]">
          <span>Sinais Visuais & Regime ({insights.regimeLabel})</span>
          <span className="font-mono text-[10px] font-semibold text-[#0067B8]">
            Simetria {(insights.symmetryScore * 100).toFixed(0)}% · f_dom {insights.dominantFrequency}
          </span>
        </div>
        <ul className="space-y-1 text-xs text-[#1F1F1F]">
          {insights.visualCues.map((cue, i) => (
            <li key={i} className="flex items-start gap-1.5">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#1A73E8]" />
              <span>{cue}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Visual -> Algorithm -> Calculation */}
      <div className="min-w-0 rounded-xl border border-[#1E293B] bg-[#081B33] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px]">
          <span className="font-bold text-amber-300">Hipótese & Regra Sintetizada pela Visualização</span>
          <span className="font-mono text-emerald-300">
            Economia estimada {insights.adaptiveSavingsPercent}% ({insights.adaptiveEvaluations} vs{' '}
            {insights.bruteForceEvaluations} pts)
          </span>
        </div>
        <pre className="mt-1.5 max-w-full overflow-x-auto whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-sky-100">
          {insights.synthesizedRule}
        </pre>
        <p className="mt-1.5 text-[11px] text-sky-200">
          <strong className="text-amber-300">Próxima hipótese:</strong> {insights.nextHypothesis}
        </p>
      </div>

      {/* Persistent Researcher Notebook */}
      <div className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5">
        <label className="mb-1 flex items-center gap-1.5 text-[11px] font-bold text-[#444746]">
          <BookText className="h-3.5 w-3.5 text-[#1A73E8]" />
          <span>Diário de Pesquisa Local ({problem.code}) — Salvo Automaticamente</span>
        </label>
        <textarea
          rows={2}
          value={notes}
          onChange={(e) => onChangeNotes(e.target.value)}
          placeholder="Registre observações visuais, anomalias encontradas e próximas hipóteses a testar..."
          className="w-full rounded-lg border border-[#DADCE0] bg-white p-2 text-xs text-[#1F1F1F] placeholder:text-[#5F6368] focus:border-[#1A73E8] focus:outline-none"
        />
      </div>
    </div>
  )
}
