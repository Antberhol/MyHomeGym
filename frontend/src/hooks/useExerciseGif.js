/**
 * Imagen de un ejercicio. Con el catálogo de free-exercise-db cada ejercicio trae ya sus
 * imágenes desde el backend, así que no hay que buscar nada por nombre en ninguna API:
 * se usa directamente la imagen guardada en el propio ejercicio.
 */
export const EXERCISE_GIF_PLACEHOLDER = ''

export function useExerciseGif(_exerciseName, options = {}) {
  const gifUrl = options.gifUrl?.trim() || options.fallbackGifUrl?.trim() || ''
  return {
    gifUrl,
    targetMuscle: options.grupoMuscularPrimario ?? '',
    instructions: [],
    isLoading: false,
  }
}
