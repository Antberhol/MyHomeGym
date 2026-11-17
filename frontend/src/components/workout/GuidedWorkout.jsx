import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../../utils/format'
import { Button } from '../design-system'
import { ExerciseMotion } from '../exercises/ExerciseMotion'
import { ExerciseBlock } from './ExerciseBlock'

function toNumber(value) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

/** Entreno por rutina: tira de ejercicios arriba y uno a la vez, con sus series. */
export function GuidedWorkout({
  routineExercises,
  activeIndex,
  onSelectIndex,
  previousSessionByExercise,
  suggestedWeight,
  getSetValue,
  updateSetData,
  onApplySuggestedWeight,
  onStartRest,
  exerciseNotes,
  onUpdateExerciseNote,
}) {
  const { t, i18n } = useTranslation()
  const current = routineExercises[activeIndex]
  if (!current) return null

  const rowsFor = (item) =>
    Array.from({ length: item.series }, (_, index) => {
      const value = getSetValue(item.id, index + 1)
      const previous = previousSessionByExercise[item.ejercicioId]?.sets.find(
        (set) => set.serieNumero === index + 1,
      )
      return {
        key: `${item.id}-${index + 1}`,
        ...value,
        previous: previous ? { peso: previous.pesoUtilizado, reps: previous.repeticionesRealizadas } : null,
      }
    })

  const rows = rowsFor(current)
  const next = routineExercises[activeIndex + 1]

  const handleChange = (index, field, value) => {
    const parsed = field === 'type' ? value : toNumber(value)
    updateSetData(current.id, index + 1, field, parsed)
  }

  const handleToggle = (index) => {
    const row = rows[index]
    updateSetData(current.id, index + 1, 'done', !row.done)
    if (!row.done) onStartRest(current.descansoSegundos || 90)
  }

  const suggestion =
    suggestedWeight !== null && suggestedWeight > 0
      ? {
          text: t('workout.suggestion', { weight: formatNumber(suggestedWeight, i18n.language) }),
          action: t('workout.useSuggestion'),
          onApply: onApplySuggestedWeight,
        }
      : null

  return (
    <div className="space-y-4">
      <nav
        aria-label={t('workout.exerciseList')}
        className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 [&::-webkit-scrollbar]:hidden"
      >
        {routineExercises.map((item, index) => {
          const itemRows = rowsFor(item)
          const done = itemRows.filter((row) => row.done).length
          const complete = done === itemRows.length && done > 0
          const isActive = index === activeIndex
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectIndex(index)}
              aria-current={isActive ? 'step' : undefined}
              className={`flex max-w-[11rem] shrink-0 flex-col items-start rounded-xl border px-3 py-2 text-left transition-colors ${
                isActive
                  ? 'border-gym-text-bright bg-gym-card'
                  : 'border-gym-border text-gym-text-muted hover:bg-gym-card'
              }`}
            >
              <span
                className={`w-full truncate text-sm font-semibold ${isActive ? 'text-gym-text-bright' : ''}`}
              >
                {item.ejercicio?.nombre ?? t('training.exercise')}
              </span>
              <span
                className="mt-1 flex gap-1"
                aria-label={t('workout.setsDone', { done, total: itemRows.length })}
              >
                {itemRows.map((row) => (
                  <span
                    key={row.key}
                    className={`h-1.5 w-4 rounded-full ${row.done ? 'bg-plate-green' : 'bg-gym-border-2'}`}
                  />
                ))}
                {complete && <span className="sr-only">{t('workout.exerciseComplete')}</span>}
              </span>
            </button>
          )
        })}
      </nav>

      <ExerciseBlock
        exercise={current.ejercicio}
        target={t('workout.target', {
          series: current.series,
          reps: current.repeticiones,
          rest: current.descansoSegundos,
        })}
        suggestion={suggestion}
        rows={rows}
        note={exerciseNotes[current.ejercicioId]}
        onNoteChange={(note) => onUpdateExerciseNote(current.ejercicioId, note)}
        onChangeSet={handleChange}
        onToggleDone={handleToggle}
        media={
          current.ejercicio?.imagenes?.length ? (
            <div className="p-2 pb-0">
              <ExerciseMotion
                images={current.ejercicio.imagenes}
                alt={current.ejercicio.nombre}
                className="max-h-48"
              />
            </div>
          ) : null
        }
      />

      <div className="flex gap-2">
        <Button
          variant="secondary"
          size="icon"
          className="h-12 w-12"
          disabled={activeIndex === 0}
          onClick={() => onSelectIndex(activeIndex - 1)}
          aria-label={t('training.exerciseCard.previous')}
        >
          <ChevronLeft size={22} />
        </Button>
        <Button
          variant="secondary"
          className="h-12 flex-1 justify-between"
          disabled={!next}
          onClick={() => onSelectIndex(activeIndex + 1)}
        >
          <span className="truncate">
            {next
              ? t('workout.nextExercise', { name: next.ejercicio?.nombre ?? '' })
              : t('workout.lastExercise')}
          </span>
          {next && <ChevronRight size={20} className="shrink-0" />}
        </Button>
      </div>
    </div>
  )
}
