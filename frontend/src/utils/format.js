/** Formatos de fecha y cifras en el idioma de la interfaz. Nunca segundos ni formato americano. */

const DAY_MS = 24 * 60 * 60 * 1000

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
}

export function daysAgo(iso, now = new Date()) {
  return Math.round((startOfDay(now) - startOfDay(new Date(iso))) / DAY_MS)
}

/** "Hoy", "Ayer", "Hace 3 días" o "12 nov". */
export function formatRelativeDay(iso, t, lang) {
  const diff = daysAgo(iso)
  if (diff <= 0) return t('format.today')
  if (diff === 1) return t('format.yesterday')
  if (diff < 7) return t('format.daysAgo', { count: diff })
  return formatShortDate(iso, lang)
}

export function formatShortDate(iso, lang) {
  return new Date(iso).toLocaleDateString(lang, { day: 'numeric', month: 'short' })
}

export function formatLongDate(iso, lang) {
  return new Date(iso).toLocaleDateString(lang, { weekday: 'long', day: 'numeric', month: 'long' })
}

export function formatNumber(value, lang, maxDecimals = 1) {
  return Number(value ?? 0).toLocaleString(lang, { maximumFractionDigits: maxDecimals })
}

/** 2908 -> "2.908"; 12500 -> "12,5 t" para que las cifras grandes quepan. */
export function formatVolume(kg, lang) {
  if (kg >= 10000) return { value: formatNumber(kg / 1000, lang, 1), unit: 't' }
  return { value: formatNumber(kg, lang, 0), unit: 'kg' }
}

export function capitalize(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text
}
