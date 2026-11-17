import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { formatVolume } from '../../utils/format'
import { Section, Stat, StatGrid } from '../design-system'

/** Los últimos siete días en cuatro cifras. */
export function WeekStats({ trainings, sets, streak }) {
  const { t, i18n } = useTranslation()
  const [weekAgo] = useState(() => Date.now() - 7 * 24 * 60 * 60 * 1000)
  const week = trainings.filter((training) => +new Date(training.fecha) >= weekAgo)
  const weekIds = new Set(week.map((training) => training.id))
  const weekSets = sets.filter((set) => weekIds.has(set.entrenamientoId) && set.type !== 'warmup').length
  const volume = formatVolume(
    week.reduce((acc, item) => acc + (item.volumenTotal ?? 0), 0),
    i18n.language,
  )
  const minutes = week.reduce((acc, item) => acc + (item.duracionMinutos ?? 0), 0)

  return (
    <Section title={t('home.week')}>
      <StatGrid>
        <Stat
          label={t('home.sessions')}
          value={week.length}
          note={streak > 0 ? t('home.streak', { count: streak }) : t('home.streakNone')}
        />
        <Stat label={t('home.volume')} value={volume.value} unit={volume.unit} />
        <Stat label={t('home.sets')} value={weekSets} />
        <Stat label={t('home.time')} value={minutes} unit="min" />
      </StatGrid>
    </Section>
  )
}
