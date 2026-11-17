import { db } from '../lib/db'

export const progressRepository = {
  async listBodyMeasurements() {
    return db.getAllBodyMeasurements()
  },

  async listTrainings() {
    return db.getAllTrainings()
  },

  async listTrainingsRecent(days) {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - Math.max(0, days))
    return db.getTrainingsSince(cutoff.toISOString())
  },

  async countTrainings() {
    return db.getTrainingsCount()
  },

  async sumTrainingVolumeAllTime() {
    return db.getTrainingsTotalVolume()
  },

  async listTrainingsUntil(maxDateIso) {
    return db.getTrainingsBeforeOrEqual(maxDateIso)
  },

  async listPerformedExercises() {
    return db.getAllPerformedExercises()
  },

  async listPerformedExercisesSince(sinceIso) {
    return db.getPerformedExercisesSince(sinceIso)
  },

  async listExercises() {
    return db.getAllExercisesCatalog()
  },

  async listRoutines() {
    return db.getAllRoutines()
  },

  async listRoutineExercises() {
    return db.getAllRoutineExercises()
  },

  async listPersonalRecords() {
    return db.getAllPersonalRecords()
  },

  async listRecentWorkouts(limit = 5) {
    const trainings = (await db.getAllTrainings())
      .filter((training) => training.completado)
      .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
      .slice(0, Math.max(1, limit))

    if (trainings.length === 0) return []

    const performed = await db.getAllPerformedExercises()

    return trainings.map((training) => ({
      training,
      exercises: performed.filter((item) => item.entrenamientoId === training.id),
    }))
  },

  async getExerciseHistory(exerciseId, from, to) {
    return db.getPerformedExercisesByExerciseAndDateRange(exerciseId, from, to)
  },

  async getExercisePrs(exerciseId) {
    return db.getPersonalRecordsByExercise(exerciseId)
  },

  async getAggregatedStats() {
    const trainings = (await db.getAllTrainings()).filter((training) => training.completado)
    const performed = await db.getAllPerformedExercises()

    const totalWorkouts = trainings.length

    const now = new Date()
    const last30 = new Date(now)
    last30.setDate(now.getDate() - 30)

    const recentTrainings = trainings.filter((training) => new Date(training.fecha) >= last30)
    const avgDurationMinutes =
      recentTrainings.length === 0
        ? 0
        : Math.round(
            recentTrainings.reduce((sum, item) => sum + item.duracionMinutos, 0) / recentTrainings.length,
          )

    const startOfWeek = new Date(now)
    startOfWeek.setHours(0, 0, 0, 0)
    const day = (startOfWeek.getDay() + 6) % 7
    startOfWeek.setDate(startOfWeek.getDate() - day)

    const totalSetsThisWeek = performed.filter((item) => new Date(item.fecha) >= startOfWeek).length

    const dateKeys = trainings
      .map((item) => item.fecha)
      .map((value) => {
        const date = new Date(value)
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const dayKey = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${dayKey}`
      })
      .sort()

    let bestStreak = 0
    let currentStreak = 0
    let previousDate = null

    for (const key of dateKeys) {
      const [year, month, dayValue] = key.split('-').map(Number)
      const date = new Date(year, month - 1, dayValue)

      if (!previousDate) {
        currentStreak = 1
        bestStreak = Math.max(bestStreak, currentStreak)
        previousDate = date
        continue
      }

      const diffDays = Math.round((date.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24))
      if (diffDays === 0) {
        continue
      }

      if (diffDays === 1) {
        currentStreak += 1
      } else {
        currentStreak = 1
      }

      bestStreak = Math.max(bestStreak, currentStreak)
      previousDate = date
    }

    return {
      totalWorkouts,
      avgDurationMinutes,
      totalSetsThisWeek,
      bestStreak,
    }
  },
}
