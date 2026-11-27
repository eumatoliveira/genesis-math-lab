import type { ProblemSpec } from '../types'

function phys(id: string, code: string, title: string, status: ProblemSpec['status'], statusDetail: string, formulaLatex: string, description: string, variant: string, engine: ProblemSpec['engine'] = 'physics'): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'math-physics',
    area: 'Física Matemática',
    status,
    statusDetail,
    formalTier: 'Conjectura',
    physicsTier: 'Modelo Aproximado',
    physicsRationale: 'Modelagem física computacional rigorosa distinguindo aproximações de rede/semiclássicas de provas exatas.',
    pillar: 'einstein',
    hermeticPrinciple: 'Vibração, Campos & Conservação (Einstein / Faraday / Maxwell / Feynman)',
    engine,
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'Einstein, Feynman & Faraday: representar interações invisíveis no espaço-tempo revela leis ocultas.',
    scientificBridge: 'Campos vetoriais e escalares em tempo real com separação estrita entre modelo aproximado e teoria contínua.',
    defaultParams: { mass: 1.5, coupling: 2.0, noise: 0.4 },
    parameters: [
      { key: 'mass', label: 'Massa / Escala', min: 0.4, max: 3.0, step: 0.1, defaultValue: 1.5 },
      { key: 'coupling', label: 'Acoplamento', min: 0.3, max: 4.5, step: 0.1, defaultValue: 2.0 },
      { key: 'noise', label: 'Temperatura / Ruído', min: 0.05, max: 1.5, step: 0.05, defaultValue: 0.4 },
    ],
    openSourceHint: 'Quimb / OpenMM / Three.js Shaders',
  }
}

export const MATH_PHYSICS_PROBLEMS: ProblemSpec[] = [
  phys('quantum-gravity', 'PHY-01', 'Gravidade Quântica (Unificação RG + MQ)', 'Em aberto', 'Unificação consistente de Relatividade Geral e Mecânica Quântica (Loop Quantum Gravity / Cordas / AdS-CFT) segue aberta.', 'G_{μν} ↔ ⟨T̂_{μν}⟩  (Triangulação de Regge)', 'Malha triangular dinâmica (cálculo de Regge) exibindo flutuações quânticas da métrica espacial.', 'quantum-gravity'),
  phys('cosmic-censorship', 'PHY-02', 'Conjectura da Censura Cósmica (Penrose)', 'Em aberto', 'Versão fraca e forte possuem contraexemplos sutis (ex. Dafermos-Luk para forte em Kerr carregado); estado geral segue em debate ativo.', 'Toda singularidade genérica oculta por horizonte de eventos', 'Compara poço gravitacional subcrítico (com horizonte) contra colapso próximo à singularidade nua.', 'cosmic-censorship'),
  phys('quantum-many-body', 'PHY-03', 'Problema de Muitos Corpos Quânticos', 'Em aberto', 'Crescimento exponencial 2^N do espaço de Hilbert torna sistemas fortemente correlacionados intratáveis sem redes tensoriais.', 'H = -J Σ σ_i^z σ_j^z - h Σ σ_i^x', 'Simula cadeia de spins quânticos e emaranhamento local sobre grade 3D.', 'many-body'),
  phys('qft-4d-foundation', 'PHY-04', 'Fundamentação Rigorosa da QFT em 4D', 'Em aberto', 'Teorias de campo interativas não-triviais (φ⁴_4 é trivial, provado por Aizenman-Duminil-Copin 2021!); teorias de calibre 4D seguem abertas.', 'Axiomas de Wightman / Osterwalder-Schrader em R⁴', 'Visualiza fluxo de grupo de renormalização UV→IR e flutuações de vácuo.', 'qft-4d'),
  phys('bkl-singularities', 'PHY-05', 'Conjectura de BKL (Singularidades Cosmológicas)', 'Em aberto', 'Belinski–Khalatnikov–Lifshitz: dinâmica caótica tipo "mixmaster" próximo à singularidade cosmológica.', 'dx/dt = ... (bilhar hiperbólico de Kasner)', 'Trajetórias caóticas oscilatórias dos parâmetros de escala anisótropa próximo a t → 0.', 'bkl', 'chaos'),
  phys('turbulence-derivation', 'PHY-06', 'Derivação Microscópica da Turbulência (Espectro k^{-5/3})', 'Em aberto', 'Derivar rigorosamente a lei em cascata de Kolmogorov k^{-5/3} diretamente das equações determinísticas de Navier-Stokes.', 'E(k) ~ ε^{2/3} k^{-5/3}', 'Cascata energética multiescala mostrando transferência do macro-vórtice para escalas dissipativas.', 'turbulence', 'fluid'),
  phys('superconductivity-rigorous', 'PHY-07', 'Demonstração Rigorosa de Supercondutividade', 'Em aberto', 'Provar ordem de longo alcance fora da diagonal (ODLRO) e supercondutividade de alta T_c a partir de modelos de Hubbard.', 'H_{Hubbard} = -t Σ c†_i c_j + U Σ n_{i↑} n_{i↓}', 'Transição de emparelhamento de Cooper quando temperatura reduz abaixo de T_c.', 'superconductivity'),
]
