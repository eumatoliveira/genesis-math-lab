import type { ProblemSpec } from '../types'

function cg(id: string, code: string, title: string, status: ProblemSpec['status'], statusDetail: string, formulaLatex: string, description: string, variant: string, studyOrder?: number): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'combinatorics-graphs',
    area: 'Combinatória & Teoria dos Grafos',
    status,
    statusDetail,
    formalTier: 'Conjectura',
    physicsTier: 'Hipótese Não Validada',
    physicsRationale: 'Estrutura combinatória discreta representada visualmente em grafo 3D; sem correspondência física assumida.',
    pillar: 'nosso-lar',
    hermeticPrinciple: 'Estrutura Relacional — conexões e colorações revelam invariantes globais',
    engine: 'combinatorics-cs',
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'Paul Erdős & Frank Ramsey: ordem inevitável surge quando sistemas crescem além de limiares críticos.',
    scientificBridge: 'Geração interativa de grafos e detecção visual de cliques, ciclos e limiares de coloração.',
    studyOrder,
    defaultParams: { vertices: 12, kParam: 4, density: 0.5 },
    parameters: [
      { key: 'vertices', label: 'Vértices / Itens', min: 5, max: 24, step: 1, defaultValue: 12 },
      { key: 'kParam', label: 'Parâmetro k / Cores', min: 2, max: 7, step: 1, defaultValue: 4 },
      { key: 'density', label: 'Densidade Arestas', min: 0.15, max: 0.95, step: 0.05, defaultValue: 0.5 },
    ],
    openSourceHint: 'NetworkX + Erdős Problems + Open Problem Garden',
  }
}

export const COMBINATORICS_GRAPHS_PROBLEMS: ProblemSpec[] = [
  cg('hadwiger-conjecture', 'CMB-01', 'Conjectura de Hadwiger', 'Em aberto', 'Provada para k <= 6 (Robertson, Seymour, Thomas 1993); aberta para k >= 7.', 'χ(G) ≥ k ⇒ G possui K_k como menor', 'Grafo 3D destacando menores completos por contração de arestas e coloração.', 'hadwiger'),
  cg('graph-reconstruction', 'CMB-02', 'Conjectura de Reconstrução de Grafos', 'Em aberto', 'Todo grafo com >= 3 vértices é unicamente determinado pelo multiconjunto G - v?', 'Deck(G) = {G - v} determina G?', 'Exibe o grafo original e o deck de subgrafos G - v verificando invariantes de graus.', 'reconstruction'),
  cg('tutte-5-flow', 'CMB-03', 'Conjectura do Fluxo de 5 de Tutte', 'Em aberto', 'Todo grafo sem pontes admite fluxo em lugar nenhum nulo em Z_5?', 'G sem pontes ⇒ 5-NZF existe', 'Rede de fluxos conservativos sem arestas com fluxo zero.', 'tutte-5'),
  cg('tutte-3-flow', 'CMB-04', 'Conjectura do Fluxo de 3 de Tutte', 'Em aberto', 'Todo grafo 4-aresta-conexo admite fluxo sem zero em Z_3?', 'κ′(G) ≥ 4 ⇒ 3-NZF existe', 'Orientação balanceada módulo 3 em grafos 4-conexos.', 'tutte-3'),
  cg('cycle-double-cover', 'CMB-05', 'Cobertura Dupla por Ciclos', 'Em aberto', 'Todo grafo sem pontes tem coleção de ciclos cobrindo cada aresta exatamente duas vezes?', '∃ coleção C cobrindo cada aresta 2x', 'Superposição cromática de ciclos elementares sobre grafo cúbico.', 'cycle-double-cover'),
  cg('erdos-hajnal', 'CMB-06', 'Conjectura de Erdős–Hajnal', 'Em aberto', 'Grafos livres de subgrafo induzido H possuem clique ou conjunto independente de tamanho n^ε.', 'H-livre ⇒ α(G) ou ω(G) ≥ n^{c_H}', 'Mapeia subgrafos livres de padrão induzido e tamanho de cliques.', 'erdos-hajnal'),
  cg('frankl-union-closed', 'CMB-07', 'Conjectura de Frankl (Famílias Fechadas por União)', 'Em aberto', 'Justin Gilmer (arXiv:2211.09055) provou ≥ 0.01 via entropia, seguido por Chase & Lovett (arXiv:2211.11689); cota aprimorada por Simone Costa & Ankan Sadhu (arXiv:2610.02295, out/2026) para c_UC ≥ 0.38288525; meta 0.5 segue aberta.', '∃ x presente em ≥ 1/2 dos conjuntos (Costa & Sadhu 2026: ≥ 0.382885)', 'Matriz de incidência de família fechada por união calculando entropia de Shannon e frequência máxima.', 'frankl'),
  cg('ryser-conjecture', 'CMB-08', 'Conjectura de Ryser', 'Em aberto', 'Para hipergrafo r-partido, τ(H) ≤ (r - 1) ν(H). Provada até r <= 3.', 'τ(H) ≤ (r - 1)ν(H)', 'Hipergrafo r-partido visualizando transversais mínimas vs emparelhamentos.', 'ryser'),
  cg('graceful-tree', 'CMB-09', 'Rotulação Graciosa de Árvores (Ringel–Kotzig)', 'Em aberto', 'Toda árvore finita admite rotulação graciosa de seus vértices?', 'f: V → {0..n-1},  |f(u)-f(v)| todos distintos', 'Anima árvore 3D testando permutações graciosas onde todas as diferenças de arestas são únicas.', 'graceful'),
  cg('ramsey-numbers', 'CMB-10', 'Problema dos Números de Ramsey R(5,5)', 'Em aberto', 'Cota atual (2024): 43 ≤ R(5,5) ≤ 46 (reduzida de 48 para 46).', '43 ≤ R(5,5) ≤ 46', 'Colore arestas de K_n em ciano e dourado buscando em tempo real colorações livres de K_4 / K_5 monocromáticos.', 'ramsey', 4),
  cg('lonely-runner', 'CMB-11', 'Conjectura do Corredor Solitário', 'Em aberto', 'Provada até k <= 7 corredores (Rosenfeld 2025 / clássicos até 7); caso geral aberto.', '∃ t > 0: dist_toro(v_i t) ≥ 1/(k+1)', 'Anima k corredores em pista circular unitária medindo a distância mínima à origem ao longo do tempo.', 'lonely-runner'),
  cg('erdos-rado-sunflower', 'CMB-12', 'Problema do Girassol de Erdős–Rado', 'Em aberto', 'Alweiss–Lovett–Wu–Zhang (2020) melhoraram a cota para (C log(rk))^k; cota C^k segue aberta.', 'f(k, r) ≤ C^k? (ALWZ: (log k)^k)', 'Extrai pétalas disjuntas compartilhando núcleo comum em famílias de conjuntos.', 'sunflower'),
  cg('sidorenko-conjecture', 'CMB-13', 'Conjectura de Sidorenko', 'Em aberto', 'Todo grafo bipartido H minimiza densidade de homomorfismos no grafo aleatório G(n, p).', 't(H, W) ≥ t(K₂, W)^{|E(H)|}', 'Compara densidade de homomorfismos de grafos bipartidos contra grafos estruturados vs aleatórios.', 'sidorenko'),
  cg('turan-hypergraphs', 'CMB-14', 'Problemas de Turán para Hipergrafos', 'Em aberto', 'Mesmo o limiar exato para o tetraedro 3-uniforme K₄^{(3)} permanece famoso problema em aberto.', 'π(K₄^{(3)}) =? 5/9', 'Complexo simplicial 3D visualizando faces triangulares evitando tetraedros completos.', 'turan'),
]
