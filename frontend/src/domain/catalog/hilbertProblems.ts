import type { ProblemSpec } from '../types'

function hilb(id: string, code: string, title: string, status: ProblemSpec['status'], statusDetail: string, formulaLatex: string, description: string, engine: ProblemSpec['engine'], variant: string): ProblemSpec {
  return {
    id,
    code,
    title,
    category: 'hilbert',
    area: 'Os 23 Problemas de Hilbert (1900)',
    status,
    statusDetail,
    formalTier: status === 'Parcial / Refutado' ? 'Resultado Parcial' : 'Conjectura',
    physicsTier: engine === 'physics' ? 'Modelo Aproximado' : 'Analogia Exploratória',
    physicsRationale: 'Representação geométrica/dinâmica fiel ao núcleo em aberto de cada problema de Hilbert.',
    pillar: 'einstein',
    hermeticPrinciple: 'Síntese Histórica — questões seculares guiando o século XXI',
    engine,
    variant,
    formulaLatex,
    description,
    philosophicalNote: 'David Hilbert (1900): "Wir müssen wissen, wir werden wissen" — equilibrado com humildade científica moderna.',
    scientificBridge: 'Mapeia os 6 problemas de Hilbert ainda abertos/parciais mais o índice completo dos 23 no modal oficial.',
    defaultParams: { scale: 1.5, paramA: 1.2, paramB: 0.6 },
    parameters: [
      { key: 'scale', label: 'Parâmetro Principal', min: 0.4, max: 3.0, step: 0.1, defaultValue: 1.5 },
      { key: 'paramA', label: 'Acoplamento A', min: 0.2, max: 3.0, step: 0.1, defaultValue: 1.2 },
      { key: 'paramB', label: 'Fase B', min: 0.0, max: 2.0, step: 0.1, defaultValue: 0.6 },
    ],
    openSourceHint: 'Hilbert 1900 Archive + Clay / Mathlib',
  }
}

export const HILBERT_OPEN_PROBLEMS: ProblemSpec[] = [
  hilb('hilbert-6', 'HIL-06', 'Hilbert #6: Axiomatização da Física', 'Em aberto', 'Unificação rigorosa da mecânica estatística (Boltzmann → hidrodinâmica teve grandes avanços em 2024/2025) e gravidade quântica segue aberta.', 'Axiomas(Probabilidade + Física) ⇒ Leis macroscópicas', 'Conecta flutuações microscópicas discretas ao campo contínuo macroscópico em 3D.', 'physics', 'hilbert-6'),
  hilb('hilbert-8', 'HIL-08', 'Hilbert #8: Distribuição dos Primos & Zeta', 'Em aberto', 'Engloba Hipótese de Riemann, Conjectura de Goldbach e Primos Gêmeos.', 'π(x) ~ Li(x) + O(√x log x)', 'Sobrepõe a função degrau π(x) aos harmônicos oscilatórios vindos dos zeros de ζ(s).', 'zeta', 'hilbert-8'),
  hilb('hilbert-12', 'HIL-12', 'Hilbert #12: Extensão de Kronecker–Weber', 'Em aberto', 'Construir extensões abelianas de qualquer corpo numérico usando valores especiais de funções analíticas (Jugendtraum).', 'K^{ab} gerado por valores especiais analíticos?', 'Malha de reticulados complexos (j-invariante / funções modulares) sobre corpos quadráticos.', 'algebraic', 'hilbert-12'),
  hilb('hilbert-13', 'HIL-13', 'Hilbert #13: Funções Algébricas de 7º Grau', 'Parcial / Refutado', 'Kolmogorov-Arnold resolveram o caso CONTÍNUO (1957); o caso ALGÉBRICO (superposição de funções algébricas de 2 variáveis) segue em aberto!', 'x⁷ + ax³ + bx² + cx + 1 = 0 em 2 variáveis algébricas?', 'Superfície de Tschirnhaus mostrando projeções das raízes complexas do polinômio de grau 7.', 'algebraic', 'hilbert-13'),
  hilb('hilbert-16', 'HIL-16', 'Hilbert #16: Topologia de Curvas & Ciclos-Limite', 'Em aberto', 'Segunda parte aberta: determinar o número máximo H(n) de ciclos-limite de um campo vetorial polinomial planar de grau n.', 'dx/dt = P_n(x,y), dy/dt = Q_n(x,y) ⇒ máx H(n) ciclos', 'Retrato de fase dinâmico gerando múltiplos ciclos-limite aninhados no plano/3D.', 'chaos', 'hilbert-16'),
  hilb('hilbert-23', 'HIL-23', 'Hilbert #23: Cálculo Variacional', 'Área de Pesquisa', 'Desenvolvimento contínuo de métodos diretos para funcionais de energia, superfícies mínimas e transporte ótimo.', 'δ ∫ L(x, q, q̇) dt = 0', 'Superfície mínima (catenoide/helicóide) convergindo sob fluxo gradiente de área.', 'geometry', 'hilbert-23'),
]
