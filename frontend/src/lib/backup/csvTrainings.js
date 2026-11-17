import { db } from '../db'
import { downloadFile, today } from './download'

/** Entrenos en CSV (RN-6.04). Columnas, en este orden: */
export const CSV_COLUMNS = [
  'id',
  'rutinaId',
  'fecha',
  'duracionMinutos',
  'volumenTotal',
  'completado',
  'notas',
]

// Marca de orden de bytes: sin ella, Excel abre los acentos del UTF-8 como símbolos raros.
const BOM = '\uFEFF'

const quote = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`

/** Texto CSV de una lista de entrenos, con cabecera. Todos los campos van entre comillas. */
export function trainingsToCsv(trainings) {
  const rows = [
    CSV_COLUMNS,
    ...trainings.map((training) => CSV_COLUMNS.map((column) => training[column] ?? '')),
  ]
  return rows.map((row) => row.map(quote).join(',')).join('\r\n')
}

/**
 * Lee un CSV completo en filas de campos. Entiende comillas dobladas ("") y campos entre comillas
 * con comas o saltos de línea dentro (por ejemplo, notas de varias líneas).
 */
export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let insideQuotes = false
  const endField = () => {
    row.push(field)
    field = ''
  }
  const endRow = () => {
    endField()
    if (row.some((value) => value.trim() !== '')) rows.push(row)
    row = []
  }

  const content = text.replace(/^\uFEFF/, '')
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    if (insideQuotes) {
      if (char === '"' && content[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (char === '"') insideQuotes = false
      else field += char
    } else if (char === '"') insideQuotes = true
    else if (char === ',') endField()
    else if (char === '\n') endRow()
    else if (char !== '\r') field += char
  }
  endRow()
  return rows
}

/** Entrenos válidos de un CSV: se descartan la cabecera y las filas sin id o con una fecha que no lo es. */
export function csvToTrainings(text) {
  return parseCsv(text)
    .slice(1)
    .map(([id, rutinaId, fecha, duracionMinutos, volumenTotal, completado, notas]) => ({
      id: id?.trim(),
      rutinaId: rutinaId?.trim() || undefined,
      fecha: fecha?.trim(),
      duracionMinutos: Math.max(0, Number(duracionMinutos) || 0),
      volumenTotal: Math.max(0, Number(volumenTotal) || 0),
      completado: String(completado).trim().toLowerCase() === 'true',
      notas: notas || undefined,
    }))
    .filter((training) => training.id && training.fecha && !Number.isNaN(Date.parse(training.fecha)))
}

export async function exportTrainingsCsv() {
  const csv = trainingsToCsv(await db.getAllTrainings())
  downloadFile(BOM + csv, 'text/csv;charset=utf-8;', `myhomegym-trainings-${today()}.csv`)
}

/** Añade los entrenos del CSV que aún no existen. Devuelve cuántos ha añadido. */
export async function importTrainingsCsv(file) {
  const parsed = csvToTrainings(await file.text())
  const existingIds = new Set((await db.getAllTrainings()).map((item) => item.id))
  // Un mismo id repetido dentro del fichero solo cuenta una vez.
  const newRows = [
    ...new Map(parsed.filter((item) => !existingIds.has(item.id)).map((item) => [item.id, item])).values(),
  ]
  if (newRows.length > 0) await db.bulkAddTrainings(newRows)
  return newRows.length
}
