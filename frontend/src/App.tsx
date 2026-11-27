import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  genesisApi,
  type BackendAgentInfo,
  type BackendHardwareSnapshot,
  type BackendKnowledgeGraph,
  type BackendKnowledgeSummary,
} from './adapters/genesisApiAdapter'
import { buildMarkdownReport, buildPdfReportBlob, triggerFileDownload } from './adapters/reportExporter'
import { storageAdapter } from './adapters/storageAdapter'
import { ControlDeck } from './components/ControlDeck'
import { EditorialHomeView } from './components/EditorialHomeView'
import { InfiniteSearchPanel } from './components/InfiniteSearchPanel'
import {
  AgentsObservatoryView,
  HistoryHardwareView,
  KnowledgeEvolutionView,
  ProofCounterexampleView,
  ReportsSourcesView,
} from './components/LabWorkspaces'
import { PatternInsightsPanel } from './components/PatternInsightsPanel'
import { ProblemSidebar } from './components/ProblemSidebar'
import { TopNavBar } from './components/TopNavBar'
import { ALL_PROBLEMS, getProblemById } from './domain/problemsCatalog'
import type {
  DiscoveryHit,
  HardwareProfile,
  LabViewId,
  ProblemSpec,
  ProjectionMode,
  SearchState,
  SearchStrategy,
} from './domain/types'
import { computeSimulationFrame } from './engines'
import { stepAutonomousSearch } from './engines/infiniteSearchEngine'
import { detectVisualPatterns } from './engines/patternDetectorEngine'
import { telemetry } from './observability/telemetry'
import { ObservatoryCanvas3D, type CameraPreset } from './visualizers/ObservatoryCanvas3D'
import { Oscilloscope2D } from './visualizers/Oscilloscope2D'

function initialSearchState(params: Record<string, number>): SearchState {
  return {
    running: false,
    strategy: 'quantum-inspired',
    iterations: 0,
    ratePerSec: 0,
    bestResidual: Infinity,
    bestCoherence: 0.5,
    bestParams: { ...params },
    residualHistory: [],
    hits: [],
  }
}

export function App() {
  const [selectedProblem, setSelectedProblem] = useState<ProblemSpec>(() => getProblemById('genesis-wave'))
  const [params, setParams] = useState<Record<string, number>>(() => ({ ...getProblemById('genesis-wave').defaultParams }))
  const [activeView, setActiveView] = useState<LabViewId>('research-home')
  const [language, setLanguage] = useState<'pt' | 'en'>('pt')
  const [hardwareProfile, setHardwareProfile] = useState<HardwareProfile>(() => storageAdapter.getHardwareProfile())
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)

  // Visual controls (Visual-First + Wi-Fi physical field ON by default)
  const [playing, setPlaying] = useState(true)
  const [speed, setSpeed] = useState(1.0)
  const [simTime, setSimTime] = useState(0)
  const [wifiEnabled, setWifiEnabled] = useState(true)
  const [adaptiveOverlay, setAdaptiveOverlay] = useState(true)
  const [showSurface, setShowSurface] = useState(true)
  const [showWireframe, setShowWireframe] = useState(true)
  const [showParticles, setShowParticles] = useState(true)
  const [compareSplit, setCompareSplit] = useState(false)
  const [projection, setProjection] = useState<ProjectionMode>('cartesian_3d')
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('orbit-35')
  const [cameraAngle, setCameraAngle] = useState(35)

  // Pattern notes & Infinite Search state
  const [notes, setNotes] = useState(() => storageAdapter.getNote('genesis-wave'))
  const [searchState, setSearchState] = useState<SearchState>(() =>
    initialSearchState(getProblemById('genesis-wave').defaultParams),
  )

  // Live Backend Python 17-Agent Integration State
  const [backendOnline, setBackendOnline] = useState(false)
  const [runningBackendCycle, setRunningBackendCycle] = useState(false)
  const [agents, setAgents] = useState<BackendAgentInfo[]>([])
  const [recentEvents, setRecentEvents] = useState<Array<Record<string, unknown>>>([])
  const [hardware, setHardware] = useState<BackendHardwareSnapshot | null>(null)
  const [knowledgeSummary, setKnowledgeSummary] = useState<BackendKnowledgeSummary | null>(null)
  const [knowledgeGraph, setKnowledgeGraph] = useState<BackendKnowledgeGraph | null>(null)
  const [experiments, setExperiments] = useState<Array<Record<string, unknown>>>([])
  const [hypotheses, setHypotheses] = useState<Array<Record<string, unknown>>>([])
  const [counterexamples, setCounterexamples] = useState<Array<Record<string, unknown>>>([])
  const [rejections, setRejections] = useState<Array<Record<string, unknown>>>([])
  const [books, setBooks] = useState<Array<Record<string, unknown>>>([])
  const [references, setReferences] = useState<Array<Record<string, unknown>>>([])
  const [multilingualTerms, setMultilingualTerms] = useState<Record<string, string>>({})
  const [problemFiles, setProblemFiles] = useState<Array<{ name: string; size_bytes: number }>>([])
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const canvas3dRef = useRef<HTMLCanvasElement | null>(null)
  const canvas2dRef = useRef<HTMLCanvasElement | null>(null)
  const simTimeRef = useRef(0)
  const toastTimerRef = useRef<number | null>(null)

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg)
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current)
    }
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null)
      toastTimerRef.current = null
    }, 4000)
  }, [])

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current)
      }
    }
  }, [])

  const refreshBackendData = useCallback(async (probId: string) => {
    const health = await genesisApi.checkHealth()
    if (!health) {
      setBackendOnline(false)
      return
    }
    setBackendOnline(true)
    const [ag, hw, ks, kg, ex, hy, ce, rj, bk, rf, pf] = await Promise.all([
      genesisApi.getAgents(),
      genesisApi.getHardware(),
      genesisApi.getKnowledgeSummary(),
      genesisApi.getKnowledgeGraph(),
      genesisApi.listExperiments(),
      genesisApi.listHypotheses(),
      genesisApi.listCounterexamples(),
      genesisApi.listRejections(),
      genesisApi.listBooks(),
      genesisApi.listReferences(probId),
      genesisApi.listProblemFiles(probId),
    ])
    if (ag) {
      setAgents(ag.agents)
      setRecentEvents(ag.recent_events)
    }
    if (hw) setHardware(hw)
    if (ks) setKnowledgeSummary(ks)
    if (kg) setKnowledgeGraph(kg)
    setExperiments(ex)
    setHypotheses(hy)
    setCounterexamples(ce)
    setRejections(rj)
    setBooks(bk)
    if (rf) {
      setReferences(rf.items)
      setMultilingualTerms(rf.multilingual)
    }
    setProblemFiles(pf)
  }, [])

  useEffect(() => {
    void refreshBackendData(selectedProblem.id)
    const timer = window.setInterval(() => {
      void refreshBackendData(selectedProblem.id)
    }, 10000)
    return () => window.clearInterval(timer)
  }, [selectedProblem.id, refreshBackendData])

  // Real-time Animation & Bounded Continuous Discovery Search Loop (only active on 3D view or when running)
  useEffect(() => {
    const needsAnimation = activeView === 'command-center' && playing
    if (!needsAnimation && !searchState.running) return
    let rafId = 0
    let lastTs = performance.now()
    let searchAccMs = 0

    const tick = (now: number) => {
      const dtSec = Math.min(0.08, Math.max(0.008, (now - lastTs) / 1000))
      lastTs = now
      if (needsAnimation) {
        simTimeRef.current += dtSec * speed
        setSimTime(simTimeRef.current)
      }
      searchAccMs += dtSec * 1000
      if (searchState.running && searchAccMs >= 90) {
        const elapsed = searchAccMs
        searchAccMs = 0
        setSearchState((prev) => stepAutonomousSearch(selectedProblem, prev, simTimeRef.current, hardwareProfile, projection, elapsed))
      }
      rafId = window.requestAnimationFrame(tick)
    }
    rafId = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(rafId)
  }, [activeView, playing, speed, searchState.running, selectedProblem, hardwareProfile, projection])

  const activeParams = useMemo(() => {
    return Object.keys(params).length ? params : selectedProblem.defaultParams
  }, [params, selectedProblem])

  const frame = useMemo(
    () => computeSimulationFrame(selectedProblem, activeParams, simTime, hardwareProfile, projection),
    [selectedProblem, activeParams, simTime, hardwareProfile, projection],
  )

  const controlComparisonFrame = useMemo(() => {
    if (!compareSplit) return null
    return computeSimulationFrame(selectedProblem, selectedProblem.defaultParams, simTime, hardwareProfile, projection)
  }, [compareSplit, selectedProblem, simTime, hardwareProfile, projection])

  const insights = useMemo(() => detectVisualPatterns(selectedProblem, frame), [selectedProblem, frame])

  const handleSelectProblem = (prob: ProblemSpec) => {
    setSelectedProblem(prob)
    setParams({ ...prob.defaultParams })
    setNotes(storageAdapter.getNote(prob.id))
    setSearchState(initialSearchState(prob.defaultParams))
    telemetry.log('info', 'Observatory', `Selecionado ${prob.code} (${prob.id}) [${prob.engine}]`)
  }

  const handleChangeParam = (key: string, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }))
  }

  const handleResetParams = () => {
    setParams({ ...selectedProblem.defaultParams })
  }

  const handleChangeProfile = (prof: HardwareProfile) => {
    setHardwareProfile(prof)
    storageAdapter.setHardwareProfile(prof)
    showToast(`Perfil de hardware ajustado para ${prof.toUpperCase()}.`)
  }

  const handleChangeNotes = (val: string) => {
    setNotes(val)
    storageAdapter.setNote(selectedProblem.id, val)
  }

  const handleReplayHit = (hitParams: DiscoveryHit['params']) => {
    setParams({ ...hitParams })
    setPlaying(true)
    showToast('Parâmetros de destaque carregados diretamente na simulação 3D.')
  }

  const handleRunBackendCycle = async () => {
    setRunningBackendCycle(true)
    const res = await genesisApi.runDiscoveryCycle(selectedProblem.id, 'balanced', 'adaptive', projection)
    if (res) {
      showToast(`Ciclo 17-Agentes concluído (${String(res.cycle_id ?? '')}) — dossiê PDF+MD gerado!`)
      await refreshBackendData(selectedProblem.id)
    } else {
      showToast('Backend Python offline — mantendo análise Visual-First local no navegador.')
    }
    setRunningBackendCycle(false)
  }

  const handleExportMarkdown = () => {
    const md = buildMarkdownReport({
      problem: selectedProblem,
      params: activeParams,
      frame,
      insights,
      searchState,
      userNotes: notes,
    })
    triggerFileDownload(`GENESIS-${selectedProblem.code}-${selectedProblem.id}.md`, md, 'text/markdown;charset=utf-8')
    showToast('Relatório científico Markdown exportado com equações e síntese visual.')
  }

  const handleExportPdf = () => {
    let c3d: string | null = null
    let c2d: string | null = null
    try {
      c3d = canvas3dRef.current?.toDataURL('image/png') ?? null
      c2d = canvas2dRef.current?.toDataURL('image/png') ?? null
    } catch {
      c3d = null
    }
    const blob = buildPdfReportBlob({
      problem: selectedProblem,
      params: activeParams,
      frame,
      insights,
      searchState,
      userNotes: notes,
      canvas3dDataUrl: c3d,
      canvas2dDataUrl: c2d,
    })
    triggerFileDownload(`GENESIS-${selectedProblem.code}-${selectedProblem.id}.pdf`, blob, 'application/pdf')
    showToast('PDF científico com gráfico 3D e osciloscópio 2D gerado.')
  }

  const sharedWorkspaceProps = {
    selectedProblem,
    backendOnline,
    agents,
    recentEvents,
    hardware,
    knowledgeSummary,
    knowledgeGraph,
    experiments,
    hypotheses,
    counterexamples,
    rejections,
    books,
    references,
    multilingualTerms,
    problemFiles,
    onRefreshBackend: () => void refreshBackendData(selectedProblem.id),
    onSelectProblem: (p: ProblemSpec) => {
      handleSelectProblem(p)
      setActiveView('command-center')
    },
    onExportLocalMd: handleExportMarkdown,
    onExportLocalPdf: handleExportPdf,
  }

  return (
    <div className="flex min-h-screen flex-col bg-white text-[#1F1F1F]">
      <TopNavBar
        activeView={activeView}
        onChangeView={setActiveView}
        language={language}
        onToggleLanguage={() => setLanguage((l) => (l === 'pt' ? 'en' : 'pt'))}
        hardwareProfile={hardwareProfile}
        onChangeProfile={handleChangeProfile}
        backendOnline={backendOnline}
        problemCount={ALL_PROBLEMS.length}
        onToggleSidebar={() => setMobileSidebarOpen((v) => !v)}
        onExportMarkdown={handleExportMarkdown}
        onExportPdf={handleExportPdf}
      />

      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm rounded-2xl border border-[#1A73E8]/30 bg-white px-4 py-2.5 text-xs font-medium text-[#1F1F1F] shadow-xl ring-1 ring-black/5">
          {toastMsg}
        </div>
      )}

      <div className="flex min-w-0 flex-1">
        <ProblemSidebar
          problems={ALL_PROBLEMS}
          selectedId={selectedProblem.id}
          onSelect={(p) => {
            handleSelectProblem(p)
            if (activeView === 'research-home') {
              setActiveView('command-center')
            }
          }}
          openMobile={mobileSidebarOpen}
          onCloseMobile={() => setMobileSidebarOpen(false)}
          hideDesktop={activeView === 'research-home'}
        />

        <main className="min-w-0 flex-1 overflow-y-auto bg-[#F8F9FA]">
          {activeView === 'research-home' && (
            <EditorialHomeView
              language={language}
              problems={ALL_PROBLEMS}
              selectedProblem={selectedProblem}
              books={books}
              references={references}
              knowledgeSummary={knowledgeSummary}
              backendOnline={backendOnline}
              onNavigateView={setActiveView}
              onOpenProblemInLab={(pid) => {
                const p = getProblemById(pid)
                handleSelectProblem(p)
                setActiveView('command-center')
              }}
            />
          )}

          {activeView === 'command-center' && (
            <div className="mx-auto max-w-[1440px] space-y-3.5 p-3 lg:p-4">
              {/* Header Banner of Selected Problem — Responsive flex-col lg:flex-row for zero mobile overflow */}
              <div className="flex flex-col items-start justify-between gap-3 rounded-2xl border border-[#E3E8EF] bg-white p-4 shadow-2xs lg:flex-row">
                <div className="min-w-0 w-full flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-md bg-[#E8F0FE] px-2 py-0.5 font-mono text-xs font-bold text-[#1A73E8]">
                      {selectedProblem.code}
                    </span>
                    <span className="rounded-full border border-sky-200 bg-[#EBF3FA] px-2.5 py-0.5 text-[11px] font-semibold text-[#0067B8]">
                      {selectedProblem.status}
                    </span>
                    <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-medium text-amber-900">
                      {selectedProblem.formalTier}
                    </span>
                    <span className="text-xs text-[#444746]">{selectedProblem.area}</span>
                  </div>
                  <h1 className="mt-1.5 break-words font-display text-lg font-bold tracking-tight text-[#1F1F1F] sm:text-2xl">
                    {selectedProblem.title}
                  </h1>
                  <p className="mt-1 break-words text-xs leading-relaxed text-[#444746]">
                    {selectedProblem.description}
                  </p>
                </div>
                <div className="w-full max-w-full overflow-x-auto rounded-xl border border-[#D7E3EE] bg-[#EBF3FA]/70 px-3.5 py-2 font-mono text-xs font-semibold text-[#004E8C] lg:w-auto lg:max-w-md lg:shrink-0">
                  {selectedProblem.formulaLatex}
                </div>
              </div>

              {/* Primary 3D WebGL Grid (Obsidian Dark Frame inside Light Studio) + Live Metrics + 2D Oscilloscope */}
              <div className={`grid gap-3.5 ${compareSplit ? 'xl:grid-cols-2' : 'xl:grid-cols-12'}`}>
                <div className={`min-w-0 ${compareSplit ? 'h-[360px]' : 'h-[360px] sm:h-[440px] xl:col-span-8'}`}>
                  <ObservatoryCanvas3D
                    frame={frame}
                    profile={hardwareProfile}
                    wifiEnabled={wifiEnabled}
                    adaptiveOverlay={adaptiveOverlay}
                    showSurface={showSurface}
                    showWireframe={showWireframe}
                    showParticles={showParticles}
                    cameraPreset={cameraPreset}
                    cameraAngleDeg={cameraAngle}
                    onCanvasReady={(el) => {
                      canvas3dRef.current = el
                    }}
                  />
                </div>

                {compareSplit && controlComparisonFrame ? (
                  <div className="h-[360px] min-w-0">
                    <ObservatoryCanvas3D
                      frame={controlComparisonFrame}
                      profile={hardwareProfile}
                      wifiEnabled={false}
                      adaptiveOverlay={false}
                      showSurface={showSurface}
                      showWireframe={showWireframe}
                      showParticles={showParticles}
                      cameraPreset={cameraPreset}
                      cameraAngleDeg={cameraAngle}
                    />
                  </div>
                ) : (
                  <div className="flex min-w-0 flex-col gap-3 xl:col-span-4">
                    {/* Live Key Numerical Counters */}
                    <div className="min-w-0 rounded-2xl border border-[#E3E8EF] bg-white p-3.5 shadow-2xs">
                      <div className="mb-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#0067B8]">
                        <span>Medições & Invariantes ao Vivo</span>
                        <span className="font-mono text-[#1A73E8]">{selectedProblem.engine}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {frame.metrics.slice(0, 4).map((m, idx) => (
                          <div
                            key={idx}
                            className="min-w-0 rounded-xl border border-[#E3E8EF] bg-[#F8F9FA] p-2.5"
                          >
                            <div className="truncate text-[10px] font-medium text-[#444746]">{m.label}</div>
                            <div
                              className={`truncate font-mono text-sm font-bold ${
                                m.accent === 'gold'
                                  ? 'text-amber-700'
                                  : m.accent === 'emerald'
                                    ? 'text-emerald-700'
                                    : m.accent === 'rose'
                                      ? 'text-rose-700'
                                      : 'text-[#0067B8]'
                              }`}
                            >
                              {m.value}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* 2D Oscilloscope & Live Proof Projection (Dark Scientific Contrast Frame) */}
                    <div className="min-w-0 flex-1 rounded-2xl border border-[#1E293B] bg-[#081B33] p-3 shadow-2xs">
                      <Oscilloscope2D
                        chart={frame.chart2D}
                        residualHistory={searchState.residualHistory}
                        onCanvasReady={(el) => {
                          canvas2dRef.current = el
                        }}
                      />
                      <p className="mt-2 break-words font-mono text-[11px] text-sky-200">{frame.candidateSummary}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Interactive Visual Controls + Projection */}
              <ControlDeck
                problem={selectedProblem}
                params={activeParams}
                onChangeParam={handleChangeParam}
                onResetParams={handleResetParams}
                playing={playing}
                onTogglePlay={() => setPlaying((p) => !p)}
                speed={speed}
                onChangeSpeed={setSpeed}
                wifiEnabled={wifiEnabled}
                onToggleWifi={() => setWifiEnabled((w) => !w)}
                adaptiveOverlay={adaptiveOverlay}
                onToggleAdaptive={() => setAdaptiveOverlay((a) => !a)}
                showSurface={showSurface}
                onToggleSurface={() => setShowSurface((s) => !s)}
                showWireframe={showWireframe}
                onToggleWireframe={() => setShowWireframe((w) => !w)}
                showParticles={showParticles}
                onToggleParticles={() => setShowParticles((p) => !p)}
                compareSplit={compareSplit}
                onToggleCompare={() => setCompareSplit((c) => !c)}
                projection={projection}
                onChangeProjection={setProjection}
                cameraPreset={cameraPreset}
                onChangeCameraPreset={setCameraPreset}
                cameraAngle={cameraAngle}
                onChangeCameraAngle={setCameraAngle}
              />

              {/* Continuous Quantum-Inspired Search + Visual-First Pattern Synthesis */}
              <div className="grid gap-3.5 xl:grid-cols-2">
                <InfiniteSearchPanel
                  searchState={searchState}
                  onToggleRun={() => setSearchState((prev) => ({ ...prev, running: !prev.running }))}
                  onReset={() => setSearchState(initialSearchState(selectedProblem.defaultParams))}
                  onChangeStrategy={(s: SearchStrategy) => setSearchState((prev) => ({ ...prev, strategy: s }))}
                  onReplayHit={handleReplayHit}
                  onRunBackendCycle={() => void handleRunBackendCycle()}
                  runningBackendCycle={runningBackendCycle}
                />

                <PatternInsightsPanel
                  problem={selectedProblem}
                  insights={insights}
                  notes={notes}
                  onChangeNotes={handleChangeNotes}
                  onExportMarkdown={handleExportMarkdown}
                  onExportPdf={handleExportPdf}
                />
              </div>
            </div>
          )}

          {activeView === 'agents-observatory' && <AgentsObservatoryView {...sharedWorkspaceProps} />}
          {activeView === 'knowledge-evolution' && <KnowledgeEvolutionView {...sharedWorkspaceProps} />}
          {activeView === 'proof-counterexample' && <ProofCounterexampleView {...sharedWorkspaceProps} />}
          {activeView === 'history-hardware' && <HistoryHardwareView {...sharedWorkspaceProps} />}
          {activeView === 'reports-sources' && <ReportsSourcesView {...sharedWorkspaceProps} />}
        </main>
      </div>
    </div>
  )
}

export default App
