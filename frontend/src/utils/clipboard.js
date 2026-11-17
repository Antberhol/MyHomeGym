/** Una sesión como texto (para pegar en un chat) o como CSV, en el idioma que se le pasa. */

function escapeCsv(value) {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export function formatWorkoutToText(training, t, lang) {
  const title = training.routineName || t('sessionText.defaultTitle')
  const day = new Date(training.date).toLocaleDateString(lang, { day: '2-digit', month: '2-digit' })
  const lines = training.exercises.map(
    (exercise) => `- ${exercise.name}: ${exercise.sets.map((set) => `${set.weight}x${set.reps}`).join(', ')}`,
  )
  return [
    `💪 ${title} - ${day}`,
    ...lines,
    '',
    `⏱️ ${t('sessionText.duration', { minutes: training.durationMinutes })}`,
    `🏋️ ${t('sessionText.volume', { kg: training.totalVolumeKg.toFixed(0) })}`,
  ].join('\n')
}

export function formatWorkoutToCSV(training, t) {
  const date = new Date(training.date).toISOString()
  const routine = training.routineName || t('sessionText.defaultTitle')
  const rows = training.exercises.flatMap((exercise) =>
    exercise.sets.map((set, index) =>
      [
        date,
        escapeCsv(routine),
        escapeCsv(exercise.name),
        String(index + 1),
        String(set.weight),
        String(set.reps),
        String(training.durationMinutes),
        String(Number(training.totalVolumeKg.toFixed(2))),
      ].join(','),
    ),
  )
  return [t('sessionText.csvHeader'), ...rows].join('\n')
}
