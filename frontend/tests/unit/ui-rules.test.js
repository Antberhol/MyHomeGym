import { describe, expect, it } from 'vitest'
import { readableTextOn } from '../../src/utils/color'
import { daysAgo, formatVolume } from '../../src/utils/format'
import { levelsFromVolumes, volumeByZone, zoneOf } from '../../src/utils/muscleMap'
import { normalizeWeekday, routineRunsOn, todayWeekday } from '../../src/utils/weekdays'

describe('formatos', () => {
  it('cuenta días naturales, no horas', () => {
    const now = new Date(2026, 10, 12, 0, 30)
    expect(daysAgo(new Date(2026, 10, 11, 23, 50).toISOString(), now)).toBe(1)
    expect(daysAgo(new Date(2026, 10, 12, 0, 10).toISOString(), now)).toBe(0)
  })

  it('pasa a toneladas a partir de 10.000 kg', () => {
    expect(formatVolume(9500, 'es')).toEqual({ value: '9500', unit: 'kg' })
    expect(formatVolume(12500, 'es')).toEqual({ value: '12,5', unit: 't' })
  })
})

describe('días de rutina', () => {
  it('acepta días escritos a mano con tildes y mayúsculas', () => {
    expect(normalizeWeekday(' Miércoles ')).toBe('miercoles')
    expect(normalizeWeekday('lunes,')).toBe('lunes')
    expect(normalizeWeekday('otro')).toBeNull()
  })

  it('sabe si una rutina toca hoy', () => {
    const thursday = new Date(2026, 10, 12)
    expect(todayWeekday(thursday)).toBe('jueves')
    expect(routineRunsOn({ diasSemana: ['Jueves'] }, 'jueves')).toBe(true)
    expect(routineRunsOn({ diasSemana: ['lunes'] }, 'jueves')).toBe(false)
  })
})

describe('mapa muscular', () => {
  const squat = {
    id: 'sq',
    grupoMuscularPrimario: 'piernas',
    musculosPrimarios: ['cuádriceps'],
    gruposMuscularesSecundarios: ['glúteos', 'zona lumbar'],
  }
  const byId = new Map([['sq', squat]])

  it('traduce los músculos del catálogo a zonas del diagrama', () => {
    expect(zoneOf('cuádriceps')).toBe('cuadriceps')
    expect(zoneOf('zona lumbar')).toBe('espalda-baja')
    expect(zoneOf('inventado')).toBeNull()
  })

  it('suma entero el principal, un 35 % los secundarios y nada de calentamiento', () => {
    const volumes = volumeByZone(
      [
        { ejercicioId: 'sq', pesoUtilizado: 100, repeticionesRealizadas: 5 },
        { ejercicioId: 'sq', pesoUtilizado: 60, repeticionesRealizadas: 5, type: 'warmup' },
      ],
      byId,
    )
    expect(volumes.cuadriceps).toBe(500)
    expect(volumes.gluteo).toBeCloseTo(175)
    expect(volumes.pecho).toBe(0)
  })

  it('deja a 0 lo no trabajado y escala el resto respecto al máximo', () => {
    expect(levelsFromVolumes({ a: 0, b: 100, c: 10 })).toEqual({ a: 0, b: 4, c: 1 })
  })
})

describe('contraste', () => {
  it('usa tinta oscura sobre colores claros y tiza sobre oscuros', () => {
    expect(readableTextOn('#F2C230')).toBe('#141518')
    expect(readableTextOn('#2F6FDE')).toBe('#F4F1EA')
  })
})
