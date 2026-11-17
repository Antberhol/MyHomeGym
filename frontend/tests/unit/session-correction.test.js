import { beforeEach, describe, expect, it, vi } from 'vitest'
import { computeSessionRecords, recomputeRecordsFrom } from '../../src/lib/prs'

const correctTraining = vi.fn(async () => ({}))
const data = { trainings: [], sets: [], records: [] }
vi.mock('../../src/lib/db', () => ({
  db: {
    getAllTrainings: async () => data.trainings,
    getAllPerformedExercises: async () => data.sets,
    getAllPersonalRecords: async () => data.records,
    correctTraining: (...args) => correctTraining(...args),
  },
}))
const { correctSession } = await import('../../src/lib/correctSession')

let n = 0
const newId = () => `nuevo${(n += 1)}`
const day = (d) => `2026-11-${String(d).padStart(2, '0')}T10:00:00.000Z`
const training = (id, d, volumenTotal) => ({ id, fecha: day(d), volumenTotal })
const set = (id, entrenamientoId, pesoUtilizado, repeticionesRealizadas, d) => ({
  id,
  entrenamientoId,
  ejercicioId: 'Barbell_Squat',
  pesoUtilizado,
  repeticionesRealizadas,
  type: 'normal',
  fecha: day(d),
})

/** Historial como si cada sesión se hubiese guardado en su día, en orden. */
function recordsAsSaved(trainings, sets) {
  const result = []
  for (const t of trainings) {
    const previous = sets.filter((s) => trainings.find((x) => x.id === s.entrenamientoId).fecha < t.fecha)
    result.push(
      ...computeSessionRecords(
        sets.filter((s) => s.entrenamientoId === t.id),
        [...result],
        t.volumenTotal,
        t.fecha,
        newId,
        previous,
      ),
    )
  }
  return result
}

describe('corregir una sesión pasada recalcula los récords (RN-4.15)', () => {
  beforeEach(() => {
    n = 0
    correctTraining.mockClear()
  })

  it('una errata de 100 kg deja de ser récord y la sesión posterior recupera el suyo', () => {
    const trainings = [training('a', 1, 500), training('b', 8, 325)]
    const typo = [set('s1', 'a', 100, 5, 1), set('s2', 'b', 65, 5, 8)]
    const saved = recordsAsSaved(trainings, typo)
    // Con la errata, la sesión b no batió nada: solo hay récords de la sesión a.
    expect(saved.every((pr) => pr.fecha === day(1))).toBe(true)

    const fixed = [set('s1', 'a', 60, 5, 1), typo[1]]
    const { remove, add } = recomputeRecordsFrom(
      'a',
      { trainings: [training('a', 1, 300), trainings[1]], sets: fixed, records: saved },
      newId,
    )

    expect(remove).toEqual(saved.map((pr) => pr.id))
    const weight = add.filter((pr) => pr.tipo === 'peso_maximo')
    expect(weight.map((pr) => [pr.valor, pr.fecha])).toEqual([
      [60, day(1)],
      [65, day(8)],
    ])
  })

  it('no toca los récords anteriores a la sesión corregida ni los de sesiones que ya no existen', () => {
    const trainings = [training('a', 1, 400), training('b', 8, 450)]
    const sets = [set('s1', 'a', 80, 5, 1), set('s2', 'b', 90, 5, 8)]
    const saved = recordsAsSaved(trainings, sets)
    const orphan = {
      id: 'huerfano',
      ejercicioId: 'Barbell_Squat',
      tipo: 'peso_maximo',
      valor: 85,
      fecha: day(5),
    }

    const { remove, add } = recomputeRecordsFrom(
      'b',
      { trainings, sets: [sets[0], { ...sets[1], pesoUtilizado: 84 }], records: [...saved, orphan] },
      newId,
    )

    expect(remove.every((id) => saved.find((pr) => pr.id === id).fecha === day(8))).toBe(true)
    // 84 kg ya no supera los 85 del récord huérfano: la sesión b se queda sin récord de peso.
    expect(add.filter((pr) => pr.tipo === 'peso_maximo')).toHaveLength(0)
  })

  it('si la corrección no cambia ningún récord, no borra ni crea nada', () => {
    const trainings = [training('a', 1, 500)]
    const sets = [set('s1', 'a', 100, 5, 1)]
    const saved = recordsAsSaved(trainings, sets)
    expect(recomputeRecordsFrom('a', { trainings, sets, records: saved }, newId)).toEqual({
      remove: [],
      add: [],
    })
  })

  it('guarda series, volumen y récords en una sola llamada', async () => {
    data.trainings = [training('a', 1, 500)]
    data.sets = [set('s1', 'a', 100, 5, 1), { ...set('s0', 'a', 40, 10, 1), type: 'warmup' }]
    data.records = recordsAsSaved(data.trainings, data.sets)

    const result = await correctSession(data.trainings[0], { s1: { peso: '60', reps: '5' } }, day(17))

    expect(correctTraining).toHaveBeenCalledTimes(1)
    const [id, body] = correctTraining.mock.calls[0]
    expect(id).toBe('a')
    expect(body.sets).toEqual([{ id: 's1', pesoUtilizado: 60, repeticionesRealizadas: 5 }])
    // El calentamiento no suma volumen (RN-3.07).
    expect(body.volumenTotal).toBe(300)
    expect(result.volumenTotal).toBe(300)
    expect(body.records.remove).toHaveLength(data.records.length)
    expect(body.records.add.find((pr) => pr.tipo === 'peso_maximo').valor).toBe(60)
  })
})
