import { BarChart3 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { formatShortDate, formatVolume } from '../../utils/format'
import { BodyMap } from '../body/BodyMap'
import { EmptyState, Section, Stat, StatGrid } from '../design-system'
import { WeeklyVolumeChart } from '../stats/WeeklyVolumeChart'

/** Resumen: esta semana frente a la anterior, volumen semanal y mapa muscular de 30 días. */
export function SummaryTab({ data }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const weeks = data.weeklyVolume
  if (data.trainings.length === 0) {
    return (
      <EmptyState
        icon={BarChart3}
        title={t('progressPage.emptyTitle')}
        text={t('progressPage.emptyText')}
        action={
          <Link
            to="/entrenar"
            className="inline-flex h-11 items-center rounded-xl border border-gym-border-2 px-4 font-semibold text-gym-text-bright hover:bg-gym-card-2"
          >
            {t('progressPage.goTrain')}
          </Link>
        }
      />
    )
  }
  const current = weeks.at(-1)
  const previous = weeks.at(-2)
  const volume = formatVolume(current.volume, lang)
  const delta =
    previous.volume > 0 ? Math.round(((current.volume - previous.volume) / previous.volume) * 100) : null

  return (
    <div className="space-y-8">
      <StatGrid>
        <Stat
          label={t('progressPage.thisWeek')}
          value={current.sessions}
          unit={t('progressPage.sessionsUnit', { count: current.sessions })}
        />
        <Stat
          label={t('home.volume')}
          value={volume.value}
          unit={volume.unit}
          note={
            delta === null
              ? t('progressPage.noPrevious')
              : t('progressPage.vsLastWeek', { delta: `${delta > 0 ? '+' : ''}${delta}` })
          }
        />
      </StatGrid>

      <Section title={t('progressPage.weeklyVolume')} description={t('progressPage.weeklyVolumeHint')}>
        <WeeklyVolumeChart
          data={weeks.map((week) => ({
            label: week.isCurrent ? t('progressPage.now') : formatShortDate(week.start.toISOString(), lang),
            volume: Math.round(week.volume),
            isCurrent: week.isCurrent,
          }))}
        />
      </Section>

      <Section
        title={t('progressPage.muscles')}
        description={t('progressPage.musclesHint')}
        action={
          <Link
            to="/diagrama-corporal"
            className="inline-flex h-10 items-center px-1 text-[15px] font-semibold text-gym-text-dim hover:text-gym-text-bright"
          >
            {t('progressPage.byPeriod')}
          </Link>
        }
      >
        <BodyMap volumes={data.zoneVolumes} />
      </Section>
    </div>
  )
}
