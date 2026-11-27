export type CategoryId =
  | 'sacred-showcase'
  | 'millennium'
  | 'number-theory'
  | 'algebra-geometry'
  | 'geometry-topology'
  | 'analysis-pde'
  | 'cs-ai'
  | 'combinatorics-graphs'
  | 'logic-foundations'
  | 'probability-stats'
  | 'math-physics'
  | 'hilbert'

export type PillarId =
  | 'genesis'
  | 'jesus'
  | 'hermes'
  | 'tesla'
  | 'einstein'
  | 'davinci'
  | 'nosso-lar'
  | 'oppenheimer-neural'

export type EngineId =
  | 'genesis-wave'
  | 'zeta'
  | 'collatz'
  | 'goldbach'
  | 'number-explorer'
  | 'fluid'
  | 'chaos'
  | 'algebraic'
  | 'physics'
  | 'geometry'
  | 'combinatorics-cs'
  | 'ai-loss'
  | 'probability'
  | 'logic-bb'
  | 'mandelbulb'
  | 'tesla-369'
  | 'davinci-phi'
  | 'nosso-lar'

export type EpistemologicalTier =
  | 'Observação'
  | 'Padrão Empírico'
  | 'Hipótese'
  | 'Conjectura'
  | 'Resultado Parcial'
  | 'Lema Demonstrado'
  | 'Contraexemplo Verificado'
  | 'Demonstração Candidata'
  | 'Demonstração Formalmente Verificada'

export type PhysicsTier =
  | 'Equivalência Demonstrada'
  | 'Modelo Aproximado'
  | 'Analogia Exploratória'
  | 'Hipótese Não Validada'

export type ProblemStatus =
  | 'Em aberto'
  | 'Resolvido'
  | 'Parcial / Refutado'
  | 'Independente de ZFC'
  | 'Controverso'
  | 'Área de Pesquisa'
  | 'Controle Científico'

export type ProjectionMode =
  | 'cartesian_3d'
  | 'polar_spherical'
  | 'phase_space'
  | 'stereographic_4d'

export type SearchStrategy =
  | 'quantum-inspired'
  | 'adaptive-refinement'
  | 'annealing'
  | 'monte-carlo'
  | 'grid-sweep'

export type HardwareProfile = 'eco' | 'balanced' | 'ultra'

export type LabViewId =
  | 'research-home'
  | 'command-center'
  | 'agents-observatory'
  | 'knowledge-evolution'
  | 'proof-counterexample'
  | 'history-hardware'
  | 'reports-sources'

export interface ParameterSpec {
  key: string
  label: string
  min: number
  max: number
  step: number
  defaultValue: number
  unit?: string
}

export interface MultilingualRef {
  lang: 'PT' | 'EN' | 'ES' | 'FR' | 'DE' | 'IT' | 'RU' | 'ZH' | 'JA' | 'KO'
  term: string
  note?: string
}

export interface ProblemSpec {
  id: string
  code: string
  title: string
  category: CategoryId
  area: string
  status: ProblemStatus
  statusDetail: string
  formalTier: EpistemologicalTier
  physicsTier: PhysicsTier
  physicsRationale: string
  pillar: PillarId
  hermeticPrinciple: string
  engine: EngineId
  variant: string
  formulaLatex: string
  description: string
  philosophicalNote: string
  scientificBridge: string
  studyOrder?: number
  defaultParams: Record<string, number>
  parameters: ParameterSpec[]
  multilingual?: MultilingualRef[]
  openSourceHint?: string
}

export interface SimulationFrame {
  surface?: {
    cols: number
    rows: number
    positions: Float32Array
    colors: Float32Array
    wireframeOpacity?: number
    solidOpacity?: number
  }
  particles?: {
    positions: Float32Array
    colors: Float32Array
    count: number
  }
  curves?: Array<{
    points: Float32Array
    color: string
    opacity?: number
  }>
  markers?: Array<{
    position: [number, number, number]
    color: string
    radius: number
    pulse?: boolean
    label?: string
  }>
  adaptiveHotspots?: Array<{
    x: number
    z: number
    intensity: number
  }>
  chart2D: {
    title: string
    xLabel: string
    yLabel: string
    mode: 'line' | 'bar' | 'scatter'
    series: Array<{
      label: string
      color: string
      points: Array<[number, number]>
    }>
  }
  fieldCoupling: {
    frequency: number
    amplitude: number
    coherence: number
    phaseShift: number
    focalPoints: Array<[number, number, number]>
  }
  metrics: Array<{
    label: string
    value: string
    accent?: 'gold' | 'cyan' | 'emerald' | 'violet' | 'rose'
  }>
  residual: number
  candidateSummary: string
}

export interface PatternInsightReport {
  symmetryScore: number
  dominantFrequency: number
  regimeLabel: string
  visualCues: string[]
  detectedAnomalies: string[]
  adaptiveSavingsPercent: number
  bruteForceEvaluations: number
  adaptiveEvaluations: number
  synthesizedRule: string
  nextHypothesis: string
}

export interface DiscoveryHit {
  id: string
  iteration: number
  strategy: SearchStrategy
  residual: number
  coherence: number
  params: Record<string, number>
  summary: string
  timestamp: string
}

export interface SearchState {
  running: boolean
  strategy: SearchStrategy
  iterations: number
  ratePerSec: number
  bestResidual: number
  bestCoherence: number
  bestParams: Record<string, number>
  residualHistory: number[]
  hits: DiscoveryHit[]
}
