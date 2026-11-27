import type { CategoryId, ProblemSpec } from './types'
import { ALGEBRA_GEOMETRY_PROBLEMS } from './catalog/algebraGeometry'
import { ANALYSIS_PDE_PROBLEMS } from './catalog/analysisPde'
import { COMBINATORICS_GRAPHS_PROBLEMS } from './catalog/combinatoricsGraphs'
import { COMPUTER_SCIENCE_AI_PROBLEMS } from './catalog/computerScienceAi'
import { GEOMETRY_TOPOLOGY_PROBLEMS } from './catalog/geometryTopology'
import { HILBERT_OPEN_PROBLEMS } from './catalog/hilbertProblems'
import { LOGIC_FOUNDATIONS_PROBLEMS } from './catalog/logicFoundations'
import { MATH_PHYSICS_PROBLEMS } from './catalog/mathPhysics'
import { MILLENNIUM_PROBLEMS } from './catalog/millennium'
import { NUMBER_THEORY_PROBLEMS } from './catalog/numberTheory'
import { PROBABILITY_STATS_PROBLEMS } from './catalog/probabilityStats'
import { SACRED_SHOWCASE_PROBLEMS } from './catalog/sacredShowcase'

export const ALL_PROBLEMS: ProblemSpec[] = [
  ...SACRED_SHOWCASE_PROBLEMS,
  ...MILLENNIUM_PROBLEMS,
  ...NUMBER_THEORY_PROBLEMS,
  ...ALGEBRA_GEOMETRY_PROBLEMS,
  ...GEOMETRY_TOPOLOGY_PROBLEMS,
  ...ANALYSIS_PDE_PROBLEMS,
  ...COMPUTER_SCIENCE_AI_PROBLEMS,
  ...COMBINATORICS_GRAPHS_PROBLEMS,
  ...LOGIC_FOUNDATIONS_PROBLEMS,
  ...PROBABILITY_STATS_PROBLEMS,
  ...MATH_PHYSICS_PROBLEMS,
  ...HILBERT_OPEN_PROBLEMS,
]

export const PROBLEMS_BY_ID: Record<string, ProblemSpec> = Object.fromEntries(
  ALL_PROBLEMS.map((p) => [p.id, p]),
)

export function getProblemById(id: string): ProblemSpec {
  return PROBLEMS_BY_ID[id] ?? ALL_PROBLEMS[0]
}

export function getProblemsByCategory(category: CategoryId): ProblemSpec[] {
  return ALL_PROBLEMS.filter((p) => p.category === category)
}

export function getStudyPathProblems(): ProblemSpec[] {
  return ALL_PROBLEMS.filter((p) => typeof p.studyOrder === 'number').sort(
    (a, b) => (a.studyOrder ?? 99) - (b.studyOrder ?? 99),
  )
}
