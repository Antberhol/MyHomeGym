import { describe, expect, it } from 'vitest'
import { computeSessionRecords } from '../../src/lib/prs'

let n = 0
const newId = () => `pr${(n += 1)}`
const NOW = '2026-11-16T10:00:00.000Z'
const set = (pesoUtilizado, repeticionesRealizadas, extra = {}) => ({
  ejercicioId: 'Barbell_Squat',
  pesoUtilizado,
  repeticionesRealizadas,
  type: 'normal',
  ...extra,
})
const records = (sets, history = [], volume = 0) => computeSessionRecords(sets, history, volume, NOW, newId)
const ofType = (list, tipo) => list.filter((pr) => pr.tipo === tipo)

describe('récords de una sesión (RN-4.05 a RN-4.09)', () => {
  it('guarda peso máximo y volumen de serie con el detalle de la serie', () => {
    const result = records([set(100, 5, { rpe: 8 })])
    expect(ofType(result, 'peso_maximo')[0]).toMatchObject({
      valor: 100,
      detalle: '100kg x 5 reps @ RPE 8',
      fecha: NOW,
    })
    expect(ofType(result, 'volumen_serie')[0].valor).toBe(500)
  })

  it('no cuenta las series de calentamiento', () => {
    expect(records([set(60, 10, { type: 'warmup' })])).toHaveLength(0)
    const result = records([set(90, 5, { type: 'warmup' }), set(85, 5)])
    expect(ofType(result, 'peso_maximo')[0].valor).toBe(85)
  })

  it('solo crea récord de peso si se supera el anterior', () => {
    const history = [{ ejercicioId: 'Barbell_Squat', tipo: 'peso_maximo', valor: 100 }]
    expect(ofType(records([set(90, 5), set(100, 5)], history), 'peso_maximo')).toHaveLength(0)
    expect(ofType(records([set(102.5, 3)], history), 'peso_maximo')).toHaveLength(1)
  })

  it('una serie ascendente cuenta como un solo récord de peso: el mejor de la sesión', () => {
    const result = records([set(60, 5), set(62.5, 5), set(65, 5)])
    expect(ofType(result, 'peso_maximo')).toHaveLength(1)
    expect(ofType(result, 'peso_maximo')[0].valor).toBe(65)
    expect(ofType(result, 'volumen_serie')).toHaveLength(1)
  })

  it('récord de repeticiones: uno por peso, y solo si supera las de ese mismo peso', () => {
    const history = [
      { ejercicioId: 'Barbell_Squat', tipo: 'reps_mismo_peso', valor: 8, detalle: 'a 60kg' },
      { ejercicioId: 'Barbell_Squat', tipo: 'reps_mismo_peso', valor: 12, detalle: 'a 50kg' },
    ]
    const result = ofType(records([set(60, 9), set(60, 10), set(50, 12)], history), 'reps_mismo_peso')
    expect(result).toHaveLength(1)
    expect(result[0]).toMatchObject({ valor: 10, detalle: 'a 60kg' })
  })

  it('la primera vez que se usa un peso no es récord de repeticiones; la siguiente con más, sí', () => {
    expect(ofType(records([set(70, 8)]), 'reps_mismo_peso')).toHaveLength(0)

    const earlier = [set(70, 8), set(70, 12, { type: 'warmup' }), { ...set(70, 20), ejercicioId: 'Otro' }]
    const same = computeSessionRecords([set(70, 8)], [], 0, NOW, newId, earlier)
    expect(ofType(same, 'reps_mismo_peso')).toHaveLength(0)
    const better = computeSessionRecords([set(70, 9)], [], 0, NOW, newId, earlier)
    expect(ofType(better, 'reps_mismo_peso')[0]).toMatchObject({ valor: 9, detalle: 'a 70kg' })
  })

  it('cada ejercicio tiene sus propios récords', () => {
    const history = [{ ejercicioId: 'Barbell_Squat', tipo: 'peso_maximo', valor: 200 }]
    const result = records([set(100, 5), { ...set(80, 5), ejercicioId: 'Bench' }], history)
    expect(ofType(result, 'peso_maximo').map((pr) => pr.ejercicioId)).toEqual(['Bench'])
  })

  it('récord de sesión cuando el volumen total supera el de cualquier sesión anterior', () => {
    const history = [{ ejercicioId: 'GLOBAL', tipo: 'volumen_total', valor: 5000 }]
    expect(ofType(records([set(100, 5)], history, 4000), 'volumen_total')).toHaveLength(0)
    const result = ofType(records([set(100, 5)], history, 5200), 'volumen_total')
    expect(result[0]).toMatchObject({ ejercicioId: 'GLOBAL', valor: 5200, detalle: '' })
  })

  it('con el peso del cuerpo (0 kg) no hay récord de peso ni de volumen, pero sí de repeticiones', () => {
    expect(records([set(0, 12)])).toHaveLength(0)
    const result = computeSessionRecords([set(0, 12)], [], 0, NOW, newId, [set(0, 10)])
    expect(result.map((pr) => pr.tipo)).toEqual(['reps_mismo_peso'])
  })
})
