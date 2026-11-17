import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { LANGUAGE_STORAGE_KEY } from '../../i18n'
import { clearStorageExcept } from '../../lib/browserCache'
import {
  WORKOUT_SESSION_STORAGE_KEY,
  clearPersistedWorkoutSession,
  getPersistedWorkoutSession,
} from '../../hooks/usePersistedWorkoutSession'

async function clearCacheAndReload() {
  try {
    // Se conservan el idioma y el entreno en curso, si se puede leer (RN-6.14).
    clearStorageExcept(
      localStorage,
      [LANGUAGE_STORAGE_KEY, WORKOUT_SESSION_STORAGE_KEY],
      (key) => key !== WORKOUT_SESSION_STORAGE_KEY || getPersistedWorkoutSession() !== null,
    )
    sessionStorage.clear()

    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations()
      await Promise.all(registrations.map((registration) => registration.unregister()))
    }
  } finally {
    window.location.reload()
  }
}

function hasWorkoutInProgress() {
  try {
    return getPersistedWorkoutSession() !== null
  } catch {
    return false
  }
}

export function ErrorFallback({ error, resetErrorBoundary }) {
  const { t } = useTranslation()
  const [workoutInProgress, setWorkoutInProgress] = useState(hasWorkoutInProgress)
  const errorMessage = error instanceof Error ? error.message : t('errors.unknown')

  return (
    <div className="flex min-h-screen items-center justify-center bg-gym-bg-dark p-4">
      <section className="w-full max-w-md space-y-4 rounded-2xl border border-gym-border bg-gym-card p-5">
        <h1 className="text-lg font-semibold">{t('errorScreen.title')}</h1>
        <p className="text-[15px] text-gym-text-dim">{t('errorScreen.body')}</p>
        <p className="rounded-lg bg-gym-black p-2 text-xs text-gym-text-muted">{errorMessage}</p>
        {workoutInProgress && <p className="text-[15px] text-gym-text-dim">{t('errorScreen.workoutKept')}</p>}
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={resetErrorBoundary}
            className="h-11 rounded-lg bg-gym-accent px-4 text-sm font-semibold text-gym-on-accent"
          >
            {t('errorScreen.retry')}
          </button>
          <button
            type="button"
            onClick={() => {
              void clearCacheAndReload()
            }}
            className="h-11 rounded-lg border border-gym-border-2 px-4 text-sm font-semibold text-gym-text-bright"
          >
            {t('errorScreen.clear')}
          </button>
          {workoutInProgress && (
            <button
              type="button"
              onClick={() => {
                clearPersistedWorkoutSession()
                setWorkoutInProgress(false)
              }}
              className="h-11 rounded-lg border border-gym-danger px-4 text-sm font-semibold text-gym-danger"
            >
              {t('errorScreen.discardWorkout')}
            </button>
          )}
        </div>
      </section>
    </div>
  )
}
