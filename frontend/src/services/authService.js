import { apiRequest, invalidateCache, refreshSession, setAccessToken } from '../lib/api'

/** Operaciones de cuenta contra /api/auth del backend. */
export const authService = {
  async register({ username, password, displayName }) {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: { username, password, displayName },
      auth: false,
    })
    setAccessToken(data.accessToken)
    invalidateCache()
    return data.user
  },

  async login({ username, password }) {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: { username, password },
      auth: false,
    })
    setAccessToken(data.accessToken)
    invalidateCache()
    return data.user
  },

  /** Recupera la sesión al abrir la app usando la cookie de refresco. Devuelve el usuario o null. */
  async restoreSession() {
    const data = await refreshSession()
    return data?.user ?? null
  },

  async logout() {
    try {
      await apiRequest('/auth/logout', { method: 'POST', auth: false })
    } finally {
      setAccessToken(null)
      invalidateCache()
    }
  },
}
