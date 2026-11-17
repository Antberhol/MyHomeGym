import { useState } from 'react'
import { parseInputNumber } from '../utils/workoutRules'

const EMPTY_SET = { reps: 0, peso: 0, type: 'normal' }

/**
 * Borrador del entreno libre: los ejercicios que el usuario va añadiendo y sus series.
 * `latestSessions` es la última sesión de cada ejercicio, para precargar sus series (FR-3.12).
 */
export function useFreeWorkoutDraft({ initialDraft = [], latestSessions }) {
  const [drafts, setDrafts] = useState(initialDraft)
  const [exerciseId, setExerciseId] = useState('')
  const [seriesCount, setSeriesCount] = useState(3)

  const updateDraft = (draftId, change) =>
    setDrafts((current) => current.map((item) => (item.id === draftId ? change(item) : item)))

  /** Añade un ejercicio con las series de la última vez ya escritas, o con `seriesCount` vacías. */
  const addExercise = (id = exerciseId) => {
    if (!id) return
    const previous = latestSessions[id]?.sets ?? []
    const sets = previous.length
      ? previous.map((set) => ({
          reps: set.repeticionesRealizadas,
          peso: set.pesoUtilizado,
          type: set.type ?? 'normal',
        }))
      : Array.from({ length: Math.max(1, seriesCount) }, () => ({ ...EMPTY_SET }))
    setDrafts((current) => [...current, { id: crypto.randomUUID(), ejercicioId: id, sets }])
    setExerciseId('')
  }

  const removeExercise = (draftId) => setDrafts((current) => current.filter((item) => item.id !== draftId))

  const moveExercise = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return
    setDrafts((current) => {
      const outOfRange = [fromIndex, toIndex].some((index) => index < 0 || index >= current.length)
      if (outOfRange) return current
      const next = current.slice()
      ;[next[fromIndex], next[toIndex]] = [next[toIndex], next[fromIndex]]
      return next
    })
  }

  /** Añade una serie copiando la última (sin marcarla como hecha). */
  const addSet = (draftId) =>
    updateDraft(draftId, (item) => ({
      ...item,
      sets: [...item.sets, { ...(item.sets.at(-1) ?? EMPTY_SET), type: 'normal', done: false }],
    }))

  /** Quita una serie; un ejercicio nunca se queda sin series. */
  const removeSet = (draftId, setIndex) =>
    updateDraft(draftId, (item) => {
      const sets = item.sets.filter((_, index) => index !== setIndex)
      return { ...item, sets: sets.length > 0 ? sets : [{ ...EMPTY_SET }] }
    })

  const updateSet = (draftId, setIndex, field, rawValue) => {
    const value = field === 'type' || field === 'done' ? rawValue : parseInputNumber(rawValue)
    updateDraft(draftId, (item) => ({
      ...item,
      sets: item.sets.map((set, index) => {
        if (index !== setIndex) return set
        if (field === 'rpe') return { ...set, rpe: value > 0 ? value : undefined }
        return { ...set, type: set.type ?? 'normal', [field]: value }
      }),
    }))
  }

  const reset = () => {
    setDrafts([])
    setExerciseId('')
    setSeriesCount(3)
  }

  return {
    drafts,
    exerciseId,
    seriesCount,
    setExerciseId,
    setSeriesCount,
    addExercise,
    removeExercise,
    moveExercise,
    addSet,
    removeSet,
    updateSet,
    reset,
  }
}
