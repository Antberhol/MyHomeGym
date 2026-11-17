import i18n from '../../src/i18n'
import { apiErrorMessage } from '../../src/lib/errorMessages'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { api, ApiError, onDataChanged, onSessionExpired, setAccessToken } from '../../src/lib/api'

function jsonResponse(status, body) {
  return new Response(body === undefined ? null : JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('cliente de la API', () => {
  beforeEach(() => {
    setAccessToken('token-viejo')
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('envía el JWT en la cabecera Authorization y la cookie con credentials', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(jsonResponse(200, [{ id: 'r1' }]))
    const data = await api.getFresh('/routines')
    expect(data).toEqual([{ id: 'r1' }])
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/routines')
    expect(options.headers.Authorization).toBe('Bearer token-viejo')
    expect(options.credentials).toBe('include')
  })

  it('renueva la sesión ante un 401 y repite la petición con el token nuevo', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(401, { error: 'caducado' }))
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: 'token-nuevo', user: { id: 1 } }))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }))

    await expect(api.getFresh('/auth/me')).resolves.toEqual({ ok: true })
    expect(fetchMock.mock.calls[1][0]).toBe('/api/auth/refresh')
    expect(fetchMock.mock.calls[2][1].headers.Authorization).toBe('Bearer token-nuevo')
  })

  it('avisa de sesión caducada si no se puede renovar', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(401, { error: 'caducado' }))
      .mockResolvedValueOnce(jsonResponse(401, { error: 'refresco inválido' }))
    const expired = vi.fn()
    const unsubscribe = onSessionExpired(expired)
    await expect(api.getFresh('/routines')).rejects.toBeInstanceOf(ApiError)
    expect(expired).toHaveBeenCalledTimes(1)
    unsubscribe()
  })

  it('cachea las lecturas y las invalida tras una escritura', async () => {
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse(200, []))
      .mockResolvedValueOnce(jsonResponse(200, { id: 'r1' }))
      .mockResolvedValueOnce(jsonResponse(200, [{ id: 'r1' }]))
    const changed = vi.fn()
    const unsubscribe = onDataChanged(changed)

    await api.get('/routines')
    await api.get('/routines')
    expect(fetchMock).toHaveBeenCalledTimes(1)

    await api.put('/routines/r1', { id: 'r1' })
    expect(changed).toHaveBeenCalled()
    await expect(api.get('/routines')).resolves.toEqual([{ id: 'r1' }])
    expect(fetchMock).toHaveBeenCalledTimes(3)
    unsubscribe()
  })

  it('traduce los errores del servidor a mensajes legibles, en el idioma de la app', async () => {
    const taken = () => jsonResponse(409, { error: 'texto interno', code: 'USERNAME_TAKEN' })
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => taken())
    await expect(api.post('/auth/register', {})).rejects.toThrow('Ese nombre de usuario ya existe.')

    await i18n.changeLanguage('en')
    await expect(api.post('/auth/register', {})).rejects.toThrow('That username is already taken.')
    await i18n.changeLanguage('es')
  })

  it('nunca enseña el texto técnico del servidor', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () =>
      jsonResponse(400, { error: 'upsert.body.nombre: must not be blank', code: 'VALIDATION' }),
    )
    const error = await api.put('/routines/r1', {}).catch((e) => e)
    expect(error.message).toBe('Hay datos que no son válidos. Revísalos y vuelve a intentarlo.')
    expect(error.code).toBe('VALIDATION')
    expect(error.status).toBe(400)
  })

  it('sin código, elige el mensaje por el tipo de fallo', () => {
    expect(apiErrorMessage(503)).toMatch(/servidor no responde/)
    expect(apiErrorMessage(404)).toMatch(/ya no existe/)
    expect(apiErrorMessage(418, 'RARO')).toBe('Algo ha fallado. Vuelve a intentarlo.')
  })

  it('explica cuando el backend no está arrancado', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'))
    await expect(api.getFresh('/routines')).rejects.toThrow(/backend/)
  })
})
