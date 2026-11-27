import type { ProblemSpec } from '../types'

function alg(
  id: string,
  code: string,
  title: string,
  status: ProblemSpec['status'],
  statusDetail: string,
  formulaLatex: string,
  description: string,
  variant: string,
  formalTierOverride?: ProblemSpec['formalTier'],
): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'algebra-geometry',
    area: 'Álgebra & Geometria Algébrica',
    status,
    statusDetail,
    formalTier:
      formalTierOverride ??
      (status === 'Resolvido'
        ? 'Demonstração Formalmente Verificada'
        : status === 'Parcial / Refutado'
          ? 'Contraexemplo Verificado'
          : 'Conjectura'),
    physicsTier: 'Analogia Exploratória',
    physicsRationale: 'Projeções geométricas de variedades algébricas e dualidades espectrais.',
    pillar: 'davinci',
    hermeticPrinciple: 'Correspondência — dualidades entre anéis, álgebras e variedades geométricas',
    engine: 'algebraic',
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'Emmy Noether & Grothendieck: abstrair a simetria invisível subjacente às equações.',
    scientificBridge: 'Projeção 3D controlada de variedades e autovalores sobre corpos finitos/complexos.',
    defaultParams: { twist: 1.4, phase: 0.5, degree: 4 },
    parameters: [
      { key: 'twist', label: 'Deformação', min: 0.2, max: 3.0, step: 0.1, defaultValue: 1.4 },
      { key: 'phase', label: 'Fase Complexa', min: 0.0, max: 3.14, step: 0.05, defaultValue: 0.5 },
      { key: 'degree', label: 'Parâmetro Grau', min: 2, max: 8, step: 1, defaultValue: 4 },
    ],
    openSourceHint: 'SageMath + Lean 4 Mathlib4',
  }
}

export const ALGEBRA_GEOMETRY_PROBLEMS: ProblemSpec[] = [
  alg('jacobian-conjecture', 'ALG-01', 'Conjectura do Jacobiano', 'Em aberto', 'Aberta mesmo em dimensão n = 2 sobre C.', 'det(J_F) ∈ C* ⇒ F é polinomialmente invertível?', 'Deforma o grid 3D por aplicações polinomiais de determinante jacobiano constante para inspecionar injetividade.', 'jacobian'),
  alg('tate-conjecture', 'ALG-02', 'Conjectura de Tate', 'Em aberto', 'Análoga aritmética da Conjectura de Hodge sobre corpos finitos.', 'H^{2i}(X, Q_l(i))^G = classes de ciclos algébricos', 'Mapeia invariantes de Frobenius sobre malha modular.', 'tate'),
  alg('fontaine-mazur', 'ALG-03', 'Conjectura de Fontaine–Mazur', 'Em aberto', 'Casos p-ádicos importantes resolvidos por Kisin e Emerton; formulação geral segue aberta.', 'Representação p-ádica geométrica ⇒ origem em variedade algébrica', 'Espectro de autovalores de representações de Galois.', 'fontaine-mazur'),
  alg('bass-conjecture', 'ALG-04', 'Conjectura de Bass (Teoria K)', 'Em aberto', 'Conjectura de geração finita para grupos K_n de anéis regulares.', 'K_n(R) finitamente gerado para R regular finito sobre Z', 'Malha homológica de rank algébrico.', 'bass'),
  alg('kaplansky-conjectures', 'ALG-05', 'Conjecturas de Kaplansky', 'Parcial / Refutado', 'Conjectura das Unidades REFUTADA por Giles Gardam (Annals 2021) sobre F₂; Divisores de Zero e Idempotentes seguem em aberto!', 'K[G] sem unidades não-triviais (REFUTADA); sem divisores de zero (ABERTA)', 'Visualiza o grupo cristalográfico de Hantzsche-Wendt onde Gardam descobriu unidade não-trivial em 2021.', 'kaplansky'),
  alg('zariski-multiplicity', 'ALG-06', 'Conjectura de Multiplicidade de Zariski', 'Em aberto', 'Invariância topológica implica igualdade de multiplicidade em hipersuperfícies.', 'Tipo topológico equivalente ⇒ mult(f) = mult(g)', 'Superfície singular com nó cônico e resolução de explosão (blow-up).', 'zariski'),
  alg('grothendieck-serre', 'ALG-07', 'Conjectura de Grothendieck–Serre', 'Em aberto', 'Provada para anéis equicaracterísticos por Fedorov-Panin; casos mistos seguem em aberto.', 'Fibrado G-principal trivial no genérico ⇒ localmente trivial', 'Feixe de fibras toroidais sobre espectro local.', 'grothendieck-serre'),
  alg('dixmier-conjecture', 'ALG-08', 'Conjectura de Dixmier', 'Em aberto', 'Equivalente estável à Conjectura do Jacobiano (Tsuchimoto / Belov-Kanel).', 'Endomorfismo da Álgebra de Weyl A_n é automorfismo?', 'Operadores não-comutativos [∂, x] = 1 visualizados no espaço de fase.', 'dixmier'),
  alg('bombieri-lang', 'ALG-09', 'Conjectura de Bombieri–Lang', 'Em aberto', 'Pontos racionais em variedades de tipo geral não são densos na topologia de Zariski.', 'X de tipo geral ⇒ X(K) não é Zariski-denso', 'Mapeia pontos racionais esparsos sobre superfície hiperbólica.', 'bombieri-lang'),
  alg('grothendieck-standard', 'ALG-10', 'Conjecturas Padrão de Grothendieck', 'Em aberto', 'Fundação dos motivos puros de Grothendieck; largamente aberta.', 'Correspondências algébricas de Lefschetz e Hodge em ciclos', 'Estrutura de matrizes de interseção de ciclos.', 'standard'),
  alg('langlands-program', 'ALG-11', 'Programa de Langlands', 'Parcial / Refutado', 'Langlands Geométrico PROVADO por Gaitsgory, Raskin et al. (2024); ramo aritmético completo segue amplo programa aberto.', 'Formas automorfas ↔ Representações de Galois', 'Visualiza a dualidade espectral entre formas automorfas e representações L.', 'langlands', 'Resultado Parcial'),
]
