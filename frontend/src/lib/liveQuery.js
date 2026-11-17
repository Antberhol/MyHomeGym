import { useEffect, useRef, useState } from 'react'
import { onDataChanged } from './api'

/**
 * Sustituto de useLiveQuery de Dexie para datos que viven en el backend.
 * Ejecuta la consulta al montar, cuando cambian las dependencias y cada vez que la app
 * escribe en el servidor. Devuelve `defaultValue` (o undefined) hasta tener el primer resultado.
 */
export function useLiveQuery(querier, deps = [], defaultValue) {
  const [value, setValue] = useState(defaultValue)
  const [version, setVersion] = useState(0)
  const querierRef = useRef(querier)

  useEffect(() => {
    querierRef.current = querier
  })

  useEffect(() => onDataChanged(() => setVersion((current) => current + 1)), [])

  useEffect(() => {
    let cancelled = false
    Promise.resolve()
      .then(() => querierRef.current())
      .then((result) => {
        if (!cancelled) setValue(result)
      })
      .catch((error) => {
        if (!cancelled) console.error('[useLiveQuery]', error)
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version])

  return value
}

/** Lista vacía compartida como valor inicial estable (no se debe mutar). */
export const EMPTY_LIST = []
