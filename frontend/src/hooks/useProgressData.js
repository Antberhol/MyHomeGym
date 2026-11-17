import { useMemo } from 'react'
import { EMPTY_LIST, useLiveQuery } from '../lib/liveQuery'
import { progressRepository } from '../repositories/progressRepository'
import { estimateOneRmEpley } from '../utils/calculations'
import { volumeByZone } from '../utils/muscleMap'

const DAY = 86400000

function mondayOf(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

/** Todo lo que necesita la pantalla de progreso, calculado una vez. */
export function useProgressData(now) {
  const measurements = useLiveQuery(() => progressRepository.listBodyMeasurements(), [], EMPTY_LIST)
  const trainings = useLiveQuery(() => progressRepository.listTrainings(), [], EMPTY_LIST)
  const sets = useLiveQuery(() => progressRepository.listPerformedExercises(), [], EMPTY_LIST)
  const exercises = useLiveQuery(() => progressRepository.listExercises(), [], EMPTY_LIST)
  const prs = useLiveQuery(() => progressRepository.listPersonalRecords(), [], EMPTY_LIST)

  const exerciseById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  )

  /** Volumen por semana (lunes a domingo) de las últimas 12 semanas. */
  const weeklyVolume = useMemo(() => {
    const thisMonday = mondayOf(now)
    const weeks = Array.from({ length: 12 }, (_, index) => {
      const start = new Date(thisMonday.getTime() - (11 - index) * 7 * DAY)
      return { start, volume: 0, sessions: 0, isCurrent: index === 11 }
    })
    for (const training of trainings) {
      const time = +new Date(training.fecha)
      const week = weeks.find((item) => time >= +item.start && time < +item.start + 7 * DAY)
      if (week) {
        week.volume += training.volumenTotal ?? 0
        week.sessions += 1
      }
    }
    return weeks
  }, [now, trainings])

  const last30 = useMemo(() => sets.filter((set) => +new Date(set.fecha) >= +now - 30 * DAY), [now, sets])
  const zoneVolumes = useMemo(() => volumeByZone(last30, exerciseById), [exerciseById, last30])

  /** Ejercicios que has hecho, del más reciente al más antiguo. */
  const trainedExercises = useMemo(() => {
    const last = new Map()
    for (const set of sets) {
      if (!last.has(set.ejercicioId) || set.fecha > last.get(set.ejercicioId))
        last.set(set.ejercicioId, set.fecha)
    }
    return Array.from(last.entries())
      .sort((a, b) => (a[1] < b[1] ? 1 : -1))
      .map(([id]) => exerciseById.get(id))
      .filter(Boolean)
  }, [exerciseById, sets])

  const oneRmSeriesFor = (exerciseId) => {
    const byDay = new Map()
    for (const set of sets) {
      if (set.ejercicioId !== exerciseId || set.type === 'warmup') continue
      const day = set.fecha.slice(0, 10)
      const oneRm = estimateOneRmEpley(set.pesoUtilizado, set.repeticionesRealizadas)
      const current = byDay.get(day)
      if (!current || oneRm > current.oneRm)
        byDay.set(day, {
          date: set.fecha,
          oneRm,
          weight: set.pesoUtilizado,
          reps: set.repeticionesRealizadas,
        })
    }
    return Array.from(byDay.values()).sort((a, b) => (a.date < b.date ? -1 : 1))
  }

  const sortedMeasurements = useMemo(
    () => measurements.slice().sort((a, b) => +new Date(a.fechaRegistro) - +new Date(b.fechaRegistro)),
    [measurements],
  )

  return {
    trainings,
    sets,
    exercises,
    exerciseById,
    prs,
    weeklyVolume,
    zoneVolumes,
    trainedExercises,
    oneRmSeriesFor,
    measurements: sortedMeasurements,
  }
}
