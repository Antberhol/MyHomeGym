import { db } from '../lib/db'

export const workoutRepository = {
  /** Guarda el entreno con todas sus series en una sola operación (RN-3.05). */
  createCompletedTraining: (training, performed) => db.saveCompletedTraining(training, performed),
}
