import { describe, expect, it } from 'vitest'
import {
  LIFE_PURPOSE_EXAMPLE_MAPS,
  getLifePurposeExampleMap,
  validateLifePurposeExampleMap,
} from './life-purpose-example-data'

describe('Life Purpose dimensional example atlas', () => {
  it('contains one valid, distinct worked mind map for every dimension', () => {
    expect(LIFE_PURPOSE_EXAMPLE_MAPS).toHaveLength(12)
    expect(LIFE_PURPOSE_EXAMPLE_MAPS.map((map) => map.level)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
    expect(new Set(LIFE_PURPOSE_EXAMPLE_MAPS.map((map) => map.title)).size).toBe(12)
    for (const map of LIFE_PURPOSE_EXAMPLE_MAPS) {
      expect(validateLifePurposeExampleMap(map)).toEqual([])
      expect(map.stages.length).toBeGreaterThanOrEqual(4)
      expect(map.revelations.length).toBeGreaterThanOrEqual(4)
      expect(map.lowerDimensionBlindSpot.length).toBeGreaterThan(55)
      expect(map.dimensionalLeap.length).toBeGreaterThan(55)
      expect(map.closingQuestion.length).toBeGreaterThan(30)
    }
  })

  it('becomes structurally richer rather than merely changing labels', () => {
    const minimums = [
      { level: 1, nodes: 1, edges: 0 },
      { level: 2, nodes: 9, edges: 8 },
      { level: 3, nodes: 13, edges: 15 },
      { level: 4, nodes: 10, edges: 13 },
      { level: 5, nodes: 14, edges: 18 },
      { level: 6, nodes: 15, edges: 18 },
      { level: 7, nodes: 11, edges: 16 },
      { level: 8, nodes: 11, edges: 15 },
      { level: 9, nodes: 11, edges: 14 },
      { level: 10, nodes: 14, edges: 17 },
      { level: 11, nodes: 13, edges: 24 },
      { level: 12, nodes: 17, edges: 20 },
    ] as const

    for (const expected of minimums) {
      const map = getLifePurposeExampleMap(expected.level)
      expect(map.nodes.length).toBeGreaterThanOrEqual(expected.nodes)
      expect(map.edges.length).toBeGreaterThanOrEqual(expected.edges)
    }
  })

  it('teaches the intended high-dimensional conceptual moves explicitly', () => {
    const labels = (level: number) => getLifePurposeExampleMap(level).nodes.map((node) => node.label)
    expect(labels(4)).toEqual(expect.arrayContaining(['Delayed Burnout Signal', "Future Self's Interpretation"]))
    expect(labels(5)).toEqual(expect.arrayContaining(['90-Day Reversible Probe', 'Irreversible Thresholds']))
    expect(labels(6)).toEqual(expect.arrayContaining(['Worth must be proven', 'Optimise for agency created', 'Rewritten Generator']))
    expect(labels(7)).toEqual(expect.arrayContaining(['Existential Framework', 'Ecological / Systems Framework', 'Layered Purpose Architecture']))
    expect(labels(8)).toEqual(expect.arrayContaining(['Excluded Outsider', 'Species / Planet', 'Being Publicly Observed']))
    expect(labels(9)).toEqual(expect.arrayContaining(['Anomaly Field', 'Immunity Response', 'Explicit Update Rule']))
    expect(labels(10)).toEqual(expect.arrayContaining(['Purpose Red-Team', 'Explicit Trade-off Ledger', 'Quarterly Council / Annual Zero-Base Review']))
    expect(labels(11)).toEqual(expect.arrayContaining(['AI / Technology System', 'Emergent Purpose Ecology', 'Meta-Stability Protocol']))
    expect(labels(12)).toEqual(expect.arrayContaining(['Generativity', 'Recoverability', 'Epistemic Exposure', 'Identity Permeability', 'Axis Revision Rule']))
  })
})
