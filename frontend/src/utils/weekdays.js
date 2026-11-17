import { normalizeExerciseName } from './text'

/** Días de la semana tal y como se guardan en las rutinas (sin tildes), de lunes a domingo. */
export const WEEKDAYS = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']

const JS_DAY_TO_KEY = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado']

export function todayWeekday(date = new Date()) {
  return JS_DAY_TO_KEY[date.getDay()]
}

/** Acepta días escritos a mano en versiones antiguas ("Miércoles", "miercoles "). */
export function normalizeWeekday(value) {
  const normalized = normalizeExerciseName(value)
  return WEEKDAYS.find((day) => day === normalized) ?? null
}

export function routineRunsOn(routine, weekday = todayWeekday()) {
  return (routine?.diasSemana ?? []).some((day) => normalizeWeekday(day) === weekday)
}
