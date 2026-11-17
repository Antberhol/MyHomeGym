import { weightOfRepsRecord } from '../../lib/prs'
import { Trophy } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatRelativeDay } from '../../utils/format'
import { Chips, EmptyState, ListGroup, ListRow } from '../design-system'

const TYPES = ['peso_maximo', 'reps_mismo_peso', 'volumen_serie', 'volumen_total']

/** Récords: el mejor de cada ejercicio y tipo, el más reciente primero. */
export function RecordsTab({ data }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [type, setType] = useState('peso_maximo')

  const best = new Map()
  for (const pr of data.prs) {
    if (pr.tipo !== type) continue
    const key = pr.tipo === 'reps_mismo_peso' ? `${pr.ejercicioId}|${pr.detalle}` : pr.ejercicioId
    const current = best.get(key)
    if (!current || pr.valor > current.valor) best.set(key, pr)
  }
  const items = Array.from(best.values()).sort((a, b) => +new Date(b.fecha) - +new Date(a.fecha))
  const nameOf = (id) =>
    id === 'GLOBAL'
      ? t('progressPage.wholeSession')
      : (data.exerciseById.get(id)?.nombre ?? t('progress.unknownExercise'))

  const valueOf = (pr) => {
    if (pr.tipo === 'reps_mismo_peso') {
      const weight = formatNumber(weightOfRepsRecord(pr), lang)
      return { value: pr.valor, unit: t('progressPage.repsAt', { weight }) }
    }
    return { value: formatNumber(pr.valor, lang, pr.tipo === 'peso_maximo' ? 1 : 0), unit: 'kg' }
  }

  return (
    <div className="space-y-4">
      <Chips
        scroll
        label={t('progressPage.recordType')}
        value={type}
        onChange={setType}
        options={TYPES.map((value) => ({ value, label: t(`progressPage.types.${value}`) }))}
      />
      <p className="text-sm text-gym-text-muted">{t(`progressPage.typeHints.${type}`)}</p>
      {items.length === 0 ? (
        <EmptyState icon={Trophy} title={t('progress.prFeed.empty')} />
      ) : (
        <ListGroup>
          {items.map((pr) => {
            const { value, unit } = valueOf(pr)
            return (
              <ListRow
                key={pr.id}
                title={nameOf(pr.ejercicioId)}
                subtitle={formatRelativeDay(pr.fecha, t, lang)}
                trailing={
                  <span className="tabular whitespace-nowrap font-display text-2xl font-extrabold text-gym-text-bright">
                    {value}
                    <span className="ml-1 font-body text-sm font-semibold text-gym-text-muted">{unit}</span>
                  </span>
                }
              />
            )
          })}
        </ListGroup>
      )}
    </div>
  )
}
