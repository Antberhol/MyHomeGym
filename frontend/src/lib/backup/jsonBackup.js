import { z } from 'zod'
import i18n from '../../i18n'
import { db } from '../db'
import { downloadFile, today } from './download'

/**
 * Copia completa en JSON. Restaurar AÑADE lo que falta y no borra nada: los registros cuyo id
 * ya existe se saltan. El perfil es la excepción: se sustituye por el de la copia. La fusión la
 * hace el servidor (POST /api/data/merge), de forma atómica.
 */

/** Un registro de la copia: cualquier objeto con id. El servidor valida el resto, campo a campo. */
const recordSchema = z.object({ id: z.string().min(1) }).passthrough()
const recordList = z.array(recordSchema).default([])

/**
 * Forma general de una copia de MyHomeGym. Aquí solo se comprueba que el fichero lo es; cada
 * registro lo valida el servidor al fusionar, con las mismas reglas que al guardarlo desde la app.
 * Así una copia exportada por la app siempre se puede restaurar.
 */
export const jsonImportSchema = z.object({
  version: z.union([z.string().min(1), z.number()]),
  exportedAt: z.string().optional(),
  userProfile: recordList,
  ejerciciosCatalogo: recordList,
  rutinas: recordList,
  rutinaCarpetas: recordList,
  rutinaEjercicios: recordList,
  entrenamientosRegistrados: recordList,
  ejerciciosRealizados: recordList,
  medidasCorporalesHistorico: recordList,
  prs: recordList,
  notasEjercicios: recordList,
})

/** Claves de la copia con los datos del usuario, además del perfil y los ejercicios propios. */
const SECTION_KEYS = [
  'rutinaCarpetas',
  'rutinas',
  'rutinaEjercicios',
  'entrenamientosRegistrados',
  'ejerciciosRealizados',
  'medidasCorporalesHistorico',
  'prs',
  'notasEjercicios',
]

export async function exportAllDataJson() {
  const snapshot = await db.exportAllData()
  const exportData = {
    version: '1.1',
    exportedAt: new Date().toISOString(),
    userProfile: snapshot.userProfile,
    ejerciciosCatalogo: snapshot.ejerciciosCatalogo,
  }
  for (const key of SECTION_KEYS) exportData[key] = snapshot[key] ?? []

  downloadFile(
    JSON.stringify(exportData, null, 2),
    'application/json;charset=utf-8;',
    `myhomegym-backup-${today()}.json`,
  )
}

/** Lee y valida el fichero. Si no es una copia de MyHomeGym, lanza un error legible (RN-6.02). */
export async function readBackupFile(file) {
  let raw
  try {
    raw = JSON.parse(await file.text())
  } catch {
    throw new Error(i18n.t('errors.invalidBackupFile'))
  }
  const parsed = jsonImportSchema.safeParse(raw)
  if (!parsed.success) throw new Error(i18n.t('errors.invalidBackupFile'))
  return parsed.data
}

/**
 * Restaura una copia. El servidor añade lo que falta en una sola transacción (o todo o nada) y
 * devuelve cuántos registros ha añadido y cuántos ya existían: {imported, skipped} (RN-6.03).
 */
export async function importAllDataJson(file) {
  return db.mergeBackup(await readBackupFile(file))
}
