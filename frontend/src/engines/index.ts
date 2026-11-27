import type { HardwareProfile, ProblemSpec, ProjectionMode, SimulationFrame } from '../domain/types'
import { computeAiLossFrame, computeProbabilityAndLogicFrame } from './aiProbabilityLogicEngine'
import { computeAlgebraicFrame, computePhysicsFrame } from './algebraAndPhysicsEngine'
import { computeChaosFrame, computeFluidFrame } from './fluidAndChaosEngine'
import { computeCombinatoricsCsFrame, computeGeometryFrame } from './geometryAndCombinatoricsEngine'
import { computeCollatzFrame, computeGoldbachFrame, computeNumberExplorerFrame } from './numberTheoryEngine'
import { computeGenesisWaveFrame, computeSacredVariantsFrame, computeZetaFrame } from './zetaAndSacredEngine'

export function computeSimulationFrame(
  problem: ProblemSpec,
  params: Record<string, number>,
  time: number,
  profile: HardwareProfile = 'balanced',
  projection: ProjectionMode = 'cartesian_3d',
): SimulationFrame {
  switch (problem.engine) {
    case 'genesis-wave':
      return computeGenesisWaveFrame(problem, params, time, profile, projection)
    case 'tesla-369':
    case 'davinci-phi':
    case 'nosso-lar':
    case 'mandelbulb':
      return computeSacredVariantsFrame(problem, params, time, profile, projection)
    case 'zeta':
      return computeZetaFrame(problem, params, time, profile, projection)
    case 'collatz':
      return computeCollatzFrame(problem, params, time, profile, projection)
    case 'goldbach':
      return computeGoldbachFrame(problem, params, time, profile, projection)
    case 'number-explorer':
      return computeNumberExplorerFrame(problem, params, time, profile, projection)
    case 'fluid':
      return computeFluidFrame(problem, params, time, profile, projection)
    case 'chaos':
      return computeChaosFrame(problem, params, time, profile, projection)
    case 'algebraic':
      return computeAlgebraicFrame(problem, params, time, profile, projection)
    case 'physics':
      return computePhysicsFrame(problem, params, time, profile, projection)
    case 'geometry':
      return computeGeometryFrame(problem, params, time, profile, projection)
    case 'combinatorics-cs':
      return computeCombinatoricsCsFrame(problem, params, time, profile, projection)
    case 'ai-loss':
      return computeAiLossFrame(problem, params, time, profile, projection)
    case 'probability':
    case 'logic-bb':
      return computeProbabilityAndLogicFrame(problem, params, time, profile, projection)
    default:
      return computeGenesisWaveFrame(problem, params, time, profile, projection)
  }
}
