import { db } from '../lib/db'

export const routineRepository = {
  async listRoutines() {
    return db.getAllRoutines()
  },

  async listRoutineExercises() {
    return db.getAllRoutineExercises()
  },

  async listExercises() {
    return db.getAllExercisesCatalog()
  },

  async listPerformedExercises() {
    return db.getAllPerformedExercises()
  },

  async listPersonalRecords() {
    return db.getAllPersonalRecords()
  },
}
