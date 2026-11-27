import type { ProblemSpec } from '../types'

function logic(id: string, code: string, title: string, status: ProblemSpec['status'], statusDetail: string, formulaLatex: string, description: string, variant: string): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'logic-foundations',
    area: 'Lógica Matemática & Fundamentos',
    status,
    statusDetail,
    formalTier: status === 'Independente de ZFC' ? 'Lema Demonstrado' : 'Conjectura',
    physicsTier: 'Hipótese Não Validada',
    physicsRationale: 'Lógica axiomática e teoria de conjuntos puras — NÃO devem ser reduzidas a busca numérica nem atribuídas a leis físicas.',
    pillar: 'jesus',
    hermeticPrinciple: 'Mentalismo & Limites do Conhecimento Formal (Gödel / Turing)',
    engine: 'logic-bb',
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'Gödel & Turing: compreender rigorosamente até onde sistemas formais alcançam sem confundir independência axiomática com erro numérico.',
    scientificBridge: 'Torre de cardinais transfinitos e simulador real de Máquina de Turing Busy Beaver BB(n).',
    defaultParams: { states: 4, steps: 80, level: 3 },
    parameters: [
      { key: 'states', label: 'Estados / Níveis', min: 2, max: 5, step: 1, defaultValue: 4 },
      { key: 'steps', label: 'Passos Máq. Turing', min: 15, max: 150, step: 5, defaultValue: 80 },
      { key: 'level', label: 'Escala Ordinal', min: 1, max: 6, step: 1, defaultValue: 3 },
    ],
    openSourceHint: 'Busy Beaver Challenge (Coq BB(5)=47,176,870) + Lean 4',
  }
}

export const LOGIC_FOUNDATIONS_PROBLEMS: ProblemSpec[] = [
  logic('continuum-hypothesis', 'LOG-01', 'Hipótese do Contínuo (CH)', 'Independente de ZFC', 'INDEPENDENTE de ZFC: consistência provada por Gödel (1940) e independência por Paul Cohen (1963) via forcing. Não é problema de busca numérica!', '∄ S: ℵ₀ < |S| < 2^{ℵ₀}   (Indecidível em ZFC)', 'Visualiza a escada de cardinais transfinitos ℵ₀ vs 2^{ℵ₀} e explica por que novos axiomas (como Forcing Axioms) são necessários.', 'ch'),
  logic('generalized-continuum', 'LOG-02', 'Hipótese Generalizada do Contínuo (GCH)', 'Independente de ZFC', 'Também independente de ZFC (Teorema de Easton permite controlar a função exponencial nos cardinais regulares).', '∀ α, 2^{ℵ_α} = ℵ_{α+1}   (Independente de ZFC)', 'Estrutura em árvore transfinita de níveis de potência de Cantor.', 'gch'),
  logic('vaught-conjecture', 'LOG-03', 'Conjectura de Vaught (Teoria dos Modelos)', 'Em aberto', 'Uma teoria contável completa tem finitos, ℵ₀ ou 2^{ℵ₀} modelos não isomorfos? Aberta em geral (Knight 2007/etc. casos parciais).', 'I(T, ℵ₀) ∈ {<= ℵ₀, 2^{ℵ₀}}?', 'Ramificação de tipos de modelos lógicos distinguíveis em árvore de Stone.', 'vaught'),
  logic('shelah-categoricity', 'LOG-04', 'Conjectura de Categoricidade de Shelah', 'Em aberto', 'Generaliza o Teorema de Morley para classes elementares abstratas (AECs).', 'Categórica em λ suficientemente grande ⇒ categórica acima', 'Espectro de estabilidade e bifurcação em classes elementares abstratas.', 'shelah'),
  logic('large-cardinals', 'LOG-05', 'Consistência de Grandes Cardinais', 'Independente de ZFC', 'Hierarquia de forças de consistência (Inacessíveis, Mensuráveis, Supercompactos) acima de ZFC.', 'Con(ZFC + κ grande) > Con(ZFC)', 'Torre espectral da hierarquia de consistência lógica acima de ZFC.', 'large-cardinals'),
  logic('decidability-limits', 'LOG-06', 'Limites Formais & Busy Beaver (BB(5) Coq 2024)', 'Parcial / Refutado', 'Em jul/2024 o Busy Beaver Challenge provou BB(5) = 47.176.870 formalmente em Coq! Problema da Parada & BB(n) geral seguem não-computáveis.', 'BB(5) = 47,176,870 (Coq 2024); BB(n) não computável', 'Executa ao vivo uma Máquina de Turing determinística gravando a evolução espaço-temporal da fita em grade 2D/3D.', 'busy-beaver'),
]
