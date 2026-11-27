import type { ProblemSpec } from '../types'

function pde(id: string, code: string, title: string, formulaLatex: string, description: string, variant: string, pillar: ProblemSpec['pillar'] = 'davinci'): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'analysis-pde',
    area: 'Análise Matemática & EDPs',
    status: 'Em aberto',
    statusDetail: 'Problema aberto de análise harmônica ou equações diferenciais parciais.',
    formalTier: 'Conjectura',
    physicsTier: 'Modelo Aproximado',
    physicsRationale: 'Campos contínuos e transformadas de Fourier discretizadas em malha adaptativa.',
    pillar,
    hermeticPrinciple: 'Vibração & Fluxo Contínuo',
    engine: variant === 'euler-3d' || variant === 'mhd-3d' || variant === 'pompeiu' || variant === 'schiffer' ? 'fluid' : 'zeta',
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'Fourier, Da Vinci & Faraday: decompor movimentos complexos em frequências e vórtices visíveis.',
    scientificBridge: 'Simulação espectral/vorticidade monitorando estabilidade e convergência sem confundir artefato CFL com blow-up.',
    defaultParams: { viscosity: 0.004, frequency: 2.0, steps: 24 },
    parameters: [
      { key: 'viscosity', label: 'Dissipação / Ordem', min: 0.0005, max: 0.02, step: 0.0005, defaultValue: 0.004 },
      { key: 'frequency', label: 'Frequência Modal', min: 0.5, max: 5.0, step: 0.1, defaultValue: 2.0 },
      { key: 'steps', label: 'Passos Temporais', min: 8, max: 45, step: 2, defaultValue: 24 },
    ],
    openSourceHint: 'PyVista / VTK / Three.js Vector Fields',
  }
}

export const ANALYSIS_PDE_PROBLEMS: ProblemSpec[] = [
  pde('euler-3d-singularities', 'ANA-01', 'Singularidades das Equações de Euler 3D', '∂_t ω + (u·∇)ω = (ω·∇)u', 'Explora estiramento de tubos de vorticidade invíscidos buscando concentração de energia em escalas finas.', 'euler-3d'),
  pde('carleson-higher-dim', 'ANA-02', 'Conjectura de Carleson em Dimensões Superiores', 'lim_{R→∞} S_R f(x) = f(x) q.t.p.', 'Convergência pontual de integrais de Fourier oscilatórias multivariadas em regimes abertos.', 'carleson', 'tesla'),
  pde('pompeiu-problem', 'ANA-03', 'Problema de Pompeiu', '∫_{σ(K)} f = 0 ∀ σ ⇒ f ≡ 0 (exige K ≠ bola)', 'Testa simetria rotacional em domínios geométricos para detecção de autovalores de Neumann.', 'pompeiu'),
  pde('schiffer-conjecture', 'ANA-04', 'Conjectura de Schiffer (Autovalores de Neumann)', 'Δu + λu = 0,  ∂u/∂n = 0,  u|_{∂Ω} = const ⇒ Ω é bola?', 'Visualiza modos próprios de membrana com contorno constante investigando rigidez esférica.', 'schiffer'),
  pde('fourier-restriction', 'ANA-05', 'Conjectura de Restrição de Fourier', '||f̂|_{S^{n-1}}||_q ≤ C ||f||_p', 'Análise harmônica sobre esferas e paraboloides ligando geometria de Kakeya a ondas dispersivas.', 'restriction', 'tesla'),
  pde('bochner-riesz', 'ANA-06', 'Conjectura de Bochner–Riesz', 'S_R^δ f → f em L^p(R^n) para δ > δ_c(p)', 'Compara somabilidade esférica suave com oscilações de Gibbs na fronteira do disco espectral.', 'bochner-riesz', 'tesla'),
  pde('mhd-3d-regularity', 'ANA-07', 'Regularidade da Magnetohidrodinâmica 3D', '∂_t B = ∇×(u×B) + ηΔB,  ∇·B = 0', 'Acopla fluido condutor e campo magnético invisível visualizando reconexão magnética (estilo Faraday/Maxwell).', 'mhd-3d', 'tesla'),
]
