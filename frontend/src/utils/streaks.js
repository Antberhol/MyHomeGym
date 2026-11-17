/**
 * Rachas de entrenamiento (RN-4.01 a RN-4.03). Funciones puras: reciben la fecha de "hoy" para
 * poder probarlas. Los días son días naturales en hora local, no bloques de 24 horas.
 */

export function toLocalDateKey(value) {
  const date = new Date(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function shiftDays(key, days) {
  const [year, month, day] = key.split('-').map(Number)
  return toLocalDateKey(new Date(year, month - 1, day + days))
}

/** Lunes (en hora local) de la semana de la fecha, como clave AAAA-MM-DD. Semanas de lunes a domingo. */
export function toWeekKey(value) {
  const date = new Date(value)
  const mondayOffset = (date.getDay() + 6) % 7
  return toLocalDateKey(new Date(date.getFullYear(), date.getMonth(), date.getDate() - mondayOffset))
}

function shiftWeeks(weekKey, weeks) {
  return shiftDays(weekKey, weeks * 7)
}

/** Cuenta hacia atrás desde el periodo actual o, si está vacío, desde el anterior. */
function countBackwards(keys, current, previous, step) {
  const anchor = keys.has(current) ? current : keys.has(previous) ? previous : null
  if (!anchor) return 0

  let streak = 0
  for (let cursor = anchor; keys.has(cursor); cursor = step(cursor)) streak += 1
  return streak
}

/** Días naturales seguidos con al menos un entreno, contando desde hoy o desde ayer. */
export function computeDayStreak(dates, now = new Date()) {
  const keys = new Set(dates.map(toLocalDateKey))
  const today = toLocalDateKey(now)
  return countBackwards(keys, today, shiftDays(today, -1), (key) => shiftDays(key, -1))
}

/** Semanas (lunes a domingo) seguidas con al menos un entreno, contando desde esta o desde la anterior. */
export function computeWeekStreak(dates, now = new Date()) {
  const keys = new Set(dates.map(toWeekKey))
  const thisWeek = toWeekKey(now)
  return countBackwards(keys, thisWeek, shiftWeeks(thisWeek, -1), (key) => shiftWeeks(key, -1))
}

/** Resumen de rachas a partir de las fechas de los entrenos. */
export function summarizeStreaks(dates, now = new Date()) {
  if (dates.length === 0) {
    return {
      currentDayStreak: 0,
      currentWeekStreak: 0,
      totalTrainings: 0,
      lastTrainingDate: null,
      trainedToday: false,
    }
  }
  const today = toLocalDateKey(now)
  return {
    currentDayStreak: computeDayStreak(dates, now),
    currentWeekStreak: computeWeekStreak(dates, now),
    totalTrainings: dates.length,
    lastTrainingDate: dates.reduce((latest, date) => (date > latest ? date : latest), dates[0]),
    trainedToday: dates.some((date) => toLocalDateKey(date) === today),
  }
}

export const MIN_STREAK_FOR_WARNING = 3

/**
 * Aviso de racha (RN-6.06): cuántos milisegundos faltan para avisar hoy, 0 si toca ya, o null si hoy
 * no hay que avisar (racha corta, ya has entrenado o ya se avisó hoy).
 */
export function streakWarningDelay({ streak, trainedToday, hour, lastWarningDay, now = new Date() }) {
  if (streak < MIN_STREAK_FOR_WARNING || trainedToday) return null
  if (lastWarningDay === toLocalDateKey(now)) return null
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hour)
  return Math.max(0, target.getTime() - now.getTime())
}
