import { calculateSetVolume } from './calculations'

/** Reglas del entreno en curso. Funciones puras, sin React, para poder probarlas (RN-3.x). */

export const PROGRESSION_STEP_KG = 2.5
export const SET_TYPES = ['normal', 'warmup', 'dropset', 'failure']

/** Rango de repeticiones objetivo: "8-12" → {min: 8, max: 12}; "5" → {min: 5, max: 5}; otra cosa → null. */
export function parseTargetReps(target) {
  const text = String(target ?? '')
  const range = text.match(/(\d+)\s*-\s*(\d+)/)
  if (range) return { min: Number(range[1]), max: Number(range[2]) }
  const single = text.match(/^\s*(\d+)\s*$/)
  if (single) return { min: Number(single[1]), max: Number(single[1]) }
  return null
}

/** Número escrito por el usuario (acepta coma decimal). Lo que no es un número vale 0. */
export function parseInputNumber(raw) {
  const normalized = String(raw ?? '')
    .replace(',', '.')
    .trim()
  if (!normalized) return 0
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Primer tipo de serie válido de la lista, o 'normal'. */
export function currentSetType(...candidates) {
  return candidates.find((candidate) => SET_TYPES.includes(candidate)) ?? 'normal'
}

const isWorkSet = (set) => set.type !== 'warmup'
const workVolume = (sets) =>
  sets
    .filter(isWorkSet)
    .reduce((total, set) => total + calculateSetVolume(set.pesoUtilizado, set.repeticionesRealizadas), 0)

/**
 * Última sesión anterior a `beforeIso` de cada ejercicio (RN-3.03): {ejercicioId: {fecha, sets}},
 * con las series ordenadas por número.
 */
export function latestSessionByExercise(performedSets, beforeIso) {
  const latest = {}
  for (const set of performedSets) {
    if (set.fecha >= beforeIso) continue
    const current = latest[set.ejercicioId]
    if (!current || set.fecha > current.fecha) latest[set.ejercicioId] = { fecha: set.fecha, sets: [set] }
    else if (set.fecha === current.fecha) current.sets.push(set)
  }
  for (const session of Object.values(latest)) session.sets.sort((a, b) => a.serieNumero - b.serieNumero)
  return latest
}

/** Historial por ejercicio: sesiones de la más reciente a la más antigua, con su volumen sin calentamientos. */
export function historyByExercise(performedSets) {
  const grouped = {}
  for (const set of performedSets) {
    const byDate = (grouped[set.ejercicioId] ??= {})
    ;(byDate[set.fecha] ??= []).push(set)
  }
  return Object.fromEntries(
    Object.entries(grouped).map(([exerciseId, byDate]) => [
      exerciseId,
      Object.entries(byDate)
        .map(([fecha, sets]) => {
          const sorted = sets.slice().sort((a, b) => a.serieNumero - b.serieNumero)
          return { fecha, volume: workVolume(sorted), sets: sorted }
        })
        .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha)),
    ]),
  )
}

/**
 * Doble progresión (RN-3.01, RN-3.02): si en la última sesión TODAS las series de trabajo llegaron al
 * máximo del rango objetivo, devuelve el peso de la serie más pesada + 2,5 kg. Si no, null.
 * Los calentamientos no cuentan.
 */
export function suggestedWeight(targetReps, latestSession) {
  const workSets = (latestSession?.sets ?? []).filter(isWorkSet)
  if (workSets.length === 0) return null
  const range = parseTargetReps(targetReps)
  if (!range) return null
  if (!workSets.every((set) => set.repeticionesRealizadas >= range.max)) return null
  return Math.max(...workSets.map((set) => set.pesoUtilizado)) + PROGRESSION_STEP_KG
}

/** Objetivos para batir récords en un ejercicio: +2,5 kg sobre el peso máximo y +5 % sobre la mejor serie. */
export function prTargets(prs, exerciseId, fallbackWeight = null) {
  const own = prs.filter((pr) => pr.ejercicioId === exerciseId)
  const best = (tipo) => own.filter((pr) => pr.tipo === tipo).reduce((max, pr) => Math.max(max, pr.valor), 0)
  const maxPeso = best('peso_maximo')
  const maxVolumenSerie = best('volumen_serie')
  return {
    targetPeso: maxPeso > 0 ? Number((maxPeso + PROGRESSION_STEP_KG).toFixed(1)) : fallbackWeight,
    targetVolumenSerie: maxVolumenSerie > 0 ? Number((maxVolumenSerie * 1.05).toFixed(1)) : null,
    repsMismoPeso: own.filter((pr) => pr.tipo === 'reps_mismo_peso').sort((a, b) => b.valor - a.valor)[0],
  }
}

/** Series de una rutina rellenas con lo que se hizo la última vez. Clave: `${rutinaEjercicioId}-${serie}`. */
export function prefillSets(routineExercises, latestSessions) {
  const prefilled = {}
  for (const routineExercise of routineExercises) {
    const previousSets = latestSessions[routineExercise.ejercicioId]?.sets ?? []
    for (let serie = 1; serie <= routineExercise.series; serie += 1) {
      const previous = previousSets.find((set) => set.serieNumero === serie)
      prefilled[`${routineExercise.id}-${serie}`] = {
        reps: previous?.repeticionesRealizadas ?? 0,
        peso: previous?.pesoUtilizado ?? 0,
        rpe: previous?.rpe,
        type: previous?.type ?? 'normal',
      }
    }
  }
  return prefilled
}

/** Valor de una serie: lo escrito hoy, o lo precargado, o vacío. */
export function setValue(setData, prefilled, key) {
  return setData[key] ?? prefilled[key] ?? { reps: 0, peso: 0, type: 'normal' }
}

/** Aplica un cambio de campo a una serie de la rutina y devuelve la serie nueva. */
export function updateRoutineSet(current, prefilled, field, value) {
  const base = { ...prefilled, ...current }
  return {
    reps: field === 'reps' && typeof value === 'number' ? value : (base.reps ?? 0),
    peso: field === 'peso' && typeof value === 'number' ? value : (base.peso ?? 0),
    rpe: field === 'rpe' ? (typeof value === 'number' && value > 0 ? value : undefined) : base.rpe,
    type:
      field === 'type' && typeof value === 'string' ? value : currentSetType(current?.type, prefilled?.type),
    done: field === 'done' ? Boolean(value) : Boolean(current?.done),
  }
}

/** Sube 2,5 kg a cada serie de trabajo con peso de un ejercicio de la rutina (RN-3.02). */
export function applyProgression(setData, prefilled, routineExercise) {
  const updated = { ...setData }
  for (let serie = 1; serie <= routineExercise.series; serie += 1) {
    const key = `${routineExercise.id}-${serie}`
    const set = updateRoutineSet(setData[key], prefilled[key], null, null)
    const raise = set.type !== 'warmup' && set.peso > 0
    updated[key] = { ...set, peso: raise ? set.peso + PROGRESSION_STEP_KG : set.peso }
  }
  return updated
}

/**
 * Series que se guardan al terminar. Solo cuentan las que tienen repeticiones (> 0) y peso no negativo.
 * Con rutina se usan sus series; sin rutina, el borrador del entreno libre.
 */
export function buildPerformedSets({ routineExercises, readRoutineSet, freeDrafts, trainingId, now, newId }) {
  const toPerformed = (ejercicioId, serieNumero, set) => {
    const reps = Number(set?.reps ?? 0)
    const peso = Number(set?.peso ?? 0)
    if (!ejercicioId || reps <= 0 || peso < 0) return null
    return {
      id: newId(),
      entrenamientoId: trainingId,
      ejercicioId,
      serieNumero,
      repeticionesRealizadas: reps,
      pesoUtilizado: peso,
      rpe: set?.rpe > 0 ? set.rpe : undefined,
      type: set?.type ?? 'normal',
      fecha: now,
    }
  }

  const performed =
    routineExercises.length > 0
      ? routineExercises.flatMap((routineExercise) =>
          Array.from({ length: routineExercise.series }, (_, index) =>
            toPerformed(
              routineExercise.ejercicioId,
              index + 1,
              readRoutineSet(routineExercise.id, index + 1),
            ),
          ),
        )
      : freeDrafts.flatMap((draft) =>
          draft.sets.map((set, index) => toPerformed(draft.ejercicioId, index + 1, set)),
        )
  return performed.filter(Boolean)
}

/** Volumen total de una sesión sin calentamientos (RN-3.07). */
export function sessionVolume(performedSets) {
  return workVolume(performedSets)
}

/** Volumen y número de series por ejercicio, de más a menos volumen. */
export function summarizeByExercise(performedSets, nameOf) {
  const stats = {}
  for (const set of performedSets) {
    const current = (stats[set.ejercicioId] ??= { volume: 0, sets: 0 })
    current.sets += 1
    if (isWorkSet(set)) current.volume += calculateSetVolume(set.pesoUtilizado, set.repeticionesRealizadas)
  }
  return Object.entries(stats)
    .map(([exerciseId, { volume, sets }]) => ({ exerciseId, name: nameOf(exerciseId), volume, sets }))
    .sort((a, b) => b.volume - a.volume)
}

/** Grupo muscular simplificado para la imagen de compartir. */
export function shareMuscleGroup(group) {
  const normalized = (group ?? '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim()
  if (['biceps', 'triceps', 'antebrazos', 'brazo', 'brazos'].includes(normalized)) return 'brazos'
  if (['dorsales', 'trapecio', 'espalda'].includes(normalized)) return 'espalda'
  if (['gluteos', 'gluteo', 'femorales', 'cuadriceps', 'pierna', 'piernas'].includes(normalized))
    return 'piernas'
  if (['abdominales', 'abdomen', 'abs', 'core'].includes(normalized)) return 'core'
  if (['pectoral', 'pectorales', 'pecho'].includes(normalized)) return 'pecho'
  if (['deltoides', 'hombro', 'hombros'].includes(normalized)) return 'hombros'
  return normalized || 'otros'
}

/** Reparto del volumen de ESTA sesión por grupo muscular, sin calentamientos. */
export function muscleDistribution(performedSets, groupOf) {
  const volumes = {}
  for (const set of performedSets.filter(isWorkSet)) {
    const group = shareMuscleGroup(groupOf(set.ejercicioId))
    volumes[group] = (volumes[group] ?? 0) + calculateSetVolume(set.pesoUtilizado, set.repeticionesRealizadas)
  }
  return Object.entries(volumes)
    .map(([muscle, volume]) => ({ muscle, volume }))
    .sort((a, b) => b.volume - a.volume)
}
