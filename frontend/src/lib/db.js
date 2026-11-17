import i18n from '../i18n'
import { ApiError, api, invalidateCache } from './api'

/**
 * Acceso a datos de la app. Mantiene la misma interfaz que tenía la antigua base de datos
 * local (Dexie) para que repositorios y pantallas no cambien, pero ahora cada operación es una
 * llamada a la API REST del backend Spring Boot, que guarda los datos en su base H2 local.
 */

const enc = encodeURIComponent

/**
 * En un cambio parcial, un campo con `undefined` significa "vaciar este campo". JSON descarta los
 * `undefined`, así que se envían como `null` para que el servidor los vacíe de verdad.
 */
export function clearedFields(changes) {
  return Object.fromEntries(
    Object.entries(changes).map(([key, value]) => [key, value === undefined ? null : value]),
  )
}

function resource(path) {
  return {
    list: () => api.get(`/${path}`),
    async get(id) {
      try {
        return await api.get(`/${path}/${enc(id)}`)
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return undefined
        throw error
      }
    },
    async put(item) {
      await api.put(`/${path}/${enc(item.id)}`, item)
      return item.id
    },
    async patch(id, changes) {
      try {
        await api.patch(`/${path}/${enc(id)}`, clearedFields(changes))
        return 1
      } catch (error) {
        if (error instanceof ApiError && error.status === 404) return 0
        throw error
      }
    },
    remove: (id) => api.delete(`/${path}/${enc(id)}`),
    bulk: (items) => (items.length > 0 ? api.post(`/${path}/bulk`, items) : Promise.resolve([])),
    clear: () => api.delete(`/${path}`),
  }
}

const profiles = resource('profiles')
const customExercises = resource('custom-exercises')
const routines = resource('routines')
const folders = resource('routine-folders')
const routineExercises = resource('routine-exercises')
const trainings = resource('trainings')
const performedSets = resource('performed-sets')
const measurements = resource('body-measurements')
const records = resource('personal-records')
const exerciseNotes = resource('exercise-notes')

function catalogLang() {
  return i18n.language === 'en' ? 'en' : 'es'
}

i18n.on('languageChanged', () => invalidateCache())

async function catalogList() {
  return api.get(`/catalog/exercises?lang=${catalogLang()}`)
}

async function allExercises() {
  const [catalog, custom] = await Promise.all([catalogList(), customExercises.list()])
  return [...catalog, ...custom.map((exercise) => ({ ...exercise, esPersonalizado: true }))]
}

const byFecha = (from, to) => (item) => (!from || item.fecha >= from) && (!to || item.fecha <= to)

export const db = {
  // Rutinas
  getAllRoutines: () => routines.list(),
  getRoutineById: (id) => routines.get(id),
  addRoutine: (routine) => routines.put(routine),
  updateRoutine: (id, changes) => routines.patch(id, changes),
  deleteRoutine: (id) => routines.remove(id),
  bulkAddRoutines: (items) => routines.bulk(items),
  clearRoutines: () => routines.clear(),
  deleteRoutineAndLinkedExercises: (id) => routines.remove(id),

  // Carpetas de rutinas
  getAllRoutineFolders: () => folders.list(),
  addRoutineFolder: (folder) => folders.put(folder),
  updateRoutineFolder: (id, changes) => folders.patch(id, changes),
  deleteRoutineFolder: (id) => folders.remove(id),
  bulkAddRoutineFolders: (items) => folders.bulk(items),

  // Ejercicios de rutina
  getAllRoutineExercises: () => routineExercises.list(),
  getRoutineExerciseById: (id) => routineExercises.get(id),
  async getRoutineExercisesByRoutineId(routineId) {
    return (await routineExercises.list()).filter((item) => item.rutinaId === routineId)
  },
  bulkAddRoutineExercises: (items) => routineExercises.bulk(items),
  updateRoutineExercise: (id, changes) => routineExercises.patch(id, changes),
  deleteRoutineExercise: (id) => routineExercises.remove(id),
  clearRoutineExercises: () => routineExercises.clear(),
  swapRoutineExerciseOrders: (currentId, currentOrder, targetId, targetOrder) =>
    api.post('/routine-exercises/reorder', [
      { id: currentId, orden: targetOrder },
      { id: targetId, orden: currentOrder },
    ]),
  reorderRoutineExercises: (items) => api.post('/routine-exercises/reorder', items),

  // Ejercicios: catálogo del servidor (solo lectura) + ejercicios propios del usuario
  getAllExercisesCatalog: () => allExercises(),
  async getExerciseById(id) {
    const custom = (await customExercises.list()).find((item) => item.id === id)
    if (custom) return { ...custom, esPersonalizado: true }
    const inCatalog = (await catalogList()).some((item) => item.id === id)
    if (!inCatalog) return undefined
    return api.get(`/catalog/exercises/${enc(id)}?lang=${catalogLang()}`)
  },
  async getExercisesCount() {
    return (await allExercises()).length
  },
  addExercise: (exercise) => customExercises.put({ ...exercise, esPersonalizado: true }),
  async updateExercise(id, changes) {
    const custom = (await customExercises.list()).some((item) => item.id === id)
    return custom ? customExercises.patch(id, changes) : 0
  },
  deleteExercise: (id) => customExercises.remove(id),
  bulkAddExercises: (items) =>
    customExercises.bulk(
      items.filter((item) => item.esPersonalizado).map((item) => ({ ...item, esPersonalizado: true })),
    ),
  clearExercises: () => customExercises.clear(),

  // Series realizadas
  getAllPerformedExercises: () => performedSets.list(),
  updatePerformedExercise: (id, changes) => performedSets.patch(id, changes),
  async getPerformedExercisesSince(sinceIso) {
    return (await performedSets.list()).filter(byFecha(sinceIso))
  },
  async getPerformedExercisesByExerciseAndDateRange(exerciseId, from, to) {
    return (await performedSets.list())
      .filter((item) => item.ejercicioId === exerciseId)
      .filter(byFecha(from, to))
  },
  bulkAddPerformedExercises: (items) => performedSets.bulk(items),
  clearPerformedExercises: () => performedSets.clear(),

  // Entrenamientos
  getAllTrainings: () => trainings.list(),
  async getTrainingsSince(sinceIso) {
    return (await trainings.list()).filter(byFecha(sinceIso))
  },
  async getTrainingsCount() {
    return (await trainings.list()).length
  },
  async getTrainingsTotalVolume() {
    return (await trainings.list()).reduce((acc, training) => acc + (training.volumenTotal ?? 0), 0)
  },
  updateTraining: (id, changes) => trainings.patch(id, changes),
  async getTrainingsBeforeOrEqual(maxDateIso) {
    return (await trainings.list()).filter(byFecha(undefined, maxDateIso))
  },
  bulkAddTrainings: (items) => trainings.bulk(items),
  clearTrainings: () => trainings.clear(),
  async saveCompletedTraining(training, performed) {
    await api.post('/trainings/complete', { training, sets: performed })
  },
  /** Corrige una sesión pasada: series, volumen y récords en una sola transacción (RN-4.15). */
  correctTraining: (id, correction) => api.post(`/trainings/${enc(id)}/correction`, correction),

  // Perfil
  async getFirstUserProfile() {
    return (await profiles.list())[0]
  },
  getAllUserProfiles: () => profiles.list(),
  putUserProfile: (profile) => profiles.put(profile),
  clearUserProfiles: () => profiles.clear(),
  bulkAddUserProfiles: (items) => profiles.bulk(items),

  // Medidas corporales
  addBodyMeasurement: (measurement) => measurements.put(measurement),
  getAllBodyMeasurements: () => measurements.list(),
  getBodyMeasurementById: (id) => measurements.get(id),
  deleteBodyMeasurement: (id) => measurements.remove(id),
  clearBodyMeasurements: () => measurements.clear(),
  bulkAddBodyMeasurements: (items) => measurements.bulk(items),

  // Récords personales
  getAllPersonalRecords: () => records.list(),
  getPersonalRecordById: (id) => records.get(id),
  async getPersonalRecordsByExercise(exerciseId) {
    return (await records.list()).filter((item) => item.ejercicioId === exerciseId)
  },
  addPersonalRecord: (record) => records.put(record),
  clearPersonalRecords: () => records.clear(),
  bulkAddPersonalRecords: (items) => records.bulk(items),

  // Notas personales por ejercicio (una por ejercicio)
  getAllExerciseNotes: () => exerciseNotes.list(),
  async getExerciseNote(exerciseId) {
    return (await exerciseNotes.list()).find((item) => item.ejercicioId === exerciseId)
  },
  saveExerciseNote: (note) => exerciseNotes.put(note),
  bulkAddExerciseNotes: (items) => exerciseNotes.bulk(items),

  // Ajustes de notificaciones
  async getNotificationSettings() {
    return (await api.get('/settings/notifications')) ?? undefined
  },
  saveNotificationSettings: (settings) => api.put('/settings/notifications', settings),

  // Datos completos
  clearAllData: () => api.delete('/data'),
  replaceAllData: (payload) => api.post('/data/import', payload),
  /** Añade a la cuenta lo que falta de una copia. Devuelve {imported, skipped}. */
  mergeBackup: (data) => api.post('/data/merge', data),
  async exportAllData() {
    const data = await api.getFresh('/data/export')
    return {
      ...data,
      ejerciciosCatalogo: (data.ejerciciosCatalogo ?? []).map((item) => ({ ...item, esPersonalizado: true })),
    }
  },
}
