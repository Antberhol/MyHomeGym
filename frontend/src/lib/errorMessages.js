import i18n from '../i18n'

/** Códigos de error que envía el servidor y que tienen un mensaje propio en `errors.*`. */
const KNOWN_CODES = [
  'USERNAME_TAKEN',
  'TOO_MANY_ATTEMPTS',
  'BAD_CREDENTIALS',
  'SESSION_EXPIRED',
  'VALIDATION',
  'BAD_JSON',
  'NOT_FOUND',
  'DUPLICATE_ID',
]

const BY_STATUS = {
  400: 'VALIDATION',
  401: 'SESSION_EXPIRED',
  404: 'NOT_FOUND',
  409: 'DUPLICATE_ID',
  429: 'TOO_MANY_ATTEMPTS',
}

/**
 * Mensaje para el usuario, en su idioma, a partir del estado HTTP y del código del servidor.
 * Nunca se muestra el texto técnico de la respuesta ni el código HTTP (RNF-3.08).
 */
export function apiErrorMessage(status, code) {
  if (status === 0) return i18n.t('errors.cannotConnect')
  if (status >= 500) return i18n.t('errors.serverDown')
  const key = KNOWN_CODES.includes(code) ? code : BY_STATUS[status]
  return i18n.t(`errors.${key ?? 'generic'}`)
}
