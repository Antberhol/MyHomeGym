/** Evento global que avisa de que el descanso ha terminado: lo escuchan el pitido y la vibración. */
export const WORKOUT_TIMER_FINISHED_EVENT = 'myhomegym:workout-timer-finished'

export function emitWorkoutTimerFinished() {
  window.dispatchEvent(new CustomEvent(WORKOUT_TIMER_FINISHED_EVENT))
}

export function subscribeWorkoutTimerFinished(handler) {
  const listener = () => handler()
  window.addEventListener(WORKOUT_TIMER_FINISHED_EVENT, listener)
  return () => window.removeEventListener(WORKOUT_TIMER_FINISHED_EVENT, listener)
}
