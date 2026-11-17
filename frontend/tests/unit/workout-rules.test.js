import { describe, expect, it } from 'vitest'
import {
  applyProgression,
  buildPerformedSets,
  latestSessionByExercise,
  muscleDistribution,
  parseInputNumber,
  parseTargetReps,
  prefillSets,
  sessionVolume,
  suggestedWeight,
  summarizeByExercise,
} from '../../src/utils/workoutRules'

const set = (serieNumero, pesoUtilizado, repeticionesRealizadas, extra = {}) => ({
  ejercicioId: 'squat',
  fecha: '2026-11-10T18:00:00.000Z',
  serieNumero,
  pesoUtilizado,
  repeticionesRealizadas,
  type: 'normal',
  ...extra,
})

describe('repeticiones objetivo', () => {
  it('entiende rangos y números sueltos', () => {
    expect(parseTargetReps('8-12')).toEqual({ min: 8, max: 12 })
    expect(parseTargetReps('8 - 12')).toEqual({ min: 8, max: 12 })
    expect(parseTargetReps('5')).toEqual({ min: 5, max: 5 })
    expect(parseTargetReps('al fallo')).toBeNull()
  })

  it('lee números con coma decimal y trata lo demás como 0', () => {
    expect(parseInputNumber('62,5')).toBe(62.5)
    expect(parseInputNumber('')).toBe(0)
    expect(parseInputNumber('abc')).toBe(0)
  })
})

describe('doble progresión (RN-3.01, RN-3.02)', () => {
  const session = (sets) => ({ fecha: sets[0].fecha, sets })

  it('sugiere +2,5 kg sobre la serie más pesada si todas las de trabajo llegaron al máximo', () => {
    expect(suggestedWeight('8-12', session([set(1, 60, 12), set(2, 60, 12), set(3, 57.5, 12)]))).toBe(62.5)
  })

  it('no sugiere nada si una serie se quedó por debajo del máximo', () => {
    expect(suggestedWeight('8-12', session([set(1, 60, 12), set(2, 60, 11)]))).toBeNull()
  })

  it('ignora los calentamientos, aunque se quedaran cortos', () => {
    const sets = [set(1, 20, 5, { type: 'warmup' }), set(2, 60, 12), set(3, 60, 12)]
    expect(suggestedWeight('8-12', session(sets))).toBe(62.5)
  })

  it('con un objetivo fijo (5x5) sube al completar las 5 repeticiones', () => {
    expect(suggestedWeight('5', session([set(1, 100, 5), set(2, 100, 5)]))).toBe(102.5)
  })

  it('sin sesión anterior, solo con calentamientos o sin objetivo numérico, no sugiere', () => {
    expect(suggestedWeight('8-12', undefined)).toBeNull()
    expect(suggestedWeight('8-12', session([set(1, 20, 12, { type: 'warmup' })]))).toBeNull()
    expect(suggestedWeight('al fallo', session([set(1, 60, 12)]))).toBeNull()
  })

  it('al aplicar la subida, los calentamientos y las series sin peso no cambian', () => {
    const routineExercise = { id: 're1', series: 3 }
    const prefilled = {
      're1-1': { reps: 10, peso: 20, type: 'warmup' },
      're1-2': { reps: 12, peso: 60, type: 'normal' },
      're1-3': { reps: 12, peso: 0, type: 'normal' },
    }
    const result = applyProgression({}, prefilled, routineExercise)
    expect(result['re1-1'].peso).toBe(20)
    expect(result['re1-2'].peso).toBe(62.5)
    expect(result['re1-3'].peso).toBe(0)
  })
})

describe('la última vez (RN-3.03)', () => {
  it('toma la sesión más reciente anterior a ahora, con las series en orden', () => {
    const performed = [
      set(2, 60, 10, { fecha: '2026-11-05T18:00:00.000Z' }),
      set(2, 70, 8),
      set(1, 70, 8),
      set(1, 75, 6, { fecha: '2026-11-13T18:00:00.000Z' }),
    ]
    const latest = latestSessionByExercise(performed, '2026-11-12T00:00:00.000Z').squat
    expect(latest.fecha).toBe('2026-11-10T18:00:00.000Z')
    expect(latest.sets.map((s) => s.serieNumero)).toEqual([1, 2])
  })

  it('precarga las series de la rutina con lo que se hizo la última vez', () => {
    const latest = { squat: { sets: [set(1, 100, 5)] } }
    const prefilled = prefillSets([{ id: 're1', ejercicioId: 'squat', series: 2 }], latest)
    expect(prefilled['re1-1']).toMatchObject({ peso: 100, reps: 5 })
    expect(prefilled['re1-2']).toMatchObject({ peso: 0, reps: 0 })
  })
})

describe('guardar el entreno (RN-3.05, RN-3.07)', () => {
  let n = 0
  const base = { trainingId: 't1', now: '2026-11-13T10:00:00.000Z', newId: () => `id${(n += 1)}` }

  it('solo guarda las series con repeticiones y usa la rutina si la hay', () => {
    const stored = {
      're1-1': { reps: 5, peso: 100, type: 'normal' },
      're1-2': { reps: 0, peso: 100, type: 'normal' },
    }
    const performed = buildPerformedSets({
      ...base,
      routineExercises: [{ id: 're1', ejercicioId: 'squat', series: 2 }],
      readRoutineSet: (id, serie) => stored[`${id}-${serie}`],
      freeDrafts: [{ ejercicioId: 'bench', sets: [{ reps: 5, peso: 80 }] }],
    })
    expect(performed).toHaveLength(1)
    expect(performed[0]).toMatchObject({ ejercicioId: 'squat', serieNumero: 1, entrenamientoId: 't1' })
  })

  it('sin rutina guarda el entreno libre', () => {
    const performed = buildPerformedSets({
      ...base,
      routineExercises: [],
      readRoutineSet: () => null,
      freeDrafts: [
        {
          ejercicioId: 'bench',
          sets: [
            { reps: 5, peso: 80, rpe: 8 },
            { reps: 3, peso: 85 },
          ],
        },
      ],
    })
    expect(performed.map((p) => [p.serieNumero, p.pesoUtilizado, p.rpe])).toEqual([
      [1, 80, 8],
      [2, 85, undefined],
    ])
  })

  it('el volumen y el resumen por ejercicio no cuentan calentamientos', () => {
    const performed = [
      set(1, 20, 10, { type: 'warmup' }),
      set(2, 100, 5),
      { ...set(1, 80, 5), ejercicioId: 'bench' },
    ]
    expect(sessionVolume(performed)).toBe(900)
    const summary = summarizeByExercise(performed, (id) => id.toUpperCase())
    expect(summary[0]).toEqual({ exerciseId: 'squat', name: 'SQUAT', volume: 500, sets: 2 })
    expect(summary[1]).toMatchObject({ exerciseId: 'bench', volume: 400 })
  })

  it('el reparto por músculo para compartir usa solo la sesión y agrupa músculos', () => {
    const performed = [
      set(1, 100, 5),
      { ...set(1, 30, 10), ejercicioId: 'curl' },
      set(2, 20, 10, { type: 'warmup' }),
    ]
    const groups = { squat: 'Cuádriceps', curl: 'Bíceps' }
    expect(muscleDistribution(performed, (id) => groups[id])).toEqual([
      { muscle: 'piernas', volume: 500 },
      { muscle: 'brazos', volume: 300 },
    ])
  })
})
