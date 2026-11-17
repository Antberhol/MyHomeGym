/**
 * Borra lo guardado en el navegador conservando solo las claves indicadas (RN-6.14).
 * `isValid(key, value)` decide si un valor conservado sigue siendo legible; si no, se descarta.
 */
export function clearStorageExcept(storage, keepKeys, isValid = () => true) {
  const kept = []
  for (const key of keepKeys) {
    const value = storage.getItem(key)
    if (value !== null && isValid(key, value)) kept.push([key, value])
  }
  storage.clear()
  for (const [key, value] of kept) storage.setItem(key, value)
  return kept.map(([key]) => key)
}
