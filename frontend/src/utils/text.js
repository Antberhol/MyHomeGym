/** Normaliza un texto para comparar: minúsculas, sin tildes y sin espacios repetidos. */
export function normalizeExerciseName(value) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
