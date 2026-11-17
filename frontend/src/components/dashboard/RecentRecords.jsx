import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatNumber, formatRelativeDay } from '../../utils/format'
import { ListGroup, ListRow, Section } from '../design-system'

/** El peso máximo de cada ejercicio, empezando por los récords más recientes. */
export function RecentRecords({ prs, exercises, limit = 4 }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const best = new Map()
  for (const pr of prs) {
    if (pr.tipo !== 'peso_maximo') continue
    const current = best.get(pr.ejercicioId)
    if (!current || pr.valor > current.valor) best.set(pr.ejercicioId, pr)
  }
  const items = Array.from(best.values())
    .sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
    .slice(0, limit)
  if (items.length === 0) return null
  const nameOf = (id) => exercises.find((exercise) => exercise.id === id)?.nombre ?? t('training.exercise')

  return (
    <Section
      title={t('home.records')}
      action={
        <Link
          to="/progreso"
          className="inline-flex h-10 items-center px-1 text-[15px] font-semibold text-gym-text-dim hover:text-gym-text-bright"
        >
          {t('home.seeAll')}
        </Link>
      }
    >
      <ListGroup>
        {items.map((pr) => (
          <ListRow
            key={pr.id}
            title={nameOf(pr.ejercicioId)}
            subtitle={formatRelativeDay(pr.fecha, t, lang)}
            leading={<span className="h-8 w-1.5 shrink-0 rounded-full bg-plate-yellow" aria-hidden="true" />}
            trailing={
              <span className="tabular font-display text-2xl font-extrabold text-gym-text-bright">
                {formatNumber(pr.valor, lang)}
                <span className="ml-0.5 font-body text-sm font-semibold text-gym-text-muted">kg</span>
              </span>
            }
          />
        ))}
      </ListGroup>
    </Section>
  )
}
