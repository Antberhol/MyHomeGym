import { Dumbbell } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatShortDate } from '../../utils/format'
import { EmptyState, Select, Stat, StatGrid } from '../design-system'
import { TrendChart } from './TrendChart'

/** Fuerza: 1RM estimado de un ejercicio a lo largo del tiempo. */
export function StrengthTab({ data }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [selected, setSelected] = useState('')
  const options = data.trainedExercises
  const exerciseId = selected || options[0]?.id || ''

  if (!exerciseId) {
    return (
      <EmptyState
        icon={Dumbbell}
        title={t('progressPage.noStrengthTitle')}
        text={t('progressPage.noStrengthText')}
      />
    )
  }

  const series = data.oneRmSeriesFor(exerciseId)
  const best = series.reduce((acc, point) => (point.oneRm > acc.oneRm ? point : acc), series[0])
  const first = series[0]
  const last = series.at(-1)
  const gain = last && first ? last.oneRm - first.oneRm : 0

  return (
    <div className="space-y-6">
      <Select
        label={t('progress.strength.exerciseSelector')}
        value={exerciseId}
        onChange={(event) => setSelected(event.target.value)}
      >
        {options.map((exercise) => (
          <option key={exercise.id} value={exercise.id}>
            {exercise.nombre}
          </option>
        ))}
      </Select>

      <StatGrid columns={3}>
        <Stat label={t('progressPage.best1rm')} value={formatNumber(best.oneRm, lang, 0)} unit="kg" />
        <Stat
          label={t('progressPage.lastSet')}
          value={formatNumber(last.weight, lang)}
          unit={`× ${last.reps}`}
        />
        <Stat
          label={t('progressPage.change')}
          value={`${gain >= 0 ? '+' : ''}${formatNumber(gain, lang, 0)}`}
          unit="kg"
        />
      </StatGrid>

      {series.length > 1 ? (
        <TrendChart
          data={series.map((point) => ({
            label: formatShortDate(point.date, lang),
            oneRm: Math.round(point.oneRm),
          }))}
          dataKey="oneRm"
          unit="kg"
        />
      ) : (
        <p className="text-gym-text-muted">{t('progressPage.oneSession')}</p>
      )}
      <p className="text-sm text-gym-text-muted">{t('progressPage.oneRmHint')}</p>
    </div>
  )
}
