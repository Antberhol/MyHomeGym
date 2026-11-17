import { useEffect } from 'react'

export const WORKOUT_SESSION_STORAGE_KEY = 'myhomegym.activeWorkoutSession'

function safeReadSession() {
  if (typeof window === 'undefined') return null

  const raw = window.localStorage.getItem(WORKOUT_SESSION_STORAGE_KEY)
  if (!raw) return null

  try {
    const parsed = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return null

    return {
      selectedRoutineId: parsed.selectedRoutineId ?? '',
      setData: parsed.setData ?? {},
      sessionSeconds: Number(parsed.sessionSeconds ?? 0),
      activeExerciseIndex: Number(parsed.activeExerciseIndex ?? 0),
      freeExercisesDraft: Array.isArray(parsed.freeExercisesDraft) ? parsed.freeExercisesDraft : [],
    }
  } catch {
    return null
  }
}

export function getPersistedWorkoutSession() {
  return safeReadSession()
}

export function clearPersistedWorkoutSession() {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(WORKOUT_SESSION_STORAGE_KEY)
}

export function usePersistedWorkoutSession({
  selectedRoutineId,
  setData,
  sessionSeconds,
  activeExerciseIndex,
  freeExercisesDraft = [],
}) {
  useEffect(() => {
    if (typeof window === 'undefined') return

    const hasMeaningfulData = Boolean(
      selectedRoutineId ||
      freeExercisesDraft.length > 0 ||
      Object.keys(setData).length > 0 ||
      sessionSeconds > 0 ||
      activeExerciseIndex > 0,
    )

    if (!hasMeaningfulData) {
      clearPersistedWorkoutSession()
      return
    }

    const session = {
      selectedRoutineId,
      setData,
      sessionSeconds,
      activeExerciseIndex,
      freeExercisesDraft,
    }

    window.localStorage.setItem(WORKOUT_SESSION_STORAGE_KEY, JSON.stringify(session))
  }, [activeExerciseIndex, freeExercisesDraft, selectedRoutineId, sessionSeconds, setData])

  return {
    clearSession: clearPersistedWorkoutSession,
  }
}
