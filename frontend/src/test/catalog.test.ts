import { describe, expect, it } from 'vitest'
import { HILBERT_23_PROBLEMS } from '../domain/openSourceCatalog'
import { ALL_PROBLEMS, getProblemById, getStudyPathProblems } from '../domain/problemsCatalog'

describe('GENESIS Problems Catalog Integrity', () => {
  it('contains all 113+ problems with unique IDs and valid epistemological tiers', () => {
    expect(ALL_PROBLEMS.length).toBeGreaterThanOrEqual(113)
    const ids = new Set<string>()
    for (const p of ALL_PROBLEMS) {
      expect(ids.has(p.id)).toBe(false)
      ids.add(p.id)
      expect(p.title.length).toBeGreaterThan(2)
      expect(p.formulaLatex.length).toBeGreaterThan(2)
      expect(p.parameters.length).toBeGreaterThan(0)
    }
  })

  it('maintains accurate historical and modern statuses without hallucinations', () => {
    expect(getProblemById('poincare-conjecture').status).toBe('Resolvido')
    expect(getProblemById('continuum-hypothesis').status).toBe('Independente de ZFC')
    expect(getProblemById('abc-conjecture').status).toBe('Controverso')
    expect(getProblemById('moving-sofa').statusDetail).toContain('Jineon Baek')
    expect(getProblemById('kakeya-conjecture').statusDetail).toContain('Wang')
    expect(getProblemById('kls-bourgain-slicing').status).toBe('Resolvido')
    expect(getProblemById('decidability-limits').statusDetail).toContain('47.176.870')
    expect(getProblemById('kaplansky-conjectures').statusDetail).toContain('Gardam')
    expect(getProblemById('langlands-program').statusDetail).toContain('Gaitsgory')
    expect(getProblemById('perfect-cuboid').title).toContain('Cuboide')
    expect(getProblemById('magic-square-squares').title).toContain('Quadrado Mágico')
  })

  it('includes all 23 Hilbert problems and the 10-step study path', () => {
    expect(HILBERT_23_PROBLEMS).toHaveLength(23)
    expect(getStudyPathProblems()).toHaveLength(10)
  })
})
