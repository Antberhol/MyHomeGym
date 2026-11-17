/**
 * Cliente HTTP del backend Spring Boot.
 *
 * - El token de acceso (JWT, 15 min) vive solo en memoria: nunca en localStorage.
 * - El token de refresco va en una cookie HttpOnly que gestiona el navegador.
 * - Ante un 401 se intenta renovar la sesión una vez y se repite la petición.
 * - Las lecturas GET se cachean hasta la siguiente escritura; cada escritura avisa a
 *   los suscriptores (useLiveQuery) para que las pantallas se refresquen solas.
 */

import { apiErrorMessage } from './errorMessages'

const API_BASE = (import.meta.env.VITE_API_URL ?? '/api').replace(/\/$/, '')

export class ApiError extends Error {
  /** `code` es el código estable del servidor (por ejemplo USERNAME_TAKEN), si lo envía. */
  constructor(status, message, code) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

let accessToken = null
let refreshPromise = null
const getCache = new Map()
const changeListeners = new Set()
const sessionListeners = new Set()

export function setAccessToken(token) {
  accessToken = token
}

export function hasAccessToken() {
  return Boolean(accessToken)
}

/** Se llama cada vez que cambian datos en el servidor. Devuelve la función para darse de baja. */
export function onDataChanged(listener) {
  changeListeners.add(listener)
  return () => changeListeners.delete(listener)
}

/** Se llama cuando la sesión caduca y no se puede renovar. */
export function onSessionExpired(listener) {
  sessionListeners.add(listener)
  return () => sessionListeners.delete(listener)
}

export function invalidateCache() {
  getCache.clear()
  changeListeners.forEach((listener) => listener())
}

/** Convierte una respuesta de error en un ApiError con el mensaje en el idioma del usuario. */
async function toApiError(response) {
  let code
  try {
    code = (await response.json())?.code
  } catch {
    // respuesta sin JSON
  }
  return new ApiError(response.status, apiErrorMessage(response.status, code), code)
}

async function rawFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = {}
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`
  try {
    return await fetch(`${API_BASE}${path}`, {
      method,
      headers,
      credentials: 'include',
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, apiErrorMessage(0))
  }
}

/** Renueva el token de acceso con la cookie de refresco. Devuelve la respuesta de auth o null. */
export async function refreshSession() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await rawFetch('/auth/refresh', { method: 'POST', auth: false })
      if (!response.ok) {
        accessToken = null
        return null
      }
      const data = await response.json()
      accessToken = data.accessToken
      return data
    })().finally(() => {
      refreshPromise = null
    })
  }
  return refreshPromise
}

export async function apiRequest(path, { method = 'GET', body, auth = true, retry = true } = {}) {
  let response = await rawFetch(path, { method, body, auth })

  if (response.status === 401 && auth && retry) {
    const refreshed = await refreshSession().catch(() => null)
    if (refreshed) {
      response = await rawFetch(path, { method, body, auth })
    } else {
      sessionListeners.forEach((listener) => listener())
    }
  }

  if (!response.ok) {
    throw await toApiError(response)
  }
  if (response.status === 204) return undefined
  const text = await response.text()
  return text ? JSON.parse(text) : undefined
}

function cachedGet(path) {
  if (!getCache.has(path)) {
    const promise = apiRequest(path).catch((error) => {
      getCache.delete(path)
      throw error
    })
    getCache.set(path, promise)
  }
  return getCache.get(path)
}

async function mutate(path, method, body) {
  try {
    return await apiRequest(path, { method, body })
  } finally {
    invalidateCache()
  }
}

export const api = {
  get: (path) => cachedGet(path),
  getFresh: (path) => apiRequest(path),
  post: (path, body) => mutate(path, 'POST', body),
  put: (path, body) => mutate(path, 'PUT', body),
  patch: (path, body) => mutate(path, 'PATCH', body),
  delete: (path) => mutate(path, 'DELETE'),
}
