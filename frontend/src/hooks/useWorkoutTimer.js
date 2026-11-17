import { useEffect, useRef, useState } from 'react'
import { emitWorkoutTimerFinished } from '../lib/events'
import { scheduleRestTimerNotification } from '../lib/notifications'
import { elapsedSeconds, formatClock, remainingSeconds } from '../utils/workoutClock'

/** Repite `tick` cada segundo y cada vez que la app vuelve a primer plano. Devuelve cómo parar. */
function everySecond(tick) {
  const intervalId = window.setInterval(tick, 1000)
  document.addEventListener('visibilitychange', tick)
  return () => {
    window.clearInterval(intervalId)
    document.removeEventListener('visibilitychange', tick)
  }
}

/**
 * Cronómetro del entreno y cuenta atrás del descanso. Los dos se calculan con la hora real, así que
 * siguen bien aunque el móvil se bloquee o la app pase a segundo plano.
 */
export function useWorkoutTimer(options = {}) {
  const [sessionSeconds, setSessionSecondsState] = useState(options.initialSessionSeconds ?? 0)
  const [sessionRunning, setSessionRunning] = useState(options.initialSessionRunning ?? true)
  const [restSeconds, setRestSecondsState] = useState(0)

  // base: segundos acumulados antes de la última reanudación; since: cuándo se reanudó.
  const session = useRef({ base: options.initialSessionSeconds ?? 0, since: null })
  const rest = useRef({ endsAt: null, notificationId: null })

  useEffect(() => {
    if (!sessionRunning) return
    const clock = session.current
    clock.since = Date.now()
    const stop = everySecond(() =>
      setSessionSecondsState(elapsedSeconds(clock.base, clock.since, Date.now())),
    )
    return () => {
      stop()
      // Al pausar se consolida lo transcurrido: el tiempo en pausa no cuenta (RN-3.04).
      clock.base = elapsedSeconds(clock.base, clock.since, Date.now())
      clock.since = null
    }
  }, [sessionRunning])

  const cancelRestNotification = () => {
    if (rest.current.notificationId !== null) window.clearTimeout(rest.current.notificationId)
    rest.current.notificationId = null
  }

  /** Fija el descanso a `seconds`. Con 0 lo cancela en silencio (saltar el descanso). */
  const setRestSeconds = (seconds) => {
    cancelRestNotification()
    const next = Math.max(0, Math.round(seconds))
    rest.current.endsAt = next > 0 ? Date.now() + next * 1000 : null
    setRestSecondsState(next)
    // El aviso se reprograma con el tiempo nuevo; así nunca llega a destiempo tras ajustar o saltar.
    if (next > 0 && options.restNotificationsEnabled) {
      rest.current.notificationId = scheduleRestTimerNotification(next)
    }
  }

  const restActive = restSeconds > 0
  useEffect(() => {
    if (!restActive) return
    return everySecond(() => {
      const remaining = remainingSeconds(rest.current.endsAt, Date.now())
      setRestSecondsState(remaining)
      if (remaining > 0) return
      rest.current.endsAt = null
      // Con la app a la vista basta el pitido; el aviso solo hace falta si está en segundo plano.
      if (document.visibilityState === 'visible') cancelRestNotification()
      emitWorkoutTimerFinished()
    })
  }, [restActive])

  useEffect(() => cancelRestNotification, [])

  const resetTimers = () => {
    // Se modifica el mismo objeto: el efecto del cronómetro lo tiene referenciado.
    session.current.base = 0
    session.current.since = sessionRunning ? Date.now() : null
    setSessionSecondsState(0)
    setSessionRunning(true)
    setRestSeconds(0)
  }

  return {
    sessionSeconds,
    sessionRunning,
    setSessionRunning,
    toggleSessionRunning: () => setSessionRunning((current) => !current),
    restSeconds,
    setRestSeconds,
    startRestTimer: setRestSeconds,
    resetTimers,
    formatClock,
  }
}
