/** Texto legible sobre un color de fondo: tinta oscura sobre colores claros, tiza sobre oscuros. */
export function readableTextOn(hex) {
  const value = (hex ?? '').replace('#', '')
  if (value.length !== 6) return '#141518'
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255)
  const lin = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  const luminance = 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
  return luminance > 0.35 ? '#141518' : '#F4F1EA'
}
