import { sessionVolume } from '../utils/workoutRules'
import { db } from './db'
import { recomputeRecordsFrom } from './prs'

const nonNegative = (value) => Math.max(0, Number(value) || 0)

/**
 * Corrige kilos y repeticiones de una sesión pasada (FR-3.19). Recalcula su volumen y los récords de
 * esa sesión y de las posteriores (RN-4.15), y lo guarda todo en una sola operación: o se guarda
 * entero o no cambia nada. `changes` es un objeto { [idSerie]: { peso, reps } } con lo que se ha tocado.
 */
export async function correctSession(training, changes, now = new Date().toISOString()) {
  const [trainings, sets, records] = await Promise.all([
    db.getAllTrainings(),
    db.getAllPerformedExercises(),
    db.getAllPersonalRecords(),
  ])

  const corrections = []
  const correctedSets = sets.map((set) => {
    const change = changes[set.id]
    if (!change || set.entrenamientoId !== training.id) return set
    const corrected = {
      ...set,
      pesoUtilizado: nonNegative(change.peso ?? set.pesoUtilizado),
      repeticionesRealizadas: Math.round(nonNegative(change.reps ?? set.repeticionesRealizadas)),
    }
    corrections.push({
      id: set.id,
      pesoUtilizado: corrected.pesoUtilizado,
      repeticionesRealizadas: corrected.repeticionesRealizadas,
    })
    return corrected
  })

  // Volumen de la sesión: series de trabajo (sin calentamiento), como al terminarla (RN-3.07).
  const volumenTotal = sessionVolume(correctedSets.filter((set) => set.entrenamientoId === training.id))

  const correctedTrainings = trainings.map((item) =>
    item.id === training.id ? { ...item, volumenTotal } : item,
  )
  const recordChanges = recomputeRecordsFrom(
    training.id,
    { trainings: correctedTrainings, sets: correctedSets, records },
    () => crypto.randomUUID(),
  )

  await db.correctTraining(training.id, {
    sets: corrections,
    volumenTotal,
    updatedAt: now,
    records: recordChanges,
  })
  return { volumenTotal, recordsRemoved: recordChanges.remove.length, recordsAdded: recordChanges.add.length }
}
