/**
 * Cálculos del cronómetro y del descanso a partir de la hora real (RN-3.04, RN-3.10).
 * No se cuentan "tics": con el móvil bloqueado o la app en segundo plano el navegador los congela,
 * pero la hora sigue corriendo.
 */

/** Segundos de entreno: lo acumulado antes de la última reanudación más lo que lleva en marcha. */
export function elapsedSeconds(baseSeconds, runningSinceMs, nowMs) {
  if (runningSinceMs === null) return baseSeconds
  return baseSeconds + Math.max(0, Math.floor((nowMs - runningSinceMs) / 1000))
}

/** Segundos que quedan de descanso (redondeando hacia arriba), o 0 si ya ha terminado. */
export function remainingSeconds(endsAtMs, nowMs) {
  if (endsAtMs === null) return 0
  return Math.max(0, Math.ceil((endsAtMs - nowMs) / 1000))
}

export function formatClock(totalSeconds) {
  const safe = Math.max(0, totalSeconds)
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
