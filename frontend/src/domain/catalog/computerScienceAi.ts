import type { ProblemSpec } from '../types'

function cs(
  id: string,
  code: string,
  title: string,
  status: ProblemSpec['status'],
  statusDetail: string,
  formulaLatex: string,
  description: string,
  engine: ProblemSpec['engine'],
  variant: string,
  studyOrder?: number,
): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'cs-ai',
    area: 'Ciência da Computação & IA',
    status,
    statusDetail,
    formalTier: status === 'Área de Pesquisa' ? 'Observação' : 'Conjectura',
    physicsTier: 'Modelo Aproximado',
    physicsRationale: 'Paisagens de otimização e transição de fase usadas para inspeção empírica finita (NÃO prova separação assintótica).',
    pillar: 'oppenheimer-neural',
    hermeticPrinciple: 'Causalidade Computacional — estrutura do espaço de busca antes da força bruta',
    engine,
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'Turing, Shannon & Redes Neurais: visualizar paisagens de perda e restrições orienta algoritmos muito mais econômicos.',
    scientificBridge: 'Comparação quantitativa controlada sem extrapolar benchmarks finitos para teoremas assintóticos.',
    studyOrder,
    defaultParams: { scale: 1.5, lr: 0.15, difficulty: 4.2 },
    parameters: [
      { key: 'scale', label: 'Dimensão / Escala', min: 0.5, max: 3.0, step: 0.1, defaultValue: 1.5 },
      { key: 'lr', label: 'Taxa / Passo', min: 0.02, max: 0.6, step: 0.02, defaultValue: 0.15 },
      { key: 'difficulty', label: 'Complexidade', min: 1.0, max: 6.5, step: 0.1, defaultValue: 4.2 },
    ],
    openSourceHint: 'PyTorch + Z3 + SATLIB',
  }
}

export const COMPUTER_SCIENCE_AI_PROBLEMS: ProblemSpec[] = [
  cs('p-vs-pspace', 'CS-01', 'P versus PSPACE', 'Em aberto', 'Tempo polinomial equivale a memória polinomial? Sabe-se que P ⊆ NP ⊆ PSPACE.', 'P ⊆ NP ⊆ PSPACE;  P =? PSPACE', 'Compara crescimento de árvore de estados com reutilização de memória em jogos quantificados QBF.', 'combinatorics-cs', 'pspace'),
  cs('np-vs-conp', 'CS-02', 'NP versus co-NP', 'Em aberto', 'Certificados curtos de refutação existem para toda tautologia? Ligado à complexidade de provas proposicionais.', 'NP =? co-NP', 'Simetria entre testemunhas de satisfatibilidade (NP) e certificados UNSAT (co-NP).', 'combinatorics-cs', 'conp'),
  cs('p-vs-bpp', 'CS-03', 'P versus BPP', 'Em aberto', 'Amplamente conjecturado P = BPP via geradores pseudoaleatórios fortes.', 'P =? BPP (aleatorização vs determinismo)', 'Compara caminhos aleatórios contra amostragem quase-aleatória de baixa discrepância.', 'combinatorics-cs', 'bpp'),
  cs('bqp-vs-np', 'CS-04', 'BQP versus NP', 'Em aberto', 'Computação quântica resolve NP-completos em tempo polinomial? Suspeita-se que não.', 'BQP ⊈? NP  (Grover = √N)', 'Visualiza amplificação de amplitude de Grover O(√N) em hardware clássico e seus limites honestos.', 'combinatorics-cs', 'bqp'),
  cs('unique-games', 'CS-05', 'Conjectura dos Jogos Únicos (UGC)', 'Em aberto', 'Teorema 2-para-2 provado (Khot-Minzer-Safra 2018); UGC completa segue aberta.', 'UGC ⇒ dureza ótima de aproximação via SDP', 'Grafo bipartido com restrições de permutação medindo fração máxima de arestas satisfeitas.', 'combinatorics-cs', 'ugc'),
  cs('eth-hypothesis', 'CS-06', 'Hipótese do Tempo Exponencial (ETH)', 'Em aberto', '3-SAT não possui algoritmo subexponencial 2^{o(n)}.', '3-SAT ∉ DTIME(2^{o(n)})', 'Curva comparativa de escalonamento exponencial 2^{cn} vs subexponencial 2^{√n}.', 'combinatorics-cs', 'eth'),
  cs('seth-hypothesis', 'CS-07', 'SETH (Strong ETH)', 'Em aberto', 'k-SAT exige tempo ≈ 2^{(1 - o_k(1))n} conforme k cresce.', 'lim_{k→∞} s_k = 1', 'Limites inferiores finos para problemas polinomiais condicionados a k-SAT.', 'combinatorics-cs', 'seth'),
  cs('graph-isomorphism', 'CS-08', 'Problema do Isomorfismo de Grafos', 'Em aberto', 'Babai (2015) obteve tempo quasipolinomial exp((log n)^O(1)); P completo segue aberto.', 'G₁ ≅ G₂ em tempo polinomial?', 'Executa refinamento de cores Weisfeiler–Lehman em tempo real sobre dois grafos 3D.', 'combinatorics-cs', 'graph-iso', 5),
  cs('matrix-mult-omega', 'CS-09', 'Complexidade da Multiplicação de Matrizes (ω)', 'Em aberto', 'Alman et al. (2024) obtiveram ω < 2.371339; Emilien Dupont et al. com AlphaEvolve (arXiv:2608.16884, ago/2026) reduziram para ω < 2.371177. Manuscritos de IA de out/2026 alegando ω ≤ 2.25 permanecem sem revisão por pares; ω = 2 segue aberto.', 'O(n^ω),  2 ≤ ω < 2.371177', 'Tensor tridimensional de rank de Strassen mostrando redução de multiplicações de 8 para 7.', 'combinatorics-cs', 'matrix-omega'),
  cs('circuit-lower-bounds', 'CS-10', 'Limites Inferiores de Circuitos Booleanos', 'Em aberto', 'Construir função explícita em NP exigindo circuitos superlineares/superpolinomiais.', '∃ L ∈ NP: size(C_n) = ω(n)', 'Topologia de portas booleanas e profundidade vs largura de circuito.', 'combinatorics-cs', 'circuits'),
  cs('dl-generalization', 'CS-11', 'Generalização em Deep Learning (Double Descent)', 'Área de Pesquisa', 'Área ativa buscando caracterizar rigorosamente capacidade efetiva e viés implícito.', 'Risco Teste vs Razão Parâmetros/Amostras (P/N)', 'Plota em 3D e 2D o pico de interpolação P=N e a descida dupla no regime superparametrizado.', 'ai-loss', 'double-descent', 7),
  cs('mechanistic-interpretability', 'CS-12', 'Interpretabilidade Mecanicista (Grokking)', 'Área de Pesquisa', 'Área aberta voltada a decodificar circuitos internos (ex. aritmética modular via Fourier) em redes neurais.', 'f(a,b) = Σ c_k cos(ω_k(a+b))  mod p', 'Mostra a transição súbita de memorização para generalização por alinhamento harmônico de Fourier.', 'ai-loss', 'grokking'),
  cs('non-convex-optimization', 'CS-13', 'Convergência de Otimização Não Convexa', 'Área de Pesquisa', 'Quando SGD/Adam escapam de pontos de sela rumo a mínimos planos generalizáveis?', 'θ_{t+1} = θ_t - η ∇L(θ_t) + ruído', 'Corrida visual ao vivo entre SGD, Momentum e Adam atravessando pontos de sela 3D na grade.', 'ai-loss', 'saddle-race'),
]
