import { calculateSetVolume } from '../utils/calculations'
import { db } from './db'

/** Ejercicio con el que se guarda el récord de sesión (no pertenece a ningún ejercicio). */
export const SESSION_RECORD_EXERCISE = 'GLOBAL'

function setDetail(set) {
  const base = `${set.pesoUtilizado}kg x ${set.repeticionesRealizadas} reps`
  return typeof set.rpe === 'number' && set.rpe > 0 ? `${base} @ RPE ${set.rpe}` : base
}

/** Clave que identifica el peso de un récord de repeticiones. Es un dato, no un texto para el usuario. */
const sameWeightKey = (peso) => `a ${peso}kg`

/** Peso (kg) al que se refiere un récord de repeticiones, leído de su clave. */
export function weightOfRepsRecord(pr) {
  return Number(String(pr.detalle ?? '').replace(/[^\d.]/g, ''))
}

/** Agrupa una lista en un Map según una clave (como Map.groupBy, que aún no está en todos los navegadores). */
function groupBy(items, keyOf) {
  const groups = new Map()
  for (const item of items) {
    const key = keyOf(item)
    if (groups.has(key)) groups.get(key).push(item)
    else groups.set(key, [item])
  }
  return groups
}

function bestOf(history, exerciseId, tipo, detalle) {
  return history
    .filter(
      (pr) =>
        pr.ejercicioId === exerciseId &&
        pr.tipo === tipo &&
        (detalle === undefined || pr.detalle === detalle),
    )
    .reduce((best, pr) => Math.max(best, pr.valor), 0)
}

/**
 * Récords que bate una sesión (RN-4.05 a RN-4.09). Función pura: compara las series de trabajo con
 * el historial de récords y devuelve los nuevos, **como mucho uno por ejercicio y tipo** (el mejor
 * de la sesión). Así una serie ascendente (60, 62,5 y 65 kg) cuenta como un récord, no como tres.
 * En los récords de repeticiones, uno por cada peso que ya se había usado antes (`previousSets`
 * son las series de sesiones anteriores).
 */
export function computeSessionRecords(
  performedSets,
  history,
  sessionVolume,
  fechaIso,
  newId,
  previousSets = [],
) {
  const record = (ejercicioId, tipo, valor, detalle) => ({
    id: newId(),
    ejercicioId,
    tipo,
    valor,
    fecha: fechaIso,
    detalle,
  })
  const workSets = performedSets.filter((set) => set.type !== 'warmup')
  const byExercise = groupBy(workSets, (set) => set.ejercicioId)
  const records = []

  for (const [exerciseId, sets] of byExercise) {
    // A igualdad de marca, se queda la primera serie que la consiguió.
    const top = (valueOf) => sets.reduce((best, set) => (valueOf(set) > valueOf(best) ? set : best), sets[0])

    const heaviest = top((set) => set.pesoUtilizado)
    if (heaviest.pesoUtilizado > bestOf(history, exerciseId, 'peso_maximo')) {
      records.push(record(exerciseId, 'peso_maximo', heaviest.pesoUtilizado, setDetail(heaviest)))
    }

    const volumeOf = (set) => calculateSetVolume(set.pesoUtilizado, set.repeticionesRealizadas)
    const biggest = top(volumeOf)
    if (volumeOf(biggest) > bestOf(history, exerciseId, 'volumen_serie')) {
      records.push(record(exerciseId, 'volumen_serie', volumeOf(biggest), setDetail(biggest)))
    }

    for (const [peso, atWeight] of groupBy(sets, (set) => set.pesoUtilizado)) {
      const reps = Math.max(...atWeight.map((set) => set.repeticionesRealizadas))
      const key = sameWeightKey(peso)
      // La marca anterior con ese peso: el récord ya registrado o la mejor serie de trabajo anterior.
      const previous = Math.max(
        bestOf(history, exerciseId, 'reps_mismo_peso', key),
        ...previousSets
          .filter(
            (set) => set.ejercicioId === exerciseId && set.pesoUtilizado === peso && set.type !== 'warmup',
          )
          .map((set) => set.repeticionesRealizadas),
      )
      // La primera vez que se usa un peso no hay nada que batir: no cuenta como récord (RN-4.06).
      if (previous > 0 && reps > previous) {
        records.push(record(exerciseId, 'reps_mismo_peso', reps, key))
      }
    }
  }

  if (sessionVolume > bestOf(history, SESSION_RECORD_EXERCISE, 'volumen_total')) {
    records.push(record(SESSION_RECORD_EXERCISE, 'volumen_total', sessionVolume, ''))
  }
  return records
}

/** Registra los récords de una sesión recién guardada y devuelve cuántos son. */
export async function registerSessionRecords(performedSets, sessionVolume, fechaIso, trainingId) {
  const [history, allSets] = await Promise.all([db.getAllPersonalRecords(), db.getAllPerformedExercises()])
  // La sesión ya está guardada: sus propias series no cuentan como "anteriores".
  const previousSets = allSets.filter((set) => set.entrenamientoId !== trainingId)
  const records = computeSessionRecords(
    performedSets,
    history,
    sessionVolume,
    fechaIso,
    () => crypto.randomUUID(),
    previousSets,
  )
  await db.bulkAddPersonalRecords(records)
  return records.length
}

const timeOf = (fecha) => Date.parse(fecha) || 0
const recordKey = (pr) => [pr.ejercicioId, pr.tipo, pr.valor, pr.fecha, pr.detalle ?? ''].join('|')

/**
 * Recalcula los récords desde una sesión corregida en adelante (RN-4.15). Función pura.
 * - Los récords anteriores a esa sesión no cambian.
 * - Los récords de esa sesión y de las posteriores se rehacen en orden, como si cada sesión se
 *   acabase de guardar, con las series ya corregidas. Un récord pertenece a la sesión con su misma fecha.
 * - Un récord cuya sesión ya no existe se conserva tal cual (RI-08) y cuenta como marca a batir.
 * Devuelve los ids de los récords que dejan de valer y los nuevos; listas vacías si nada cambia.
 */
export function recomputeRecordsFrom(fromTrainingId, { trainings, sets, records }, newId) {
  const from = trainings.find((training) => training.id === fromTrainingId)
  if (!from) return { remove: [], add: [] }
  const ordered = trainings.slice().sort((a, b) => timeOf(a.fecha) - timeOf(b.fecha))
  const affected = ordered.filter((training) => timeOf(training.fecha) >= timeOf(from.fecha))
  const affectedDates = new Set(affected.map((training) => training.fecha))
  const dateOfTraining = new Map(trainings.map((training) => [training.id, training.fecha]))

  const stale = records.filter((pr) => affectedDates.has(pr.fecha))
  const kept = records.filter((pr) => !affectedDates.has(pr.fecha))
  const produced = []

  for (const training of affected) {
    const when = timeOf(training.fecha)
    const history = [...kept.filter((pr) => timeOf(pr.fecha) < when), ...produced]
    const sessionSets = sets.filter((set) => set.entrenamientoId === training.id)
    const previousSets = sets.filter((set) => {
      const date = dateOfTraining.get(set.entrenamientoId)
      return date !== undefined && timeOf(date) < when
    })
    produced.push(
      ...computeSessionRecords(
        sessionSets,
        history,
        Number(training.volumenTotal ?? 0),
        training.fecha,
        newId,
        previousSets,
      ),
    )
  }

  // Si el resultado es el mismo, no se toca nada (evita borrar y crear récords iguales).
  const before = stale.map(recordKey).sort().join('\n')
  const after = produced.map(recordKey).sort().join('\n')
  if (before === after) return { remove: [], add: [] }
  return { remove: stale.map((pr) => pr.id), add: produced }
}
