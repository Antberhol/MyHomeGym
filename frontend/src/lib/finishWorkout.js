import { workoutRepository } from '../repositories/workoutRepository'
import { buildPerformedSets, sessionVolume, summarizeByExercise } from '../utils/workoutRules'
import { registerSessionRecords } from './prs'

/**
 * Guarda el entreno terminado con sus series (en una sola operación, RN-3.05), registra los récords
 * (RN-4.05 a RN-4.08) y devuelve el resumen que se enseña al usuario.
 */
export async function finishWorkout({
  routineId,
  durationMinutes,
  notes,
  manualVolume,
  routineExercises,
  readRoutineSet,
  freeDrafts,
  exerciseNotes,
  nameOf,
}) {
  const now = new Date().toISOString()
  const trainingId = crypto.randomUUID()
  const performed = buildPerformedSets({
    routineExercises,
    readRoutineSet,
    freeDrafts,
    trainingId,
    now,
    newId: () => crypto.randomUUID(),
  })
  const totalVolume = performed.length > 0 ? sessionVolume(performed) : Number(manualVolume ?? 0)

  await workoutRepository.createCompletedTraining(
    {
      id: trainingId,
      rutinaId: routineId || undefined,
      fecha: now,
      duracionMinutos: durationMinutes,
      notas: notes,
      completado: true,
      volumenTotal: totalVolume,
    },
    performed,
  )

  // El entreno ya está guardado: un fallo al registrar récords no debe anularlo ni invitar a repetirlo.
  let prsCreated = 0
  try {
    prsCreated = await registerSessionRecords(performed, totalVolume, now, trainingId)
  } catch {
    // Los récords se pueden recalcular más adelante; el entreno manda.
  }

  return {
    durationMinutes,
    totalVolume,
    setCount: performed.length,
    prsCreated,
    performed,
    byExercise: summarizeByExercise(performed, nameOf),
    exerciseNotes: Object.entries(exerciseNotes)
      .filter(([, note]) => note.trim())
      .map(([exerciseId, note]) => ({ exerciseId, name: nameOf(exerciseId), note: note.trim() })),
  }
}
