import { beforeEach, describe, expect, it, vi } from 'vitest'

// Base de datos en memoria con la misma interfaz que src/lib/db.js.
const tables = {}
const table = (name) => (tables[name] ??= [])
const listOf = (name) => vi.fn(async () => [...table(name)])
const addTo = (name) => vi.fn(async (items) => table(name).push(...items))

const mergeBackup = vi.fn(async () => ({ imported: 3, skipped: 1 }))

vi.mock('../../src/lib/db', async (original) => ({
  clearedFields: (await original()).clearedFields,
  db: {
    mergeBackup,
    clearUserProfiles: vi.fn(async () => (tables.profiles = [])),
    bulkAddUserProfiles: addTo('profiles'),
    getAllExercisesCatalog: listOf('exercises'),
    bulkAddExercises: addTo('exercises'),
    getAllRoutineFolders: listOf('folders'),
    bulkAddRoutineFolders: addTo('folders'),
    getAllRoutines: listOf('routines'),
    bulkAddRoutines: addTo('routines'),
    getAllRoutineExercises: listOf('routineExercises'),
    bulkAddRoutineExercises: addTo('routineExercises'),
    getAllTrainings: listOf('trainings'),
    bulkAddTrainings: addTo('trainings'),
    getAllPerformedExercises: listOf('sets'),
    bulkAddPerformedExercises: addTo('sets'),
    getAllBodyMeasurements: listOf('measurements'),
    bulkAddBodyMeasurements: addTo('measurements'),
    getAllPersonalRecords: listOf('records'),
    bulkAddPersonalRecords: addTo('records'),
    getAllExerciseNotes: listOf('notes'),
    bulkAddExerciseNotes: addTo('notes'),
    getExerciseNote: vi.fn(async (exerciseId) => table('notes').find((n) => n.ejercicioId === exerciseId)),
    saveExerciseNote: vi.fn(async (note) => {
      tables.notes = [...table('notes').filter((n) => n.id !== note.id), note]
    }),
  },
}))

const { importAllDataJson } = await import('../../src/lib/backup/jsonBackup')
const { clearedFields } = await import('../../src/lib/db')
const { exerciseRepository } = await import('../../src/repositories/exerciseRepository')

const backupFile = (data) => ({
  text: async () => JSON.stringify({ version: '1.1', exportedAt: '2026-11-13T10:00:00Z', ...data }),
})

beforeEach(() => {
  for (const key of Object.keys(tables)) delete tables[key]
  window.localStorage.clear()
  mergeBackup.mockClear()
})

describe('restaurar una copia', () => {
  it('valida el fichero y encarga la fusión al servidor, que es quien no borra nada', async () => {
    const result = await importAllDataJson(
      backupFile({
        rutinas: [{ id: 'r2', nombre: 'Nueva', color: '#2F6FDE' }],
        rutinaCarpetas: [{ id: 'f1', nombre: 'Fuerza' }],
        notasEjercicios: [{ id: 'n1', ejercicioId: 'Barbell_Squat', texto: 'Rodillas fuera' }],
      }),
    )

    expect(result).toEqual({ imported: 3, skipped: 1 })
    const sent = mergeBackup.mock.calls[0][0]
    expect(sent.rutinas[0]).toMatchObject({ id: 'r2', nombre: 'Nueva' })
    expect(sent.rutinaCarpetas).toHaveLength(1)
    expect(sent.notasEjercicios[0].texto).toBe('Rodillas fuera')
  })

  it('rechaza un fichero que no es una copia de MyHomeGym, sin enviar nada', async () => {
    await expect(importAllDataJson({ text: async () => '{"hola":1}' })).rejects.toThrow(/no es una copia/)
    await expect(importAllDataJson({ text: async () => 'esto no es JSON' })).rejects.toThrow(
      /no es una copia/,
    )
    expect(mergeBackup).not.toHaveBeenCalled()
  })

  it('acepta una copia con rutinas sin color o sin fecha de exportación: lo que exporta la app se restaura', async () => {
    const file = {
      text: async () => JSON.stringify({ version: '1.1', rutinas: [{ id: 'r1', nombre: 'Sin color' }] }),
    }
    await expect(importAllDataJson(file)).resolves.toEqual({ imported: 3, skipped: 1 })
  })

  it('rechaza registros sin id', async () => {
    const file = { text: async () => JSON.stringify({ version: '1.1', rutinas: [{ nombre: 'Sin id' }] }) }
    await expect(importAllDataJson(file)).rejects.toThrow(/no es una copia/)
  })
})

describe('vaciar campos al guardar cambios', () => {
  it('un campo sin valor se envía como null para que el servidor lo vacíe', () => {
    expect(clearedFields({ folderId: undefined, nombre: 'Empuje', orden: 0 })).toEqual({
      folderId: null,
      nombre: 'Empuje',
      orden: 0,
    })
  })
})

describe('notas de ejercicio', () => {
  it('se guardan en el servidor y se actualiza la misma nota', async () => {
    await exerciseRepository.saveNote('Barbell_Squat', 'Primera')
    await exerciseRepository.saveNote('Barbell_Squat', 'Segunda')
    expect(table('notes')).toHaveLength(1)
    expect(await exerciseRepository.getNote('Barbell_Squat')).toBe('Segunda')
  })

  it('suben las notas antiguas del navegador al servidor y las quitan de allí', async () => {
    window.localStorage.setItem('exercise_notes_Pull-up', 'Agarre ancho')
    window.localStorage.setItem('exercise_notes_Vacia', '   ')

    expect(await exerciseRepository.getNote('Pull-up')).toBe('Agarre ancho')
    expect(table('notes')).toHaveLength(1)
    expect(window.localStorage.getItem('exercise_notes_Pull-up')).toBeNull()
    expect(window.localStorage.getItem('exercise_notes_Vacia')).toBeNull()
  })

  it('no pisa una nota del servidor con una antigua del navegador', async () => {
    tables.notes = [{ id: 'n1', ejercicioId: 'Pull-up', texto: 'La del servidor' }]
    window.localStorage.setItem('exercise_notes_Pull-up', 'La antigua')
    expect(await exerciseRepository.getNote('Pull-up')).toBe('La del servidor')
  })
})
