import { describe, expect, it } from 'vitest'
import { calculatePlateDistribution } from '../../src/utils/plateCalculator'
import {
  computeDayStreak,
  computeWeekStreak,
  streakWarningDelay,
  summarizeStreaks,
} from '../../src/utils/streaks'

// Fechas en hora local: jueves 12 de noviembre de 2026 a las 20:00.
const at = (day, hour = 18) => new Date(2026, 10, day, hour).toISOString()
const now = new Date(2026, 10, 12, 20)

describe('racha de días (RN-4.01, RN-4.03)', () => {
  it('cuenta días seguidos hasta hoy', () => {
    expect(computeDayStreak([at(12), at(11), at(10), at(8)], now)).toBe(3)
  })

  it('si hoy aún no has entrenado, cuenta desde ayer', () => {
    expect(computeDayStreak([at(11), at(10)], now)).toBe(2)
  })

  it('si no entrenaste ni hoy ni ayer, la racha es 0', () => {
    expect(computeDayStreak([at(10), at(9)], now)).toBe(0)
  })

  it('dos entrenos el mismo día cuentan como un día', () => {
    expect(computeDayStreak([at(12, 8), at(12, 19), at(11)], now)).toBe(2)
  })

  it('cuenta días naturales: ayer a las 23:00 y hoy a las 7:00 son dos días', () => {
    expect(computeDayStreak([at(11, 23), at(12, 7)], new Date(2026, 10, 12, 8))).toBe(2)
  })
})

describe('racha de semanas (RN-4.02)', () => {
  it('cuenta semanas de lunes a domingo seguidas', () => {
    // Semana actual (lunes 9), la anterior (lunes 2) y la de antes (lunes 26 de octubre).
    const dates = [at(10), at(3), new Date(2026, 9, 28, 18).toISOString()]
    expect(computeWeekStreak(dates, now)).toBe(3)
  })

  it('el domingo y el lunes siguiente son semanas distintas', () => {
    const sunday = new Date(2026, 10, 8, 18).toISOString()
    expect(computeWeekStreak([sunday], now)).toBe(1)
    expect(computeWeekStreak([sunday], new Date(2026, 10, 16, 10))).toBe(0)
  })
})

describe('resumen de rachas', () => {
  it('sin entrenos todo está a cero', () => {
    expect(summarizeStreaks([], now)).toMatchObject({
      currentDayStreak: 0,
      trainedToday: false,
      totalTrainings: 0,
    })
  })

  it('sabe si hoy ya has entrenado y cuál fue el último', () => {
    const summary = summarizeStreaks([at(10), at(12)], now)
    expect(summary.trainedToday).toBe(true)
    expect(summary.lastTrainingDate).toBe(at(12))
    expect(summary.totalTrainings).toBe(2)
  })
})

describe('calculadora de discos (RN-3.09)', () => {
  it('reparte el peso por lado con los discos más grandes primero', () => {
    const result = calculatePlateDistribution(100, 20)
    expect(result.perSide).toEqual([25, 15])
    expect(result.isExact).toBe(true)
  })

  it('usa discos fraccionados', () => {
    expect(calculatePlateDistribution(62.5, 20).perSide).toEqual([20, 1.25])
  })

  it('si no es exacto, da el peso más cercano por debajo y la diferencia', () => {
    const result = calculatePlateDistribution(101, 20)
    expect(result.isExact).toBe(false)
    expect(result.totalLoaded).toBe(100)
    expect(result.remainder).toBe(1)
  })

  it('con un objetivo menor o igual que la barra, no pone discos', () => {
    expect(calculatePlateDistribution(20, 20)).toMatchObject({ perSide: [], isExact: true })
    expect(calculatePlateDistribution(15, 20).perSide).toEqual([])
  })

  it('respeta otra barra (15 kg)', () => {
    expect(calculatePlateDistribution(55, 15).perSide).toEqual([20])
  })
})

describe('aviso de racha (RN-6.06)', () => {
  const base = { streak: 4, trainedToday: false, hour: 19, lastWarningDay: null }
  const at5pm = new Date(2026, 10, 12, 17, 0, 0)

  it('antes de la hora, espera hasta la hora elegida', () => {
    expect(streakWarningDelay({ ...base, now: at5pm })).toBe(2 * 60 * 60 * 1000)
  })

  it('pasada la hora, avisa ya', () => {
    expect(streakWarningDelay({ ...base, now: new Date(2026, 10, 12, 21, 30) })).toBe(0)
  })

  it('no avisa con racha de menos de 3 días, si ya has entrenado o si ya avisó hoy', () => {
    expect(streakWarningDelay({ ...base, streak: 2, now: at5pm })).toBeNull()
    expect(streakWarningDelay({ ...base, trainedToday: true, now: at5pm })).toBeNull()
    expect(streakWarningDelay({ ...base, lastWarningDay: '2026-11-12', now: at5pm })).toBeNull()
  })

  it('un aviso de ayer no impide el de hoy', () => {
    expect(streakWarningDelay({ ...base, lastWarningDay: '2026-11-11', now: at5pm })).not.toBeNull()
  })
})
