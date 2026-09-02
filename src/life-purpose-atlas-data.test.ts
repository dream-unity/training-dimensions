import { describe, expect, it } from 'vitest'
import { LIFE_PURPOSE_ATLAS, getLifePurposeAtlas } from './life-purpose-atlas-data'

describe('Life Purpose worked dimensional atlas', () => {
  it('contains one distinct worked map for every dimension from 1D through 12D', () => {
    expect(LIFE_PURPOSE_ATLAS).toHaveLength(12)
    expect(LIFE_PURPOSE_ATLAS.map((map) => map.level)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(new Set(LIFE_PURPOSE_ATLAS.map((map) => map.title)).size).toBe(12)
  })

  it('is a substantial atlas rather than twelve decorative diagrams', () => {
    const totalNodes = LIFE_PURPOSE_ATLAS.reduce((sum, map) => sum + map.nodes.length, 0)
    const totalEdges = LIFE_PURPOSE_ATLAS.reduce((sum, map) => sum + map.edges.length, 0)
    expect(totalNodes).toBeGreaterThan(140)
    expect(totalEdges).toBeGreaterThan(170)

    for (const map of LIFE_PURPOSE_ATLAS.slice(1)) {
      expect(map.nodes.length).toBeGreaterThanOrEqual(10)
      expect(map.edges.length).toBeGreaterThanOrEqual(10)
      expect(map.stages).toHaveLength(4)
      expect(map.insights.length).toBeGreaterThanOrEqual(4)
      expect(map.blindSpot.length).toBeGreaterThan(45)
      expect(map.leap.length).toBeGreaterThan(45)
      expect(map.question.length).toBeGreaterThan(35)
      expect(map.edges.every((edge) => edge.explanation.length > 15)).toBe(true)
    }
  })

  it('changes the reasoning grammar rather than merely adding more nodes', () => {
    expect(getLifePurposeAtlas(4).title).toContain('self-transforming temporal loop')
    expect(getLifePurposeAtlas(5).title).toContain('space of possible lives')
    expect(getLifePurposeAtlas(6).title).toContain('hidden generative rules')
    expect(getLifePurposeAtlas(7).title).toContain('frameworks')
    expect(getLifePurposeAtlas(8).title).toContain('observers and scales')
    expect(getLifePurposeAtlas(9).title).toContain('evolving ecology of models')
    expect(getLifePurposeAtlas(10).title).toContain('learning architecture')
    expect(getLifePurposeAtlas(11).title).toContain('co-evolving adaptive architectures')
    expect(getLifePurposeAtlas(12).title).toContain('inventing new dimensions')
  })

  it('contains the high-dimensional distinctions the curriculum is intended to teach', () => {
    const six = getLifePurposeAtlas(6).nodes.map((node) => node.label).join(' ')
    expect(six).toContain('Hidden objective')
    expect(six).toContain('NEW POSSIBILITY SPACE')

    const eight = getLifePurposeAtlas(8).nodes.map((node) => node.label).join(' ')
    expect(eight).toContain('Future Self')
    expect(eight).toContain('Planetary')
    expect(eight).toContain('Excluded')

    const twelve = getLifePurposeAtlas(12).nodes.map((node) => node.label).join(' ')
    expect(twelve).toContain('Recoverability')
    expect(twelve).toContain('Beneficiary Radius')
    expect(twelve).toContain('Temporal Depth')
    expect(twelve).toContain('Identity Permeability')
    expect(twelve).toContain('Epistemic Exposure')
    expect(twelve).toContain('Regenerative Capacity')
  })
})
