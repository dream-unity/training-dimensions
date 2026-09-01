import { describe, expect, it } from 'vitest'
import {
  DIMENSION_EXPERIENCES,
  experiencePromptOffset,
  getDimensionExperience,
} from './dimension-experiences'

describe('personalised dimensional laboratories', () => {
  it('defines exactly twelve ordered and individually named laboratories', () => {
    expect(DIMENSION_EXPERIENCES).toHaveLength(12)
    expect(DIMENSION_EXPERIENCES.map((item) => item.level)).toEqual([
      1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12,
    ])
    expect(new Set(DIMENSION_EXPERIENCES.map((item) => item.studio)).size).toBe(12)
    expect(new Set(DIMENSION_EXPERIENCES.map((item) => item.mapShape)).size).toBe(12)
  })

  it('gives every laboratory its own teaching sequence, failure warning and pass test', () => {
    for (const laboratory of DIMENSION_EXPERIENCES) {
      expect(laboratory.mentalMove.length).toBeGreaterThan(35)
      expect(laboratory.mission.length).toBeGreaterThan(55)
      expect(laboratory.steps).toHaveLength(4)
      expect(laboratory.lineGrammar.length).toBeGreaterThanOrEqual(4)
      expect(laboratory.commonMistake.length).toBeGreaterThan(35)
      expect(laboratory.passTest.length).toBeGreaterThan(45)
      expect(laboratory.example.map.length).toBeGreaterThan(35)
      expect(laboratory.example.insight.length).toBeGreaterThan(35)
    }
  })

  it('keeps the core operation and spatial grammar distinct at representative levels', () => {
    expect(getDimensionExperience(2).studio).toBe('Relation Bridge')
    expect(getDimensionExperience(4).studio).toBe('Time-Loop Laboratory')
    expect(getDimensionExperience(6).studio).toBe('Rule Foundry')
    expect(getDimensionExperience(8).studio).toBe('Observer Orbit')
    expect(getDimensionExperience(10).studio).toBe('Architecture Studio')
    expect(getDimensionExperience(12).studio).toBe('Axis Forge')

    expect(experiencePromptOffset(2, 'd2-influence-in', 0, 4)).toEqual({ dx: -360, dy: 0 })
    expect(experiencePromptOffset(4, 'd4-feedback', 0, 5)).toEqual({ dx: 0, dy: -370 })
    expect(experiencePromptOffset(6, 'd6-assumption', 0, 5)).toEqual({ dx: -300, dy: 300 })
    expect(experiencePromptOffset(8, 'd8-observer', 0, 4)).toEqual({ dx: -340, dy: -285 })
    expect(experiencePromptOffset(12, 'd12-axis', 0, 4)).toEqual({ dx: 0, dy: -410 })
  })
})
