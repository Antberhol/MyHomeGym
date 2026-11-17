import { db } from '../lib/db'

export const routineAdminRepository = {
  async listRoutines() {
    return db.getAllRoutines()
  },

  async listExercises() {
    return db.getAllExercisesCatalog()
  },

  async listRoutineExercises() {
    return db.getAllRoutineExercises()
  },

  async createRoutine(routine) {
    const now = new Date().toISOString()
    const id = await db.addRoutine({
      ...routine,
      updatedAt: routine.updatedAt ?? now,
    })

    return id
  },

  async updateRoutine(routineId, changes) {
    const now = new Date().toISOString()
    const updated = await db.updateRoutine(routineId, {
      ...changes,
      updatedAt: changes.updatedAt ?? now,
    })

    return updated
  },

  async deleteRoutine(routineId) {
    await db.deleteRoutineAndLinkedExercises(routineId)
  },

  async createRoutineExercises(items) {
    const now = new Date().toISOString()
    const normalized = items.map((item) => ({
      ...item,
      updatedAt: item.updatedAt ?? now,
    }))

    const result = await db.bulkAddRoutineExercises(normalized)
    return result
  },

  async addExerciseToRoutine(item) {
    const now = new Date().toISOString()
    const normalized = {
      ...item,
      updatedAt: item.updatedAt ?? now,
    }

    const result = await db.bulkAddRoutineExercises([normalized])
    return result
  },

  async deleteRoutineExercise(routineExerciseId) {
    await db.deleteRoutineExercise(routineExerciseId)
  },

  async swapRoutineExerciseOrder(currentId, currentOrder, targetId, targetOrder) {
    await db.swapRoutineExerciseOrders(currentId, currentOrder, targetId, targetOrder)
  },

  async reorderRoutineExercises(items) {
    await db.reorderRoutineExercises(items)
  },

  async updateRoutineExercise(routineExerciseId, changes) {
    const now = new Date().toISOString()
    const updated = await db.updateRoutineExercise(routineExerciseId, {
      ...changes,
      updatedAt: changes.updatedAt ?? now,
    })

    return updated
  },
}
