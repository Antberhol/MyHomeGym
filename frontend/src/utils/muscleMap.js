import { calculateSetVolume } from './calculations'
import { normalizeExerciseName } from './text'

/** Color del mapa muscular (azul del disco de 20 kg); el nivel decide cuánto se nota. */
export const HEAT_COLOR = '#2F6FDE'
/** Fuerza del color para cada nivel (1-4), de 0 a 100. */
export const HEAT_INTENSITY = [30, 55, 80, 100]

/** Zonas del diagrama corporal, en el orden en que se listan. */
export const BODY_ZONES = [
  'pecho',
  'hombros',
  'biceps',
  'triceps',
  'antebrazo',
  'core',
  'trapecio',
  'espalda-alta',
  'espalda-baja',
  'gluteo',
  'cuadriceps',
  'isquiotibial',
  'gemelo',
  'aductor',
  'abductor',
]

/** Músculo del catálogo (en español, sin tildes) → zona del diagrama. */
const MUSCLE_TO_ZONE = {
  abdominales: 'core',
  core: 'core',
  pecho: 'pecho',
  hombros: 'hombros',
  cuello: 'trapecio',
  biceps: 'biceps',
  triceps: 'triceps',
  antebrazos: 'antebrazo',
  dorsales: 'espalda-alta',
  'espalda media': 'espalda-alta',
  espalda: 'espalda-alta',
  'zona lumbar': 'espalda-baja',
  trapecios: 'trapecio',
  gluteos: 'gluteo',
  cuadriceps: 'cuadriceps',
  piernas: 'cuadriceps',
  isquiotibiales: 'isquiotibial',
  gemelos: 'gemelo',
  aductores: 'aductor',
  abductores: 'abductor',
}

export function zoneOf(muscle) {
  return MUSCLE_TO_ZONE[normalizeExerciseName(muscle)] ?? null
}

/**
 * Volumen por zona: el músculo principal cuenta entero y los secundarios un 35 %.
 * Las series de calentamiento no cuentan.
 */
export function volumeByZone(sets, exerciseById) {
  const result = Object.fromEntries(BODY_ZONES.map((zone) => [zone, 0]))
  for (const set of sets) {
    if (set.type === 'warmup') continue
    const exercise = exerciseById.get(set.ejercicioId)
    if (!exercise) continue
    const volume = calculateSetVolume(set.pesoUtilizado, set.repeticionesRealizadas)
    const primary = exercise.musculosPrimarios?.length
      ? exercise.musculosPrimarios
      : [exercise.grupoMuscularPrimario]
    const primaryZones = new Set(primary.map(zoneOf).filter(Boolean))
    for (const zone of primaryZones) result[zone] += volume
    for (const muscle of exercise.gruposMuscularesSecundarios ?? []) {
      const zone = zoneOf(muscle)
      if (zone && !primaryZones.has(zone)) result[zone] += volume * 0.35
    }
  }
  return result
}

/** Nivel 0-4 relativo al músculo más trabajado, para pintar el mapa. */
export function levelsFromVolumes(volumes) {
  const max = Math.max(0, ...Object.values(volumes))
  return Object.fromEntries(
    Object.entries(volumes).map(([zone, volume]) => [
      zone,
      max > 0 && volume > 0 ? Math.max(1, Math.ceil((volume / max) * 4)) : 0,
    ]),
  )
}

/** Zona de la app → grupos de la figura anatómica. Aductores y abductores no están dibujados. */
export const FIGURE_GROUPS = {
  pecho: ['chest'],
  hombros: ['shoulders'],
  biceps: ['biceps'],
  triceps: ['triceps'],
  antebrazo: ['forearms'],
  core: ['abs', 'obliques'],
  trapecio: ['upper_back'],
  'espalda-alta': ['lats'],
  'espalda-baja': ['lower_back'],
  gluteo: ['glutes'],
  cuadriceps: ['quads'],
  isquiotibial: ['hamstrings'],
  gemelo: ['calves'],
}

const FIGURE_GROUP_ZONE = Object.fromEntries(
  Object.entries(FIGURE_GROUPS).flatMap(([zone, groups]) => groups.map((group) => [group, zone])),
)

/** Zona de la app que corresponde a un grupo de la figura, o null. */
export function zoneOfFigureGroup(group) {
  return FIGURE_GROUP_ZONE[group] ?? null
}

/** Capas de color de la figura a partir del nivel 0-4 de cada zona. Las zonas a 0 no se pintan. */
export function figureHighlights(levelByZone) {
  return Object.entries(FIGURE_GROUPS).flatMap(([zone, groups]) => {
    const level = levelByZone[zone] ?? 0
    if (level <= 0) return []
    return groups.map((group) => ({
      group,
      intensity: HEAT_INTENSITY[level - 1],
      color: HEAT_COLOR,
    }))
  })
}
