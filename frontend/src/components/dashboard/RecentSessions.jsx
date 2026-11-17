import { CalendarPlus, Trophy } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatRelativeDay } from '../../utils/format'
import { EmptyState, ListGroup, ListRow, Section } from '../design-system'
import { SessionSheet } from '../workout/SessionSheet'

/** Últimas sesiones; al tocar una se abre su detalle editable. */
export function RecentSessions({ bundles, routines, exercises, prs }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [openId, setOpenId] = useState(null)
  const nameById = useMemo(
    () => new Map(exercises.map((exercise) => [exercise.id, exercise.nombre])),
    [exercises],
  )
  const routineName = (id) => routines.find((routine) => routine.id === id)?.nombre

  const prsByDate = useMemo(() => {
    const map = new Map()
    for (const pr of prs) {
      if (pr.ejercicioId === 'GLOBAL') continue
      map.set(pr.fecha, new Set([...(map.get(pr.fecha) ?? []), pr.ejercicioId]))
    }
    return map
  }, [prs])

  const open = bundles.find((bundle) => bundle.training.id === openId) ?? null

  return (
    <Section title={t('home.recent')}>
      {bundles.length === 0 ? (
        <EmptyState icon={CalendarPlus} title={t('home.recentEmptyTitle')} text={t('home.recentEmptyText')} />
      ) : (
        <ListGroup>
          {bundles.map(({ training, exercises: sets }) => {
            const names = Array.from(
              new Set(sets.map((set) => nameById.get(set.ejercicioId)).filter(Boolean)),
            )
            const records = prsByDate.get(training.fecha)?.size ?? 0
            return (
              <ListRow
                key={training.id}
                onClick={() => setOpenId(training.id)}
                title={
                  routineName(training.rutinaId) || names.slice(0, 2).join(', ') || t('training.freeTraining')
                }
                subtitle={[
                  formatRelativeDay(training.fecha, t, lang),
                  t('session.minutes', { count: training.duracionMinutos }),
                  t('workout.exerciseCount', { count: names.length }),
                ].join(', ')}
                trailing={
                  <span className="text-right">
                    <span className="tabular block font-display text-xl font-extrabold leading-none text-gym-text-bright">
                      {formatNumber(training.volumenTotal, lang, 0)}
                      <span className="ml-0.5 font-body text-xs font-semibold text-gym-text-muted">kg</span>
                    </span>
                    {records > 0 && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-plate-yellow">
                        <Trophy size={12} /> {t('home.recordsShort', { count: records })}
                      </span>
                    )}
                  </span>
                }
              />
            )
          })}
        </ListGroup>
      )}
      {open && (
        <SessionSheet
          session={open}
          routineName={routineName(open.training.rutinaId)}
          nameById={nameById}
          onClose={() => setOpenId(null)}
        />
      )}
    </Section>
  )
}
