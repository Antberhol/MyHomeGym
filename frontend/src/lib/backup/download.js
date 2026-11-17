/** Fecha de hoy en formato AAAA-MM-DD, para el nombre de los ficheros descargados. */
export function today() {
  return new Date().toISOString().slice(0, 10)
}

/** Descarga un texto como fichero. */
export function downloadFile(content, type, filename) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
