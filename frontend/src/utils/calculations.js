export function calculateImc(pesoKg, alturaCm) {
  const alturaM = alturaCm / 100
  if (alturaM <= 0) return 0
  return Number((pesoKg / (alturaM * alturaM)).toFixed(2))
}

export function classifyImc(imc) {
  if (imc < 18.5) return { label: 'Bajo peso', color: 'text-sky-500' }
  if (imc < 25) return { label: 'Normal', color: 'text-green-500' }
  if (imc < 30) return { label: 'Sobrepeso', color: 'text-amber-500' }
  return { label: 'Obesidad', color: 'text-orange-500' }
}

export function calculateSetVolume(peso, reps) {
  return Number((peso * reps).toFixed(2))
}

export function calculate1RM(weight, reps) {
  if (weight <= 0 || reps <= 0) return 0
  if (reps === 1) return Number(weight.toFixed(2))
  return Number((weight * (1 + reps / 30)).toFixed(2))
}

export function estimateOneRmEpley(peso, reps) {
  return calculate1RM(peso, reps)
}

export function calculateWorkoutVolume(series, reps, peso) {
  return Number((Math.max(0, series) * Math.max(0, reps) * Math.max(0, peso)).toFixed(2))
}

export function estimateCaloriesBurned(weightKg, minutes, met = 6) {
  const hours = Math.max(0, minutes) / 60
  const calories = Math.max(0, met) * Math.max(0, weightKg) * hours
  return Number(calories.toFixed(2))
}
