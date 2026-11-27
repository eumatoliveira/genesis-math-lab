import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Cpu,
  FileText,
  ShieldCheck,
  Sparkles,
  Terminal,
} from 'lucide-react'
import { triggerFileDownload } from '../adapters/reportExporter'
import { RESEARCH_ARTICLES, type ResearchArticle } from '../domain/researchArticles'

interface Props {
  article: ResearchArticle
  language: 'pt' | 'en'
  onBack: () => void
  onSelectArticle: (id: string) => void
  onOpenProblemInLab: (problemId: string) => void
}

function buildArticleMarkdown(article: ResearchArticle): string {
  return [
    `# ${article.code}: ${article.title}`,
    `**Categoria:** ${article.category} · **MSC2020:** ${article.mscCodes}`,
    `**Estatuto Epistemológico:** ${article.epistemologicalTier}`,
    '',
    `> ${article.subtitle}`,
    '',
    '## Resumo Executivo',
    article.summary,
    '',
    '## Passo a Passo de Como os Cálculos Foram Feitos',
    ...article.methodologySteps.map(
      (s) => `### Etapa ${s.step} — ${s.title}\n- **Fórmula:** \`${s.formula}\`\n- ${s.explanation}`,
    ),
    '',
    '## Equações e Resultados Centrais',
    ...article.exactEquations.map((eq) => `- ${eq}`),
    '',
    '## Algoritmo Executado',
    '```text',
    article.algorithmPseudocode,
    '```',
    '',
    '## Computação & Hardware',
    `- **Hardware:** ${article.computeProfile.localHardware}`,
    `- **Tempo medido:** ${article.computeProfile.measuredRuntime}`,
    `- **Complexidade:** ${article.computeProfile.complexity}`,
    `- **Escopo local vs global:** ${article.computeProfile.globalRecordComparison}`,
    '',
    '## Auditoria Red Team & Limitações',
    ...article.redTeamLimitations.map((lim) => `- ${lim}`),
    '',
    '## Bibliografia (ABNT / ISO 690)',
    ...article.references.map((r, i) => `${i + 1}. ${r}`),
    '',
  ].join('\n')
}

export function ArticleDetailPage({
  article,
  language,
  onBack,
  onSelectArticle,
  onOpenProblemInLab,
}: Props) {
  const isEn = language === 'en'
  const idx = RESEARCH_ARTICLES.findIndex((a) => a.id === article.id)
  const prevArt = idx > 0 ? RESEARCH_ARTICLES[idx - 1] : null
  const nextArt = idx < RESEARCH_ARTICLES.length - 1 ? RESEARCH_ARTICLES[idx + 1] : null

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1F1F1F]">
      {/* Dedicated Article Hero Header */}
      <div className="genesis-hero-ocean px-4 py-10 text-white sm:px-8">
        <div className="mx-auto max-w-5xl">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{isEn ? 'Back to Articles & Methodology' : 'Voltar aos Artigos & Metodologia'}</span>
          </button>

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span
              className="rounded-md px-2.5 py-0.5 font-mono text-xs font-bold text-white"
              style={{ backgroundColor: article.accentColor }}
            >
              {article.code}
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-200">
              {article.kicker}
            </span>
            <span className="rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 font-mono text-[11px] text-sky-100">
              MSC2020: {article.mscCodes}
            </span>
          </div>

          <h1 className="mt-3 break-words font-display text-2xl font-bold tracking-tight text-white sm:text-4xl">
            {article.title}
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-sky-100/95 sm:text-base">
            {article.subtitle}
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => onOpenProblemInLab(article.problemId)}
              className="inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-xs font-semibold text-[#1A73E8] shadow-sm transition hover:bg-sky-50"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>{isEn ? 'Simulate This Model in 3D' : 'Simular Este Modelo em 3D'}</span>
            </button>
            <button
              type="button"
              onClick={() =>
                triggerFileDownload(
                  `${article.id}.md`,
                  buildArticleMarkdown(article),
                  'text/markdown;charset=utf-8',
                )
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-white/40 bg-white/10 px-4 py-2 text-xs font-semibold text-white hover:bg-white/20"
            >
              <FileText className="h-3.5 w-3.5" />
              <span>{isEn ? 'Download Article .MD' : 'Baixar Artigo .MD'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Exclusive Full-Page Scientific Content */}
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
        <div className="rounded-2xl border border-[#D7E3EE] bg-white p-5 shadow-sm sm:p-8">
          <div className="rounded-xl border-l-4 border-[#1A73E8] bg-[#EBF3FA]/60 p-4 text-sm leading-relaxed text-[#1F1F1F]">
            <div className="mb-1 text-xs font-bold uppercase tracking-wider text-[#0067B8]">
              {isEn ? 'Executive Summary' : 'Resumo Executivo'} · {article.epistemologicalTier}
            </div>
            {article.summary}
          </div>

          <div className="mt-7 grid gap-6 lg:grid-cols-12">
            <div className="min-w-0 space-y-4 lg:col-span-7">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#1F1F1F]">
                <Calculator className="h-4 w-4 text-[#0067B8]" />
                <span>
                  {isEn
                    ? 'Step-by-Step Mathematical Calculations'
                    : 'Passo a Passo de Como os Cálculos São Feitos'}
                </span>
              </h2>

              <div className="space-y-3">
                {article.methodologySteps.map((s) => (
                  <div key={s.step} className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-4">
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0067B8] font-mono text-xs font-bold text-white">
                        {s.step}
                      </span>
                      <h3 className="font-display text-sm font-bold text-[#1F1F1F]">{s.title}</h3>
                    </div>
                    <div className="mt-2 max-w-full overflow-x-auto rounded-lg border border-[#D7E3EE] bg-white px-3 py-2 font-mono text-xs text-[#004E8C]">
                      {s.formula}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-[#444746]">{s.explanation}</p>
                  </div>
                ))}
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                <div className="font-display text-xs font-bold uppercase tracking-wider text-amber-900">
                  {isEn ? 'Core Equations & Empirical Findings' : 'Equações Centrais & Constatações Empíricas'}
                </div>
                <ul className="mt-2 space-y-1.5 text-xs text-[#1F1F1F]">
                  {article.exactEquations.map((eq, i) => (
                    <li key={i} className="leading-relaxed">
                      <span className="hl-key mr-1.5 font-mono text-[10px] font-bold">EQ-{i + 1}</span>
                      {eq}
                    </li>
                  ))}
                  {article.empiricalResults.map((res, i) => (
                    <li key={`emp-${i}`} className="leading-relaxed">
                      <span className="hl-verified mr-1.5 font-mono text-[10px] font-bold">OBS-{i + 1}</span>
                      {res}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="min-w-0 space-y-4 lg:col-span-5">
              <div>
                <h2 className="flex items-center gap-2 font-display text-base font-bold text-[#1F1F1F]">
                  <Terminal className="h-4 w-4 text-[#1A73E8]" />
                  <span>{isEn ? 'Auditable Algorithm' : 'Algoritmo Auditável'}</span>
                </h2>
                <pre className="mt-2 max-w-full overflow-x-auto rounded-xl border border-[#1E293B] bg-[#081B33] p-4 font-mono text-[11px] leading-relaxed text-sky-100">
                  {article.algorithmPseudocode}
                </pre>
              </div>

              <div className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-4">
                <h3 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-[#0067B8]">
                  <Cpu className="h-4 w-4" />
                  <span>{isEn ? 'Compute Profile & Telemetry' : 'Computação Necessária & Telemetria'}</span>
                </h3>
                <dl className="mt-2.5 space-y-1.5 text-xs">
                  <div>
                    <dt className="font-semibold text-[#1F1F1F]">Hardware:</dt>
                    <dd className="text-[#444746]">{article.computeProfile.localHardware}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#1F1F1F]">Runtime:</dt>
                    <dd className="font-mono text-[#0067B8]">{article.computeProfile.measuredRuntime}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#1F1F1F]">Complexity:</dt>
                    <dd className="text-[#444746]">{article.computeProfile.complexity}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-[#1F1F1F]">Global Comparison:</dt>
                    <dd className="text-[#444746]">{article.computeProfile.globalRecordComparison}</dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                <h3 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-rose-900">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{isEn ? 'Red-Team Limitations' : 'Limitações Red Team & Estatuto Real'}</span>
                </h3>
                <ul className="mt-2 space-y-1.5 text-xs text-rose-950">
                  {article.redTeamLimitations.map((lim, i) => (
                    <li key={i} className="leading-relaxed">
                      • {lim}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border border-[#E3E8EF] bg-white p-4">
                <h3 className="font-display text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                  {isEn ? 'References (ABNT / ISO 690)' : 'Bibliografia Normatizada (ABNT / ISO 690)'}
                </h3>
                <ol className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#444746]">
                  {article.references.map((ref, i) => (
                    <li key={i}>
                      <span className="font-mono font-semibold text-[#0067B8]">[{i + 1}]</span> {ref}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>

        {/* Previous / Next Article Navigation */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          {prevArt ? (
            <button
              type="button"
              onClick={() => onSelectArticle(prevArt.id)}
              className="inline-flex items-center gap-2 rounded-full border border-[#DADCE0] bg-white px-4 py-2 text-xs font-semibold text-[#1F1F1F] hover:border-[#1A73E8] hover:text-[#1A73E8]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>
                {prevArt.code}: {prevArt.category}
              </span>
            </button>
          ) : (
            <div />
          )}

          {nextArt && (
            <button
              type="button"
              onClick={() => onSelectArticle(nextArt.id)}
              className="inline-flex items-center gap-2 rounded-full bg-[#0067B8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#00569C]"
            >
              <span>
                {nextArt.code}: {nextArt.category}
              </span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
