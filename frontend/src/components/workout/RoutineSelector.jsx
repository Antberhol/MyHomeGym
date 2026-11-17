import { ListPlus, Play, Zap } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { EMPTY_LIST, useLiveQuery } from '../../lib/liveQuery'
import { routineRepository } from '../../repositories/routineRepository'
import { routineRunsOn } from '../../utils/weekdays'
import { Button, EmptyState, Section } from '../design-system'
import { WeekdayStrip } from './WeekdayStrip'

function RoutineCard({ routine, exerciseCount, today, onStart }) {
  const { t } = useTranslation()
  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-gym-card ${today ? 'border-gym-text-dim' : 'border-gym-border'}`}
    >
      <div className="flex">
        <span
          className="w-1.5 shrink-0"
          style={{ backgroundColor: routine.color || '#55575B' }}
          aria-hidden="true"
        />
        <div className="min-w-0 flex-1 p-4">
          {today && (
            <p className="mb-1 text-sm font-semibold text-gym-text-dim">{t('workout.todayRoutine')}</p>
          )}
          <h3 className="font-display text-2xl leading-tight text-gym-text-bright">{routine.nombre}</h3>
          <p className="mt-1 text-sm text-gym-text-muted">
            {t('workout.exerciseCount', { count: exerciseCount })}
            {routine.descripcion ? `. ${routine.descripcion}` : ''}
          </p>
          <div className="mt-3 flex items-center justify-between gap-3">
            <WeekdayStrip days={routine.diasSemana} color={routine.color} />
            <Button
              variant={today ? 'primary' : 'secondary'}
              onClick={() => onStart(routine.id)}
              disabled={exerciseCount === 0}
              className={today ? 'px-5' : ''}
            >
              <Play size={16} fill="currentColor" /> {t('workout.start')}
            </Button>
          </div>
        </div>
      </div>
    </article>
  )
}

/** Pantalla de inicio del entreno: la rutina de hoy primero, luego el resto y el entreno libre. */
export function RoutineSelector({ routines, onStartRoutine, onStartFree }) {
  const { t } = useTranslation()
  const routineExercises = useLiveQuery(() => routineRepository.listRoutineExercises(), [], EMPTY_LIST)
  const countFor = (id) => routineExercises.filter((item) => item.rutinaId === id).length
  const active = routines.filter((routine) => routine.activa !== false)
  const todays = active.filter((routine) => routineRunsOn(routine))
  const others = active.filter((routine) => !routineRunsOn(routine))

  return (
    <div className="space-y-6">
      {todays.map((routine) => (
        <RoutineCard
          key={routine.id}
          routine={routine}
          exerciseCount={countFor(routine.id)}
          today
          onStart={onStartRoutine}
        />
      ))}

      <button
        type="button"
        onClick={onStartFree}
        className="flex w-full items-center gap-4 rounded-2xl border border-gym-border bg-gym-card p-4 text-left transition-colors hover:bg-gym-card-2"
      >
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gym-card-2 text-gym-text-bright">
          <Zap size={22} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-2xl leading-tight text-gym-text-bright">
            {t('training.selector.freeTitle')}
          </span>
          <span className="block text-sm text-gym-text-muted">{t('workout.freeDescription')}</span>
        </span>
        <Play size={20} className="shrink-0 text-gym-text-dim" />
      </button>

      {others.length > 0 && (
        <Section title={todays.length ? t('workout.otherRoutines') : t('workout.yourRoutines')}>
          <div className="space-y-3">
            {others.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                exerciseCount={countFor(routine.id)}
                onStart={onStartRoutine}
              />
            ))}
          </div>
        </Section>
      )}

      {active.length === 0 && (
        <EmptyState
          icon={ListPlus}
          title={t('workout.noRoutinesTitle')}
          text={t('workout.noRoutinesText')}
          action={
            <Link
              to="/rutinas"
              className="inline-flex h-11 items-center rounded-xl border border-gym-border-2 px-4 font-semibold text-gym-text-bright hover:bg-gym-card-2"
            >
              {t('workout.goToRoutines')}
            </Link>
          }
        />
      )}
    </div>
  )
}
