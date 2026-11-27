import type { ProblemSpec } from '../types'

function prob(id: string, code: string, title: string, status: ProblemSpec['status'], statusDetail: string, formulaLatex: string, description: string, variant: string): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'probability-stats',
    area: 'Probabilidade & Estatística',
    status,
    statusDetail,
    formalTier: status === 'Resolvido' ? 'Demonstração Candidata' : 'Conjectura',
    physicsTier: 'Modelo Aproximado',
    physicsRationale: 'Mecânica estatística, matrizes aleatórias e processos estocásticos.',
    pillar: 'oppenheimer-neural',
    hermeticPrinciple: 'Ritmo Estatístico — universalidade emerge em grandes escalas estocásticas',
    engine: 'probability',
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'Shannon & Boltzmann: macroleis determinísticas emergem do comportamento coletivo aleatório.',
    scientificBridge: 'Simulações Monte Carlo & Union-Find verificando expoentes críticos t^{1/3} e p_c.',
    defaultParams: { latticeSize: 28, pControl: 0.5927, trials: 40 },
    parameters: [
      { key: 'latticeSize', label: 'Tamanho Malha', min: 16, max: 44, step: 2, defaultValue: 28 },
      { key: 'pControl', label: 'Parâmetro Crítico p', min: 0.2, max: 0.9, step: 0.01, defaultValue: 0.5927 },
      { key: 'trials', label: 'Amostras / Passos', min: 15, max: 90, step: 5, defaultValue: 40 },
    ],
    openSourceHint: 'SciPy / NumPy Random Matrices & Percolation',
  }
}

export const PROBABILITY_STATS_PROBLEMS: ProblemSpec[] = [
  prob('kpz-universality', 'PRB-01', 'Universalidade KPZ (Kardar–Parisi–Zhang)', 'Em aberto', 'Equação estocástica de crescimento de interfaces com expoentes críticos 1:2:3; prova completa de universalidade segue aberta.', '∂_t h = νΔh + (λ/2)|∇h|² + √D η', 'Simula deposição balística em tempo real mostrando rugosidade escalando com expoente t^{1/3}.', 'kpz'),
  prob('critical-percolation', 'PRB-02', 'Percolação Crítica em Dimensões Intermediárias (d=3)', 'Em aberto', 'Provada em d=2 (Smirnov) e d >= 11 (Hara-Slade); tridimensional d=3 (ausência de aglomerado infinito em p_c) permanece um dos maiores desafios abertos!', 'θ(p_c) = 0 em R³?  (p_c^{site,2D} ≈ 0.5927)', 'Executa Union-Find real na malha destacando em dourado o cluster percolante na transição crítica.', 'percolation'),
  prob('self-avoiding-walk', 'PRB-03', 'Regularidade de Caminhos Autoevitantes (SAW)', 'Em aberto', 'Expoente de Flory ν = 3/4 em 2D (conjecturado como limite SLE_{8/3}); construção rigorosa do limite de escala segue aberta.', '⟨|R_N|²⟩ ~ N^{2ν}', 'Caminhos aleatórios sem auto-interseção exibindo expansão espacial comparada ao passeio browniano.', 'saw'),
  prob('random-matrix-universality', 'PRB-04', 'Universalidade de Matrizes Aleatórias (GUE / Wigner)', 'Em aberto', 'Avanços espetaculares de Erdős-Yau; regimes com matrizes esparsas/correlacionadas seguem ativos e ligam-se aos zeros de Riemann.', 'P(s) ≈ (32/π²) s² exp(-4s²/π)', 'Calcula espaçamentos de autovalores reais e sobrepõe à curva de Wigner e aos zeros da zeta de Riemann.', 'rmt'),
  prob('kls-bourgain-slicing', 'PRB-05', 'Conjectura KLS & Slicing de Bourgain (Resolvida 2024!)', 'Resolvido', 'Em dez/2024 Klartag e Lehec (usando cota de Guan) RESOLVERAM afirmativamente o Problema do Fatiamento de Bourgain! KLS completa (cota constante) segue refinamento ativo.', 'c_isotrópica ≤ C universal (Bourgain Slicing: RESOLVIDO 2024!)', 'Visualiza secções hiperplanas de corpos convexos isotrópicos demonstrando concentração de medida.', 'kls-slicing'),
  prob('hyperbolic-slicing', 'PRB-06', 'Conjectura do Fatiamento Hiperbólico / Geometria Convexa', 'Em aberto', 'Extensões não-euclidianas de concentração isoperimétrica e medidas log-côncavas.', 'Vol_{n-1}(K ∩ H) em espaços curvos', 'Cortes planos e geodésicos no disco de Poincaré medindo dispersão radial.', 'hyperbolic-slicing'),
  prob('high-dim-inference', 'PRB-07', 'Inferência em Alta Dimensão & Transição BBP', 'Área de Pesquisa', 'Lacunas entre limites estatísticos de informação e tratabilidade computacional (planted clique, sparse PCA).', 'SNR crítico θ_c = √(p/n) (Transição BBP)', 'Mostra espectros de covariância onde um autovalor isolado emerge do mar de Marchenko–Pastur acima de SNR crítico.', 'high-dim'),
]
