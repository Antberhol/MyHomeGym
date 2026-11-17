import { MUSCLE_GROUPS } from 'js-rich-body-highlighter'
import { describe, expect, it } from 'vitest'
import { BODY_ZONES, FIGURE_GROUPS, figureHighlights, zoneOfFigureGroup } from '../../src/utils/muscleMap'

describe('figura anatómica', () => {
  it('cada grupo dibujado en la figura corresponde a una zona de la app', () => {
    for (const group of MUSCLE_GROUPS) expect(zoneOfFigureGroup(group)).not.toBeNull()
  })

  it('solo usa zonas y grupos que existen', () => {
    for (const [zone, groups] of Object.entries(FIGURE_GROUPS)) {
      expect(BODY_ZONES).toContain(zone)
      for (const group of groups) expect(MUSCLE_GROUPS).toContain(group)
    }
  })

  it('no pinta zonas sin trabajar y pinta más intenso el nivel más alto', () => {
    const highlights = figureHighlights({ pecho: 4, triceps: 1, gemelo: 0, core: 2 })
    const byGroup = Object.fromEntries(highlights.map((h) => [h.group, h]))
    expect(byGroup.calves).toBeUndefined()
    expect(byGroup.chest.intensity).toBeGreaterThan(byGroup.triceps.intensity)
    expect(byGroup.abs.intensity).toBe(byGroup.obliques.intensity)
  })
})
