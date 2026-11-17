import { db } from '../lib/db'

// Antes las notas vivían solo en el navegador con esta clave. Se suben al servidor la primera vez.
const LEGACY_NOTE_PREFIX = 'exercise_notes_'

function readLegacyNotes() {
  try {
    return Object.keys(window.localStorage)
      .filter((key) => key.startsWith(LEGACY_NOTE_PREFIX))
      .map((key) => ({
        key,
        ejercicioId: key.slice(LEGACY_NOTE_PREFIX.length),
        texto: window.localStorage.getItem(key),
      }))
  } catch {
    return []
  }
}

/** Sube al servidor las notas antiguas del navegador que no estén ya allí, y las borra del navegador. */
async function migrateLegacyNotes() {
  const legacy = readLegacyNotes()
  if (legacy.length === 0) return
  const existing = new Set((await db.getAllExerciseNotes()).map((note) => note.ejercicioId))
  const now = new Date().toISOString()
  const toUpload = legacy
    .filter((note) => note.texto?.trim() && !existing.has(note.ejercicioId))
    .map((note) => ({
      id: crypto.randomUUID(),
      ejercicioId: note.ejercicioId,
      texto: note.texto,
      updatedAt: now,
    }))
  await db.bulkAddExerciseNotes(toUpload)
  for (const note of legacy) window.localStorage.removeItem(note.key)
}

export const exerciseRepository = {
  async listExercises() {
    return db.getAllExercisesCatalog()
  },

  async getUsageFrequencyMap() {
    const performed = await db.getAllPerformedExercises()
    return performed.reduce((acc, item) => {
      acc.set(item.ejercicioId, (acc.get(item.ejercicioId) ?? 0) + 1)
      return acc
    }, new Map())
  },

  async getExerciseById(exerciseId) {
    return db.getExerciseById(exerciseId)
  },

  async createExercise(exercise) {
    const now = new Date().toISOString()
    const id = await db.addExercise({
      ...exercise,
      updatedAt: exercise.updatedAt ?? now,
    })

    return id
  },

  async updateExercise(exerciseId, changes) {
    const now = new Date().toISOString()
    const updated = await db.updateExercise(exerciseId, {
      ...changes,
      updatedAt: changes.updatedAt ?? now,
    })

    return updated
  },

  async deleteExercise(exerciseId) {
    await db.deleteExercise(exerciseId)
  },

  /** Texto de la nota personal del ejercicio, o '' si no tiene. */
  async getNote(exerciseId) {
    await migrateLegacyNotes()
    return (await db.getExerciseNote(exerciseId))?.texto ?? ''
  },

  /** Guarda la nota del ejercicio: actualiza la existente o crea una nueva. */
  async saveNote(exerciseId, texto) {
    const current = await db.getExerciseNote(exerciseId)
    await db.saveExerciseNote({
      id: current?.id ?? crypto.randomUUID(),
      ejercicioId: exerciseId,
      texto,
      updatedAt: new Date().toISOString(),
    })
  },
}
