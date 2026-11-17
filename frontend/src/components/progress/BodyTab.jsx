import { Ruler } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatNumber, formatShortDate } from '../../utils/format'
import { EmptyState, Section, Stat, StatGrid } from '../design-system'
import { TrendChart } from './TrendChart'

const MEASURES = [
  ['cintura', 'progress.body.waist'],
  ['pecho', 'progress.body.chest'],
  ['hombros', 'progress.body.shoulders'],
  ['biceps', 'progress.body.biceps'],
  ['diametroPierna', 'progress.body.leg'],
  ['pantorrilla', 'progress.body.calf'],
]

/** Cuerpo: peso corporal y última medición de cada perímetro. */
export function BodyTab({ data }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const list = data.measurements
  const latest = list.at(-1)
  const addLink = (
    <Link
      to="/perfil"
      className="inline-flex h-10 items-center px-1 text-[15px] font-semibold text-gym-text-dim hover:text-gym-text-bright"
    >
      {t('progressPage.addMeasurement')}
    </Link>
  )

  if (!latest) {
    return (
      <EmptyState
        icon={Ruler}
        title={t('progressPage.noBodyTitle')}
        text={t('progressPage.noBodyText')}
        action={addLink}
      />
    )
  }

  const filled = MEASURES.filter(([key]) => latest[key])
  return (
    <div className="space-y-8">
      <Section title={t('progressPage.bodyWeight')} action={addLink}>
        <StatGrid>
          <Stat
            label={t('progressPage.current')}
            value={formatNumber(latest.pesoCorporal, lang)}
            unit="kg"
            note={formatShortDate(latest.fechaRegistro, lang)}
          />
          <Stat
            label={t('progressPage.change')}
            value={`${latest.pesoCorporal - list[0].pesoCorporal >= 0 ? '+' : ''}${formatNumber(latest.pesoCorporal - list[0].pesoCorporal, lang)}`}
            unit="kg"
            note={t('progressPage.since', { date: formatShortDate(list[0].fechaRegistro, lang) })}
          />
        </StatGrid>
        {list.length > 1 && (
          <TrendChart
            data={list.map((item) => ({
              label: formatShortDate(item.fechaRegistro, lang),
              peso: item.pesoCorporal,
            }))}
            dataKey="peso"
            unit="kg"
            format={(v) => formatNumber(v, lang)}
          />
        )}
      </Section>
      {filled.length > 0 && (
        <Section title={t('progress.body.measurements')}>
          <StatGrid columns={3}>
            {filled.map(([key, label]) => (
              <Stat key={key} label={t(label)} value={formatNumber(latest[key], lang)} unit="cm" />
            ))}
          </StatGrid>
        </Section>
      )}
    </div>
  )
}
