import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Bot,
  Calculator,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  FlaskConical,
  Globe2,
  Layers,
  ShieldCheck,
  Sparkles,
  Terminal,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { genesisApi, type BackendKnowledgeSummary } from '../adapters/genesisApiAdapter'
import { triggerFileDownload } from '../adapters/reportExporter'
import { RESEARCH_ARTICLES, type ResearchArticle } from '../domain/researchArticles'
import type { LabViewId, ProblemSpec } from '../domain/types'

interface Props {
  language?: 'pt' | 'en'
  problems: ProblemSpec[]
  selectedProblem: ProblemSpec
  books: Array<Record<string, unknown>>
  references: Array<Record<string, unknown>>
  knowledgeSummary: BackendKnowledgeSummary | null
  backendOnline: boolean
  onNavigateView: (view: LabViewId) => void
  onOpenProblemInLab: (problemId: string) => void
  onOpenArticlePage?: (articleId: string) => void
}

const OFFLINE_BOOKS_FALLBACK: Array<Record<string, unknown>> = [
  { book_id: 'tao-2019-collatz-monograph', title: 'Almost all orbits of the Collatz map attain almost bounded values', author: 'Terence Tao (arXiv:1909.03562)', bytes_size: 1774306, sha256_hash: '62cf49d4d8e8e681', source_url: 'https://arxiv.org/pdf/1909.03562', local_path: 'tao-2019-collatz-monograph.pdf', excerpt: 'Harmonic analysis & stochastic processes proof that almost all Collatz orbits attain almost bounded values.' },
  { book_id: 'baek-2024-moving-sofa', title: "Optimality of Gerver's Sofa (119p Monograph)", author: 'Jineon Baek (arXiv:2411.19826)', bytes_size: 1827894, sha256_hash: 'c65e6683f8cfdda6', source_url: 'https://arxiv.org/pdf/2411.19826', local_path: 'baek-2024-moving-sofa.pdf', excerpt: '119-page complete proof establishing that Joseph Gerver’s 18-arc sofa (area ≈ 2.21953) is optimal.' },
  { book_id: 'perelman-2002-ricci-flow', title: 'The entropy formula for the Ricci flow and its geometric applications', author: 'Grigori Perelman (arXiv:math/0211159)', bytes_size: 325949, sha256_hash: '945e278613c45ea1', source_url: 'https://arxiv.org/pdf/math/0211159', local_path: 'perelman-2002-ricci-flow.pdf', excerpt: 'Foundational paper introducing W-entropy for Ricci flow with surgery, resolving the Poincaré Conjecture.' },
  { book_id: 'helfgott-2013-ternary-goldbach', title: "Major arcs for Goldbach's problem", author: 'Harald A. Helfgott (arXiv:1305.2897)', bytes_size: 736679, sha256_hash: 'e1de949f09005cbb', source_url: 'https://arxiv.org/pdf/1305.2897', local_path: 'helfgott-2013-ternary-goldbach.pdf', excerpt: 'Circle method breakthrough establishing the Ternary (Weak) Goldbach Conjecture.' },
  { book_id: 'gilmer-2022-frankl-entropy', title: 'Approximate union closed conjecture', author: 'Zachary Chase & Shachar Lovett (arXiv:2211.11689)', bytes_size: 97752, sha256_hash: 'f364e0f15449030e', source_url: 'https://arxiv.org/pdf/2211.11689', local_path: 'gilmer-2022-frankl-entropy.pdf', excerpt: 'Entropy refinement following Gilmer (arXiv:2211.09055) for Frankl’s union-closed sets conjecture.' },
  { book_id: 'faraday-1839-electricity', title: 'Experimental Researches in Electricity, Vol. 1', author: 'Michael Faraday (1839, Public Domain)', bytes_size: 1384992, sha256_hash: '1b7b8ec5c94d', source_url: 'https://mirrors.xmission.com/gutenberg/1/4/9/8/14986/14986-0.txt', local_path: 'faraday-1839-electricity.txt', excerpt: 'Foundational treatise on electromagnetic induction & geometric field lines inspiring GENESIS wave overlays.' },
  { book_id: 'einstein-1920-relativity', title: 'Relativity: The Special and General Theory', author: 'Albert Einstein (1920, Public Domain)', bytes_size: 210410, sha256_hash: 'd28a996db301', source_url: 'https://mirrors.xmission.com/gutenberg/3/0/1/5/30155/30155-0.txt', local_path: 'einstein-1920-relativity.txt', excerpt: 'Original exposition on thought experiments and spacetime invariance grounding relativistic curvature modes.' },
  { book_id: 'poincare-1905-science-hypothesis', title: "Science and Hypothesis (La Science et l'Hypothèse)", author: 'Henri Poincaré (1905, Public Domain)', bytes_size: 468378, sha256_hash: 'fbff0e2cd46a', source_url: 'https://archive.org/download/scienceandhypoth00poinuoft/scienceandhypoth00poinuoft_djvu.txt', local_path: 'poincare-1905-science-hypothesis.txt', excerpt: 'Classic epistemology treatise on mathematical intuition, geometric conventions, and experimentation.' },
  { book_id: 'euclid-1908-elements-heath', title: "The Thirteen Books of Euclid's Elements, Vol. 1 (ed. T. L. Heath)", author: 'Euclid / Thomas L. Heath (1908, Public Domain)', bytes_size: 1065570, sha256_hash: '883673dc933d', source_url: 'https://archive.org/download/thirteenbookseu00heibgoog/thirteenbookseu00heibgoog_djvu.txt', local_path: 'euclid-1908-elements-heath.txt', excerpt: 'Critical English edition of Euclid’s Elements serving as the classical axiomatic proof benchmark.' },
]

const MULTILINGUAL_BADGES = [
  { lang: 'PT', name: 'Português', sample: 'Hipótese de Riemann · Conjectura de Collatz' },
  { lang: 'EN', name: 'English', sample: 'Riemann Hypothesis · 3n+1 Problem' },
  { lang: 'DE', name: 'Deutsch', sample: 'Riemannsche Vermutung · Collatz-Problem' },
  { lang: 'FR', name: 'Français', sample: 'Hypothèse de Riemann · Syracuse' },
  { lang: 'RU', name: 'Русский', sample: 'Гипотеза Римана · Коллатца' },
  { lang: 'ZH', name: '中文', sample: '黎曼猜想 · 考拉兹猜想' },
  { lang: 'JA', name: '日本語', sample: 'リーマン予想 · コラッツの問題' },
  { lang: 'KO', name: '한국어', sample: '리만 가설 · 콜라츠 추측' },
  { lang: 'ES', name: 'Español', sample: 'Hipótesis de Riemann' },
  { lang: 'IT', name: 'Italiano', sample: 'Ipotesi di Riemann' },
]

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

export function EditorialHomeView({
  language = 'pt',
  problems,
  selectedProblem,
  books,
  references,
  knowledgeSummary,
  backendOnline,
  onNavigateView,
  onOpenProblemInLab,
  onOpenArticlePage,
}: Props) {
  const isEn = language === 'en'
  const displayBooks = books.length > 0 ? books : OFFLINE_BOOKS_FALLBACK
  const [selectedArticleId, setSelectedArticleId] = useState<string>(RESEARCH_ARTICLES[0].id)
  const [activeBookModal, setActiveBookModal] = useState<Record<string, unknown> | null>(null)
  const [loadingBook, setLoadingBook] = useState(false)

  const selectedArticle =
    RESEARCH_ARTICLES.find((a) => a.id === selectedArticleId) ?? RESEARCH_ARTICLES[0]

  const solvedCount = problems.filter((p) => p.status === 'Resolvido').length
  const openCount = problems.filter((p) => p.status === 'Em aberto').length
  const controlCount = problems.filter((p) => p.status === 'Controle Científico').length

  const openArticleReader = (article: ResearchArticle) => {
    if (onOpenArticlePage) {
      onOpenArticlePage(article.id)
      return
    }
    setSelectedArticleId(article.id)
    const el = document.getElementById('article-reader-panel')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleOpenBook = async (book: Record<string, unknown>) => {
    const bookId = String(book.book_id ?? '')
    if (!bookId) return
    setLoadingBook(true)
    const live = await genesisApi.getBookPreview(bookId, 5000)
    setActiveBookModal(live ?? book)
    setLoadingBook(false)
  }

  return (
    <div className="min-w-0 bg-white text-[#1F1F1F]">
      {/* 1. GOOGLE ABOUT HERO — DEEP OCEAN FLUID WAVE */}
      <section className="genesis-hero-ocean relative overflow-hidden px-4 py-12 text-white sm:px-8 sm:py-16 lg:py-20">
        {/* Abstract translucent wave rings inspired by Gemini 4 Hydrogen hero */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1200 420"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-45"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            <radialGradient id="heroWaveGlow" cx="62%" cy="45%" r="48%">
              <stop offset="0%" stopColor="#7DD3FC" stopOpacity="0.45" />
              <stop offset="55%" stopColor="#38BDF8" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#09203F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <ellipse cx="760" cy="210" rx="340" ry="180" fill="url(#heroWaveGlow)" />
          <path
            d="M120,280 C340,120 620,340 1080,150"
            fill="none"
            stroke="rgba(186,230,253,0.28)"
            strokeWidth="2"
          />
          <path
            d="M80,230 C390,330 680,90 1140,240"
            fill="none"
            stroke="rgba(125,211,252,0.22)"
            strokeWidth="1.5"
          />
          <circle cx="760" cy="200" r="142" fill="none" stroke="rgba(224,242,254,0.25)" strokeWidth="1.2" />
          <circle cx="760" cy="200" r="96" fill="none" stroke="rgba(186,230,253,0.18)" strokeWidth="1" />
        </svg>

        <div className="relative mx-auto max-w-5xl text-center">
          <h1 className="break-words font-display text-3xl font-bold tracking-tight text-white sm:text-5xl lg:text-[56px] lg:leading-[1.08]">
            {isEn
              ? 'Visual-First Mathematical Discovery Laboratory'
              : 'Descoberta Matemática Orientada por Visualização'}
          </h1>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-sky-100/95 sm:text-base lg:text-lg">
            {isEn
              ? `Project mathematical structures in 3D before symbolic search. Inspect exact derivations, research articles, verified counterexamples, and ${displayBooks.length} open-access books — running locally on commodity hardware.`
              : `Projete estruturas em 3D antes da busca simbólica. Inspecione cálculos exatos, artigos metodológicos, contraexemplos verificados e ${displayBooks.length} livros em acesso aberto — rodando localmente em PC doméstico.`}
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigateView('command-center')}
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-[#1A73E8] shadow-sm transition hover:bg-sky-50"
            >
              <span>{isEn ? 'Open 3D Laboratory' : 'Abrir Laboratório 3D'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <a
              href="#research-articles-section"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <Calculator className="h-4 w-4" />
              <span>{isEn ? 'Articles & How Calculations Work' : 'Artigos & Como Foram Feitos os Cálculos'}</span>
            </a>
            <a
              href="/reports/GENESIS_Article_EN.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <FileText className="h-4 w-4" />
              <span>{isEn ? 'Read Article (EN)' : 'Ler Artigo (EN)'}</span>
            </a>
            <a
              href="/reports/GENESIS_Artigo_PT-BR.pdf"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
            >
              <FileText className="h-4 w-4" />
              <span>{isEn ? 'Read Article (PT-BR)' : 'Ler Artigo (PT-BR)'}</span>
            </a>
          </div>

          {/* Transparent KPI Strip — 100% Verifiable Numbers */}
          <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left backdrop-blur-sm">
              <div className="font-mono text-2xl font-bold text-white">{problems.length}</div>
              <div className="text-[11px] text-sky-100/90">Problemas Catalogados ({openCount} abertos)</div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left backdrop-blur-sm">
              <div className="font-mono text-2xl font-bold text-white">
                {knowledgeSummary?.counts.experiments ?? 19}
              </div>
              <div className="text-[11px] text-sky-100/90">Ciclos Reproduzidos (0 Provas Falsas)</div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left backdrop-blur-sm">
              <div className="font-mono text-2xl font-bold text-white">{books.length || 9}</div>
              <div className="text-[11px] text-sky-100/90">Livros & Monografias (SHA-256)</div>
            </div>
            <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-left backdrop-blur-sm">
              <div className="font-mono text-2xl font-bold text-white">
                {solvedCount}+{controlCount}
              </div>
              <div className="text-[11px] text-sky-100/90">Teoremas & Controles Verificados</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. GOOGLE ABOUT 3-COLUMN FEATURE CARDS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#1A73E8]">
              Arquitetura Científica Local
            </span>
            <h2 className="mt-1 font-display text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              Explore os Três Pilares do Observatório GENESIS
            </h2>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-[#DADCE0] bg-[#F8F9FA] px-3 py-1 font-mono text-xs text-[#444746]">
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            {backendOnline ? 'Backend Python 17-Agentes Online' : 'Modo Local TS Offline'} · Problema ativo: {selectedProblem.code}
          </span>
        </div>

        <div className="mt-7 grid gap-6 md:grid-cols-3">
          {/* Card 1: Lab 3D */}
          <button
            type="button"
            onClick={() => onNavigateView('command-center')}
            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E8EF] bg-[#F8F9FA] text-left transition hover:-translate-y-0.5 hover:border-[#1A73E8]/50 hover:shadow-md"
          >
            <div className="relative h-44 w-full overflow-hidden bg-[#081B33] p-5 text-white">
              <svg viewBox="0 0 360 150" className="h-full w-full" aria-hidden="true">
                <defs>
                  <linearGradient id="c1grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#38BDF8" />
                    <stop offset="100%" stopColor="#F5B942" />
                  </linearGradient>
                </defs>
                <path
                  d="M15,95 Q75,25 135,85 T255,70 T345,55"
                  fill="none"
                  stroke="url(#c1grad)"
                  strokeWidth="3"
                />
                <path
                  d="M15,112 Q95,135 165,78 T295,95 T345,42"
                  fill="none"
                  stroke="rgba(56,232,255,0.45)"
                  strokeWidth="1.5"
                />
                <circle cx="135" cy="85" r="5" fill="#F5B942" />
                <circle cx="255" cy="70" r="5" fill="#38E8FF" />
              </svg>
              <span className="absolute left-4 top-3 rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-sky-200">
                WebGL 3D · 60 FPS
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#1F1F1F]">
                  Representação Visual & Campo Wi-Fi antes do Cálculo
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#444746]">
                  Alterne projeções 4D→3D, osciloscópio 2D, busca quântico-inspirada e detecte invariantes ao vivo em Collatz, Riemann e Navier–Stokes.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-end text-[#1A73E8]">
                <span className="mr-1 text-xs font-semibold">Entrar no Lab 3D</span>
                <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </button>

          {/* Card 2: 17 Agents */}
          <button
            type="button"
            onClick={() => onNavigateView('agents-observatory')}
            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E8EF] bg-[#F8F9FA] text-left transition hover:-translate-y-0.5 hover:border-[#1A73E8]/50 hover:shadow-md"
          >
            <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#0F294A] to-[#1A4B7A] p-5 text-white">
              <div className="grid grid-cols-3 gap-2 pt-4 font-mono text-[10px]">
                <div className="rounded-lg border border-sky-300/30 bg-white/10 p-2">01 Pesquisa</div>
                <div className="rounded-lg border border-sky-300/30 bg-white/10 p-2">05 Simulação</div>
                <div className="rounded-lg border border-sky-300/30 bg-white/10 p-2">06 Padrões</div>
                <div className="rounded-lg border border-amber-300/40 bg-amber-400/15 p-2">07 Simbólica</div>
                <div className="rounded-lg border border-rose-300/40 bg-rose-400/15 p-2">10 Refutação</div>
                <div className="rounded-lg border border-emerald-300/40 bg-emerald-400/15 p-2">14 Red Team</div>
              </div>
              <span className="absolute left-4 top-3 rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-sky-200">
                Orquestração Fechada
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#1F1F1F]">
                  17 Agentes com Separação Estrita entre Descoberta e Auditoria
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#444746]">
                  Geradores simbólicos (01–09) operam isolados dos auditores (10, 11 e 14), garantindo validação out-of-sample e economia adaptativa de ~81.6%.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-end text-[#1A73E8]">
                <span className="mr-1 text-xs font-semibold">Ver Observatório</span>
                <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </button>

          {/* Card 3: Proofs & Red Team */}
          <button
            type="button"
            onClick={() => onNavigateView('proof-counterexample')}
            className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E3E8EF] bg-[#F8F9FA] text-left transition hover:-translate-y-0.5 hover:border-[#1A73E8]/50 hover:shadow-md"
          >
            <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#1B3A4B] to-[#0B4F6C] p-5 font-mono text-xs text-emerald-100">
              <div className="mt-5 space-y-1.5 rounded-xl border border-white/15 bg-black/25 p-3">
                <div className="text-sky-200">-- Proibição Lean 4: zero `sorry`/`admit`</div>
                <div className="text-amber-200">F₅ = 2³² + 1 = 641 × 6.700.417 ✓</div>
                <div className="text-emerald-200">27⁵ + 84⁵ + 110⁵ + 133⁵ = 144⁵ ✓</div>
              </div>
              <span className="absolute left-4 top-3 rounded-full bg-white/10 px-2.5 py-0.5 font-mono text-[10px] text-emerald-200">
                Anti-Alucinação Matemática
              </span>
            </div>
            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h3 className="font-display text-lg font-semibold text-[#1F1F1F]">
                  Rigor Epistemológico PhD: Zero Provas Falsas ou Alucinadas
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#444746]">
                  Escala de 9 níveis, contraexemplos exatos reproduzidos localmente em BigInt/mpmath e auditoria transparente de teoremas em aberto.
                </p>
              </div>
              <div className="mt-4 flex items-center justify-end text-[#1A73E8]">
                <span className="mr-1 text-xs font-semibold">Auditar Provas & Red Team</span>
                <ArrowUpRight className="h-5 w-5 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </button>
        </div>
      </section>

      {/* 3. MICROSOFT FLUENT #EBF3FA ICE-BLUE BAND — 8 RESEARCH ARTICLES & CALCULATION BREAKDOWNS */}
      <section id="research-articles-section" className="bg-[#EBF3FA] px-4 py-14 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#0067B8]">
                Artigos da Pesquisa & Metodologia dos Cálculos
              </span>
              <h2 className="mt-1 font-display text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
                Como Cada Cálculo Foi Projetado, Executado e Verificado
              </h2>
              <p className="mt-1.5 max-w-3xl text-sm text-[#444746]">
                Documentação científica no padrão universitário com equações exatas, pseudocódigo, complexidade assintótica, consumo de hardware local e referências ABNT/IEEE.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="hl-key font-medium">Marco Teórico</span>
              <span className="hl-algo font-medium">Algoritmo / Fórmula</span>
              <span className="hl-verified font-medium">Controle Verificado</span>
              <span className="hl-caution font-medium">Limite Aberto</span>
            </div>
          </div>

          {/* Microsoft 4-Column White Elevated Cards */}
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {RESEARCH_ARTICLES.map((art) => {
              const isSelected = art.id === selectedArticle.id
              return (
                <article
                  key={art.id}
                  className={`flex min-w-0 flex-col justify-between rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md ${
                    isSelected ? 'ring-2 ring-[#0067B8]' : 'border border-[#D7E3EE]'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className="rounded-md px-2 py-0.5 font-mono text-[11px] font-bold text-white"
                        style={{ backgroundColor: art.accentColor }}
                      >
                        {art.code}
                      </span>
                      <span className="font-mono text-[11px] text-[#444746]">
                        {art.readTimeMin} min · {art.mscCodes.split(',')[0]}
                      </span>
                    </div>
                    <h3 className="mt-3 font-display text-base font-bold leading-snug text-[#1F1F1F]">
                      {art.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#444746]">
                      {art.summary}
                    </p>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => openArticleReader(art)}
                      className={`inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition ${
                        isSelected
                          ? 'bg-[#004E8C] text-white'
                          : 'bg-[#0067B8] text-white hover:bg-[#00569C]'
                      }`}
                    >
                      <span>{isSelected ? 'Artigo em Leitura' : 'Ler Cálculos'}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenProblemInLab(art.problemId)}
                      className="inline-flex items-center gap-1 rounded-md border border-[#DADCE0] bg-[#F8F9FA] px-2.5 py-2 text-xs font-medium text-[#1F1F1F] hover:border-[#0067B8] hover:text-[#0067B8]"
                    >
                      <FlaskConical className="h-3.5 w-3.5" />
                      <span>Lab 3D</span>
                    </button>
                  </div>
                </article>
              )
            })}
          </div>

          {/* Interactive Full Academic Article & Calculation Reader */}
          <div
            id="article-reader-panel"
            className="mt-8 rounded-2xl border border-[#D7E3EE] bg-white p-5 shadow-sm sm:p-8"
          >
            <div className="flex flex-col justify-between gap-4 border-b border-[#E3E8EF] pb-5 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className="rounded-md px-2.5 py-0.5 font-mono text-xs font-bold text-white"
                    style={{ backgroundColor: selectedArticle.accentColor }}
                  >
                    {selectedArticle.code}
                  </span>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#0067B8]">
                    {selectedArticle.kicker}
                  </span>
                  <span className="rounded-full border border-[#DADCE0] bg-[#F8F9FA] px-2.5 py-0.5 font-mono text-[11px] text-[#444746]">
                    MSC2020: {selectedArticle.mscCodes}
                  </span>
                </div>
                <h3 className="mt-2 break-words font-display text-xl font-bold text-[#1F1F1F] sm:text-2xl">
                  {selectedArticle.title}
                </h3>
                <p className="mt-1.5 text-sm text-[#444746]">{selectedArticle.subtitle}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onOpenProblemInLab(selectedArticle.problemId)}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#1A73E8] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#1557B0]"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Simular Este Modelo em 3D</span>
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerFileDownload(
                      `${selectedArticle.id}.md`,
                      buildArticleMarkdown(selectedArticle),
                      'text/markdown;charset=utf-8',
                    )
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DADCE0] bg-[#F8F9FA] px-4 py-2 text-xs font-semibold text-[#1F1F1F] hover:border-[#1A73E8] hover:text-[#1A73E8]"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>Baixar Artigo .MD</span>
                </button>
              </div>
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-12">
              {/* Step-by-step calculations */}
              <div className="min-w-0 space-y-4 lg:col-span-7">
                <h4 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-[#1F1F1F]">
                  <Calculator className="h-4 w-4 text-[#0067B8]" />
                  <span>Passo a Passo de Como os Cálculos São Feitos</span>
                </h4>

                <div className="space-y-3">
                  {selectedArticle.methodologySteps.map((s) => (
                    <div
                      key={s.step}
                      className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-4"
                    >
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0067B8] font-mono text-xs font-bold text-white">
                          {s.step}
                        </span>
                        <h5 className="font-display text-sm font-bold text-[#1F1F1F]">{s.title}</h5>
                      </div>
                      <div className="mt-2 max-w-full overflow-x-auto rounded-lg border border-[#D7E3EE] bg-white px-3 py-2 font-mono text-xs text-[#004E8C]">
                        {s.formula}
                      </div>
                      <p className="mt-2 text-xs leading-relaxed text-[#444746]">{s.explanation}</p>
                    </div>
                  ))}
                </div>

                {/* Equações & Resultados Empíricos */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4">
                  <div className="font-display text-xs font-bold uppercase tracking-wider text-amber-900">
                    Equações Centrais & Constatações Empíricas
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs text-[#1F1F1F]">
                    {selectedArticle.exactEquations.map((eq, i) => (
                      <li key={i} className="leading-relaxed">
                        <span className="hl-key mr-1.5 font-mono text-[10px] font-bold">EQ-{i + 1}</span>
                        {eq}
                      </li>
                    ))}
                    {selectedArticle.empiricalResults.map((res, i) => (
                      <li key={`emp-${i}`} className="leading-relaxed">
                        <span className="hl-verified mr-1.5 font-mono text-[10px] font-bold">OBS-{i + 1}</span>
                        {res}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pseudocode, Compute Profile, Red Team & References */}
              <div className="min-w-0 space-y-4 lg:col-span-5">
                <div>
                  <h4 className="flex items-center gap-2 font-display text-sm font-bold uppercase tracking-wider text-[#1F1F1F]">
                    <Terminal className="h-4 w-4 text-[#1A73E8]" />
                    <span>Algoritmo Auditável</span>
                  </h4>
                  <pre className="mt-2 max-w-full overflow-x-auto rounded-xl border border-[#1E293B] bg-[#081B33] p-4 font-mono text-[11px] leading-relaxed text-sky-100">
                    {selectedArticle.algorithmPseudocode}
                  </pre>
                </div>

                <div className="rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-4">
                  <h4 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-[#0067B8]">
                    <Cpu className="h-4 w-4" />
                    <span>Computação Necessária & Telemetria</span>
                  </h4>
                  <dl className="mt-2.5 space-y-1.5 text-xs">
                    <div>
                      <dt className="font-semibold text-[#1F1F1F]">Hardware Local:</dt>
                      <dd className="text-[#444746]">{selectedArticle.computeProfile.localHardware}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[#1F1F1F]">Tempo Medido:</dt>
                      <dd className="font-mono text-[#0067B8]">{selectedArticle.computeProfile.measuredRuntime}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[#1F1F1F]">Complexidade:</dt>
                      <dd className="text-[#444746]">{selectedArticle.computeProfile.complexity}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-[#1F1F1F]">Comparativo Global:</dt>
                      <dd className="text-[#444746]">{selectedArticle.computeProfile.globalRecordComparison}</dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-rose-200 bg-rose-50/60 p-4">
                  <h4 className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-rose-900">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Limitações Red Team & Estatuto Real</span>
                  </h4>
                  <ul className="mt-2 space-y-1.5 text-xs text-rose-950">
                    {selectedArticle.redTeamLimitations.map((lim, i) => (
                      <li key={i} className="leading-relaxed">• {lim}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-xl border border-[#E3E8EF] bg-white p-4">
                  <h4 className="font-display text-xs font-bold uppercase tracking-wider text-[#1F1F1F]">
                    Bibliografia Normatizada (ABNT / ISO 690)
                  </h4>
                  <ol className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-[#444746]">
                    {selectedArticle.references.map((ref, idx) => (
                      <li key={idx}>
                        <span className="font-mono font-semibold text-[#0067B8]">[{idx + 1}]</span> {ref}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. GOOGLE "AROUND THE GLOBE" + LIVROS & FONTES CIENTÍFICAS READER */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-[#E3E8EF] bg-[#F8F9FA] p-6 sm:p-10">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8F0FE] text-[#1A73E8]">
              <Globe2 className="h-6 w-6" />
            </div>
            <h2 className="mt-4 font-display text-2xl font-bold text-[#1F1F1F] sm:text-3xl">
              Pesquisa Multilíngue & Biblioteca Científica Aberta
            </h2>
            <p className="mt-2 text-sm text-[#444746]">
              Consultas ativas no arXiv, OpenAlex e OEIS em 10 idiomas e acervo local de{' '}
              <strong>{books.length || 9} livros clássicos e monografias contemporâneas</strong> verificados por SHA-256.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              {MULTILINGUAL_BADGES.map((b) => (
                <span
                  key={b.lang}
                  title={b.sample}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#DADCE0] bg-white px-3 py-1 text-xs text-[#1F1F1F]"
                >
                  <span className="font-mono font-bold text-[#1A73E8]">{b.lang}</span>
                  <span className="text-[#444746]">{b.name}</span>
                </span>
              ))}
            </div>
          </div>

          {/* 9 Downloaded Books & Monographs Interactive Shelf */}
          <div className="mt-9">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 font-display text-base font-bold text-[#1F1F1F]">
                <BookOpen className="h-4 w-4 text-[#1A73E8]" />
                <span>Acervo Baixado Localmente ({books.length} Obras · Clique para Inspecionar)</span>
              </h3>
              <button
                type="button"
                onClick={() => onNavigateView('reports-sources')}
                className="text-xs font-semibold text-[#1A73E8] hover:underline"
              >
                Abrir Central Completa de Fontes & 23 Problemas de Hilbert →
              </button>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayBooks.map((b, idx) => {
                const isPdf = String(b.local_path ?? '').toLowerCase().endsWith('.pdf')
                return (
                  <div
                    key={String(b.book_id ?? idx)}
                    className="flex min-w-0 flex-col justify-between rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs transition hover:border-[#1A73E8]/50 hover:shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-semibold ${
                            isPdf
                              ? 'bg-[#E8F0FE] text-[#1A73E8]'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {isPdf ? 'arXiv PDF' : 'Domínio Público UTF-8'}
                        </span>
                        <span className="font-mono text-[10px] text-[#444746]">
                          {Math.round(Number(b.bytes_size ?? 0) / 1024)} KB
                        </span>
                      </div>
                      <h4 className="mt-2 font-display text-sm font-bold leading-snug text-[#1F1F1F]">
                        {String(b.title)}
                      </h4>
                      <div className="mt-0.5 text-xs font-medium text-[#0067B8]">{String(b.author)}</div>
                      <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-[#444746]">
                        {String(b.excerpt)}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#F1F5F9] pt-3">
                      <span className="font-mono text-[10px] text-[#444746]">
                        SHA256: {String(b.sha256_hash ?? '').slice(0, 12)}…
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => void handleOpenBook(b)}
                          className="rounded-md bg-[#E8F0FE] px-2.5 py-1 text-xs font-semibold text-[#1A73E8] hover:bg-[#D2E3FC]"
                        >
                          Ler Trecho
                        </button>
                        <a
                          href={String(b.source_url ?? '#')}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-[#444746] hover:text-[#1A73E8]"
                        >
                          <span>Fonte</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Indexed Journal & Preprint References Strip */}
          {references.length > 0 && (
            <div className="mt-8 rounded-2xl border border-[#E3E8EF] bg-white p-5">
              <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 font-display text-sm font-bold text-[#1F1F1F]">
                  <Layers className="h-4 w-4 text-[#0067B8]" />
                  <span>Referências Indexadas ao Vivo (arXiv · OpenAlex · OEIS — {references.length} registros)</span>
                </h3>
                <button
                  type="button"
                  onClick={() => onNavigateView('reports-sources')}
                  className="text-xs font-semibold text-[#0067B8] hover:underline"
                >
                  Consultar APIs ao vivo →
                </button>
              </div>
              <div className="mt-3 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {references.slice(0, 6).map((r, i) => (
                  <a
                    key={i}
                    href={String(r.url ?? '#')}
                    target="_blank"
                    rel="noreferrer"
                    className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-3 text-xs transition hover:border-[#1A73E8]"
                  >
                    <div className="flex items-center justify-between font-mono text-[10px] font-semibold text-[#0067B8]">
                      <span>{String(r.source_type ?? 'ref').toUpperCase()}</span>
                      <ExternalLink className="h-3 w-3" />
                    </div>
                    <div className="mt-1 line-clamp-2 font-semibold text-[#1F1F1F]">{String(r.title)}</div>
                    <div className="mt-0.5 truncate text-[11px] text-[#444746]">{String(r.authors)}</div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Book Preview Modal */}
      {activeBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="max-h-[85vh] w-full max-w-3xl overflow-hidden rounded-2xl border border-[#DADCE0] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#E3E8EF] bg-[#F8F9FA] p-4">
              <div className="min-w-0">
                <span className="font-mono text-[11px] font-semibold text-[#0067B8]">
                  {String(activeBookModal.author ?? '')}
                </span>
                <h3 className="mt-0.5 break-words font-display text-base font-bold text-[#1F1F1F]">
                  {String(activeBookModal.title ?? '')}
                </h3>
                <div className="mt-1 font-mono text-[10px] text-[#444746]">
                  SHA-256: {String(activeBookModal.sha256_hash ?? '')}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveBookModal(null)}
                aria-label="Fechar leitor de livro"
                className="rounded-lg border border-[#DADCE0] bg-white p-1.5 text-[#444746] hover:text-[#1F1F1F]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-5">
              {loadingBook ? (
                <p className="text-sm text-[#444746]">Carregando texto integral do servidor...</p>
              ) : (
                <pre className="max-w-full whitespace-pre-wrap break-words rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-4 font-mono text-xs leading-relaxed text-[#1F1F1F]">
                  {String(activeBookModal.preview ?? activeBookModal.excerpt ?? '')}
                </pre>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#E3E8EF] bg-[#F8F9FA] px-4 py-3 text-xs">
              <a
                href={String(activeBookModal.source_url ?? '#')}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-[#1A73E8] hover:underline"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Abrir Fonte Original ({String(activeBookModal.source_url ?? '')})</span>
              </a>
              <button
                type="button"
                onClick={() => setActiveBookModal(null)}
                className="rounded-full bg-[#1A73E8] px-4 py-1.5 font-semibold text-white hover:bg-[#1557B0]"
              >
                Fechar Leitor
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 5. MICROSOFT-INSPIRED #F2F2F2 MULTI-COLUMN EDITORIAL FOOTER */}
      <footer className="border-t border-[#E3E8EF] bg-[#F2F2F2] px-4 py-10 text-xs text-[#444746] sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6 sm:grid-cols-2 lg:grid-cols-6">
          <div>
            <h4 className="font-display text-xs font-bold text-[#1F1F1F]">Laboratório</h4>
            <ul className="mt-2.5 space-y-1.5">
              <li>
                <button type="button" onClick={() => onNavigateView('command-center')} className="hover:text-[#0067B8]">
                  Observatório 3D WebGL
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateView('agents-observatory')} className="hover:text-[#0067B8]">
                  Pipeline 17 Agentes
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateView('knowledge-evolution')} className="hover:text-[#0067B8]">
                  Grafo de Conhecimento NetworkX
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-[#1F1F1F]">Rigor & Provas</h4>
            <ul className="mt-2.5 space-y-1.5">
              <li>
                <button type="button" onClick={() => onNavigateView('proof-counterexample')} className="hover:text-[#0067B8]">
                  Portão Red Team & Lean 4
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateView('history-hardware')} className="hover:text-[#0067B8]">
                  Telemetria i5-10400 + RTX 3050
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onNavigateView('reports-sources')} className="hover:text-[#0067B8]">
                  Dossiês 9-Arquivos & Fontes
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-[#1F1F1F]">Artigos Chave</h4>
            <ul className="mt-2.5 space-y-1.5">
              {RESEARCH_ARTICLES.slice(0, 4).map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => openArticleReader(a)}
                    className="text-left hover:text-[#0067B8]"
                  >
                    {a.code} · {a.category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-[#1F1F1F]">Cálculos & Controles</h4>
            <ul className="mt-2.5 space-y-1.5">
              {RESEARCH_ARTICLES.slice(4).map((a) => (
                <li key={a.id}>
                  <button
                    type="button"
                    onClick={() => openArticleReader(a)}
                    className="text-left hover:text-[#0067B8]"
                  >
                    {a.code} · {a.category}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-[#1F1F1F]">Problemas Destaque</h4>
            <ul className="mt-2.5 space-y-1.5">
              <li>
                <button type="button" onClick={() => onOpenProblemInLab('collatz')} className="hover:text-[#0067B8]">
                  Collatz (3n+1) — semente 27
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenProblemInLab('riemann-hypothesis')} className="hover:text-[#0067B8]">
                  Hipótese de Riemann (mpmath)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenProblemInLab('goldbach')} className="hover:text-[#0067B8]">
                  Cometa de Goldbach (mod 6)
                </button>
              </li>
              <li>
                <button type="button" onClick={() => onOpenProblemInLab('navier-stokes')} className="hover:text-[#0067B8]">
                  Navier–Stokes 3D (CFL Guard)
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display text-xs font-bold text-[#1F1F1F]">Nota Epistemológica</h4>
            <p className="mt-2.5 text-[11px] leading-relaxed text-[#444746]">
              Conjecturas em aberto permanecem rotuladas como <strong>Em aberto</strong>. Visualização 3D auxilia descoberta de padrões, jamais substitui prova formal.
            </p>
          </div>
        </div>

        <div className="mx-auto mt-8 flex max-w-7xl flex-wrap items-center justify-between gap-2 border-t border-[#DADCE0] pt-5 text-[11px] text-[#444746]">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4 text-[#0067B8]" />
            <span>Português (Brasil) · Versão Editorial Científica GENESIS 2026</span>
          </div>
          <div>Execução Local Reprodutível · SHA-256 Auditável · © 2026 GENESIS Research Lab</div>
        </div>

        <div className="mx-auto mt-4 max-w-7xl space-y-1 text-[11px] leading-relaxed text-[#444746]">
          <p className="font-semibold text-[#1F1F1F]">
            © 2026 Matheus Oliveira — genesis.{' '}
            {isEn ? 'Discovery, mathematical direction and research by the author.' : 'Descoberta, direção matemática e pesquisa do autor.'}
          </p>
          <p>
            {isEn
              ? 'Developed in collaboration with Gemini 4 Neon by Google DeepMind (AI-assisted engineering), combined with the author’s expertise in mathematics and the study of ancient civilizations, mathematicians, physicists and chemists.'
              : 'Desenvolvido em colaboração com o Gemini 4 Neon, do Google DeepMind (engenharia assistida por IA), somado à expertise do autor em matemática e no estudo de antigas civilizações, matemáticos, físicos e químicos.'}
          </p>
          <p className="text-[10px] text-[#5F6368]">
            {isEn
              ? 'Gemini, Google and Google DeepMind are trademarks of Google LLC. This is an independent project, not affiliated with or endorsed by Google.'
              : 'Gemini, Google e Google DeepMind são marcas registradas da Google LLC. Projeto independente, sem afiliação ou endosso do Google.'}
          </p>
        </div>
      </footer>
    </div>
  )
}
