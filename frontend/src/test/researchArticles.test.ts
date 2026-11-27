import { describe, expect, it } from 'vitest'
import { ALL_PROBLEMS } from '../domain/problemsCatalog'
import { RESEARCH_ARTICLES } from '../domain/researchArticles'

describe('GENESIS Editorial Research Articles Integrity', () => {
  it('provides 8 complete academic articles mapped to real catalog problems and ABNT/ISO citations', () => {
    expect(RESEARCH_ARTICLES).toHaveLength(8)
    const problemIds = new Set(ALL_PROBLEMS.map((p) => p.id))

    for (const art of RESEARCH_ARTICLES) {
      expect(problemIds.has(art.problemId)).toBe(true)
      expect(art.methodologySteps.length).toBeGreaterThanOrEqual(3)
      expect(art.exactEquations.length).toBeGreaterThanOrEqual(2)
      expect(art.algorithmPseudocode.length).toBeGreaterThan(40)
      expect(art.redTeamLimitations.length).toBeGreaterThanOrEqual(1)
      expect(art.references.length).toBeGreaterThanOrEqual(3)
      expect(art.mscCodes.length).toBeGreaterThan(4)
    }
  })
})
