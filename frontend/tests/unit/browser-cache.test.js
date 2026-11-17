import { beforeEach, describe, expect, it } from 'vitest'
import { clearStorageExcept } from '../../src/lib/browserCache'
import {
  WORKOUT_SESSION_STORAGE_KEY,
  getPersistedWorkoutSession,
} from '../../src/hooks/usePersistedWorkoutSession'

const workoutStillReadable = (key) =>
  key !== WORKOUT_SESSION_STORAGE_KEY || getPersistedWorkoutSession() !== null

describe('borrar caché (RN-6.14)', () => {
  beforeEach(() => localStorage.clear())

  it('conserva el idioma y el entreno en curso y borra lo demás', () => {
    localStorage.setItem('myhomegym-language', 'en')
    localStorage.setItem(WORKOUT_SESSION_STORAGE_KEY, JSON.stringify({ selectedRoutineId: 'r1' }))
    localStorage.setItem('gym-ui-state', '{}')

    const kept = clearStorageExcept(
      localStorage,
      ['myhomegym-language', WORKOUT_SESSION_STORAGE_KEY],
      workoutStillReadable,
    )

    expect(kept).toEqual(['myhomegym-language', WORKOUT_SESSION_STORAGE_KEY])
    expect(localStorage.getItem('gym-ui-state')).toBeNull()
    expect(getPersistedWorkoutSession().selectedRoutineId).toBe('r1')
  })

  it('descarta un entreno en curso que ya no se puede leer', () => {
    localStorage.setItem(WORKOUT_SESSION_STORAGE_KEY, '{roto')

    const kept = clearStorageExcept(localStorage, [WORKOUT_SESSION_STORAGE_KEY], workoutStillReadable)

    expect(kept).toEqual([])
    expect(localStorage.getItem(WORKOUT_SESSION_STORAGE_KEY)).toBeNull()
  })
})
