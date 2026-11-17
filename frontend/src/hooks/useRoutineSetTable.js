import { useMemo, useState } from 'react'
import {
  applyProgression,
  prefillSets,
  prTargets,
  setValue,
  suggestedWeight,
  updateRoutineSet,
} from '../utils/workoutRules'

/**
 * Tabla de series del entreno guiado: lo que el usuario escribe hoy encima de lo precargado de la
 * última vez, más la sugerencia de peso (doble progresión) y los objetivos de récord del ejercicio activo.
 */
export function useRoutineSetTable({
  initialSetData,
  routineExercises,
  activeRoutineExercise,
  latestSessions,
  history,
  prs,
}) {
  const [setData, setSetData] = useState(initialSetData)

  const prefilled = useMemo(
    () => prefillSets(routineExercises, latestSessions),
    [latestSessions, routineExercises],
  )

  const activeExerciseId = activeRoutineExercise?.ejercicioId
  const suggested = activeRoutineExercise
    ? suggestedWeight(activeRoutineExercise.repeticiones, latestSessions[activeExerciseId])
    : null

  const getSetValue = (routineExerciseId, serieNumero) =>
    setValue(setData, prefilled, `${routineExerciseId}-${serieNumero}`)

  const updateSetData = (routineExerciseId, serieNumero, field, value) => {
    const key = `${routineExerciseId}-${serieNumero}`
    setSetData((current) => ({
      ...current,
      [key]: updateRoutineSet(current[key], prefilled[key], field, value),
    }))
  }

  /** Sube 2,5 kg a las series de trabajo del ejercicio activo (RN-3.01, RN-3.02). */
  const applySuggestedWeight = () => {
    if (!activeRoutineExercise || suggested === null) return
    setSetData((current) => applyProgression(current, prefilled, activeRoutineExercise))
  }

  return {
    setData,
    getSetValue,
    updateSetData,
    applySuggestedWeight,
    clear: () => setSetData({}),
    activeExerciseSuggestedWeight: suggested,
    activeExercisePrTarget: activeRoutineExercise ? prTargets(prs, activeExerciseId, suggested) : null,
    activeExerciseHistory: activeRoutineExercise ? (history[activeExerciseId] ?? []).slice(0, 5) : [],
  }
}
