import { useMemo } from 'react'
import { EMPTY_LIST, useLiveQuery } from '../lib/liveQuery'
import { routineAdminRepository } from '../repositories/routineAdminRepository'
import { routineFolderRepository } from '../repositories/routineFolderRepository'

const now = () => new Date().toISOString()

/** Datos y acciones de rutinas, carpetas y ejercicios de rutina, para la lista y el detalle. */
export function useRoutineData() {
  const routines = useLiveQuery(() => routineAdminRepository.listRoutines(), [], EMPTY_LIST)
  const exercises = useLiveQuery(() => routineAdminRepository.listExercises(), [], EMPTY_LIST)
  const routineExercises = useLiveQuery(() => routineAdminRepository.listRoutineExercises(), [], EMPTY_LIST)
  const folders = useLiveQuery(() => routineFolderRepository.listFolders(), [], EMPTY_LIST)

  const sortedFolders = useMemo(() => folders.slice().sort((a, b) => a.orden - b.orden), [folders])
  const exerciseById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise])),
    [exercises],
  )

  const itemsOf = (routineId) =>
    routineExercises
      .filter((item) => item.rutinaId === routineId)
      .sort((a, b) => a.orden - b.orden)
      .map((item) => ({ ...item, ejercicio: exerciseById.get(item.ejercicioId) }))

  const actions = {
    async createRoutine(values) {
      const id = crypto.randomUUID()
      await routineAdminRepository.createRoutine({
        id,
        activa: true,
        ...values,
        createdAt: now(),
        updatedAt: now(),
      })
      return id
    },
    updateRoutine: (id, values) => routineAdminRepository.updateRoutine(id, { ...values, updatedAt: now() }),
    deleteRoutine: (id) => routineAdminRepository.deleteRoutine(id),

    async createFromTemplate(template, t) {
      const id = await actions.createRoutine({
        nombre: t(template.nameKey),
        descripcion: t(template.descriptionKey),
        diasSemana: template.diasSemana,
        color: template.color,
      })
      const known = template.exercises.filter((item) => exerciseById.has(item.ejercicioId))
      await routineAdminRepository.createRoutineExercises(
        known.map((item, index) => ({ id: crypto.randomUUID(), rutinaId: id, orden: index + 1, ...item })),
      )
      return id
    },

    async addExercises(routineId, exerciseIds) {
      const current = itemsOf(routineId)
      const existing = new Set(current.map((item) => item.ejercicioId))
      const base = current.reduce((max, item) => Math.max(max, item.orden), 0) + 1
      const toAdd = exerciseIds.filter((id) => !existing.has(id))
      if (!toAdd.length) return
      await routineAdminRepository.createRoutineExercises(
        toAdd.map((ejercicioId, index) => ({
          id: crypto.randomUUID(),
          rutinaId: routineId,
          ejercicioId,
          orden: base + index,
          series: 3,
          repeticiones: '8-12',
          descansoSegundos: 90,
        })),
      )
    },
    updateRoutineExercise: (id, values) => routineAdminRepository.updateRoutineExercise(id, values),
    removeRoutineExercise: (id) => routineAdminRepository.deleteRoutineExercise(id),
    reorder: (orderedIds) =>
      routineAdminRepository.reorderRoutineExercises(
        orderedIds.map((id, index) => ({ id, orden: index + 1 })),
      ),

    createFolder: (values) =>
      routineFolderRepository.createFolder({
        id: crypto.randomUUID(),
        ...values,
        orden: folders.length + 1,
        createdAt: now(),
        updatedAt: now(),
      }),
    updateFolder: (id, values) => routineFolderRepository.updateFolder(id, { ...values, updatedAt: now() }),
    // El servidor deja sin carpeta las rutinas que tenía, en la misma operación (RN-2.06).
    deleteFolder: (id) => routineFolderRepository.deleteFolder(id),
  }

  return { routines, exercises, routineExercises, folders: sortedFolders, itemsOf, actions }
}
