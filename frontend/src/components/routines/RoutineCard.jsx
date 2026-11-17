import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { WeekdayStrip } from '../workout/WeekdayStrip'

/** Rutina en la lista: color, nombre, ejercicios y días. Toca para ver y editar. */
export function RoutineCard({ routine, exerciseCount }) {
  const { t } = useTranslation()
  const inactive = routine.activa === false
  return (
    <Link
      to={`/rutinas/${routine.id}`}
      className={`flex overflow-hidden rounded-2xl border border-gym-border bg-gym-card transition-colors hover:bg-gym-card-2 ${inactive ? 'opacity-60' : ''}`}
    >
      <span
        className="w-1.5 shrink-0"
        style={{ backgroundColor: routine.color || '#55575B' }}
        aria-hidden="true"
      />
      <span className="flex min-w-0 flex-1 items-center gap-3 p-4">
        <span className="min-w-0 flex-1">
          <span className="block truncate font-display text-2xl leading-tight text-gym-text-bright">
            {routine.nombre}
          </span>
          <span className="mt-0.5 block text-sm text-gym-text-muted">
            {t('workout.exerciseCount', { count: exerciseCount })}
            {inactive ? `. ${t('routineForm.paused')}` : ''}
          </span>
          <span className="mt-2.5 block">
            <WeekdayStrip days={routine.diasSemana} color={routine.color} />
          </span>
        </span>
        <ChevronRight size={20} className="shrink-0 text-gym-text-muted" aria-hidden="true" />
      </span>
    </Link>
  )
}
