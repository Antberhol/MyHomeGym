import { describe, expect, it } from 'vitest'
import i18n from '../../src/i18n'
import { CSV_COLUMNS, csvToTrainings, parseCsv, trainingsToCsv } from '../../src/lib/backup/csvTrainings'
import { buildSummary } from '../../src/lib/backup/pdfSummary'
import { formatWorkoutToCSV, formatWorkoutToText } from '../../src/utils/clipboard'

const t = (lang) => i18n.getFixedT(lang)

describe('CSV de entrenos (RN-6.04)', () => {
  const trainings = [
    {
      id: 't1',
      rutinaId: 'r1',
      fecha: '2026-11-16T10:00:00.000Z',
      duracionMinutos: 42,
      volumenTotal: 5320.5,
      completado: true,
      notas: 'Buen día, "pesado"\nSegunda línea',
    },
    { id: 't2', fecha: '2026-11-15T10:00:00.000Z', duracionMinutos: 30, volumenTotal: 0, completado: true },
  ]

  it('tiene las columnas documentadas y vuelve a leerse igual, con comas, comillas y saltos de línea', () => {
    const csv = trainingsToCsv(trainings)
    expect(parseCsv(csv)[0]).toEqual(CSV_COLUMNS)
    expect(csvToTrainings(csv)).toEqual([
      { ...trainings[0] },
      { ...trainings[1], rutinaId: undefined, notas: undefined },
    ])
  })

  it('lee ficheros con marca de orden de bytes y finales de línea de Windows', () => {
    const rows = csvToTrainings('﻿id,rutinaId,fecha,duracionMinutos\r\nt9,,2026-11-01T08:00:00Z,25\r\n')
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({ id: 't9', duracionMinutos: 25, volumenTotal: 0, completado: false })
  })

  it('descarta filas sin id, sin fecha o con una fecha que no lo es', () => {
    expect(csvToTrainings('id,rutinaId,fecha\n,,2026-11-01\nt1,,\nt2,,ayer\nt3,,2026-11-01')).toHaveLength(1)
  })
})

describe('resumen en PDF', () => {
  const data = {
    profile: { nombre: '', pesoCorporal: 78, altura: 178, imc: null },
    trainings: [{ fecha: '2026-11-16T10:00:00Z', duracionMinutos: 90, volumenTotal: null }],
    prs: [
      { ejercicioId: 'GLOBAL', tipo: 'volumen_total', valor: 5000, fecha: '2026-11-16T10:00:00Z' },
      { ejercicioId: 'squat', tipo: 'peso_maximo', valor: 100, fecha: '2026-11-16T10:00:00Z' },
      {
        ejercicioId: 'gone',
        tipo: 'reps_mismo_peso',
        valor: 12,
        detalle: 'a 60kg',
        fecha: '2026-11-15T10:00:00Z',
      },
    ],
    measurements: [{ fechaRegistro: '2026-11-10T10:00:00Z', pesoCorporal: 78 }],
    exercises: [{ id: 'squat', nombre: 'Sentadilla' }],
    routines: [{ activa: true }, {}, { activa: false }],
  }
  const rowsOf = (sections, title) => sections.find((section) => section.title === title).rows

  it('no se cae con datos que faltan y cuenta como activas las rutinas que no están en pausa', () => {
    const sections = buildSummary(data, t('es'), 'es')
    expect(rowsOf(sections, 'Perfil')).toContainEqual(['IMC', '-'])
    expect(rowsOf(sections, 'Perfil')).toContainEqual(['Nombre', 'Sin nombre'])
    expect(rowsOf(sections, 'Estadísticas generales')).toContainEqual(['Rutinas activas', '2'])
    expect(rowsOf(sections, 'Estadísticas generales')).toContainEqual(['Récords personales', '2'])
    expect(rowsOf(sections, 'Historial de medidas')[0].slice(2)).toEqual(['-', '-', '-'])
  })

  it('traduce los tipos de récord y marca los ejercicios borrados', () => {
    const records = rowsOf(buildSummary(data, t('es'), 'es'), 'Récords personales')
    expect(records[0].slice(0, 3)).toEqual(['Sentadilla', 'Peso máximo', '100 kg'])
    expect(records[1].slice(0, 3)).toEqual(['Ejercicio borrado', 'Repeticiones', '12 reps con 60 kg'])
    const english = rowsOf(buildSummary(data, t('en'), 'en'), 'Personal records')
    expect(english[1][2]).toBe('12 reps at 60 kg')
  })

  it('sale en inglés si la app está en inglés', () => {
    const titles = buildSummary(data, t('en'), 'en').map((section) => section.title)
    expect(titles).toEqual([
      'Profile',
      'Overall stats',
      'Latest workouts',
      'Personal records',
      'Measurement history',
    ])
  })
})

describe('copiar una sesión', () => {
  const session = {
    date: '2026-11-16T10:00:00.000Z',
    routineName: '',
    durationMinutes: 42,
    totalVolumeKg: 1234.56,
    exercises: [
      {
        name: 'Press, banca',
        sets: [
          { weight: 80, reps: 5 },
          { weight: 82.5, reps: 3 },
        ],
      },
    ],
  }

  it('como texto, en el idioma de la app', () => {
    expect(formatWorkoutToText(session, t('es'), 'es')).toContain('Duración: 42 min')
    expect(formatWorkoutToText(session, t('es'), 'es')).toContain('- Press, banca: 80x5, 82.5x3')
    expect(formatWorkoutToText(session, t('en'), 'en')).toContain('💪 Workout')
    expect(formatWorkoutToText(session, t('en'), 'en')).toContain('Total volume: 1235 kg')
  })

  it('como CSV, con una fila por serie y los nombres con coma entre comillas', () => {
    const lines = formatWorkoutToCSV(session, t('es')).split('\n')
    expect(lines).toHaveLength(3)
    expect(lines[1]).toContain('Entrenamiento,"Press, banca",1,80,5,42,1234.56')
  })
})
