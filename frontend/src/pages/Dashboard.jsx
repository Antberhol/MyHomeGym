import { useTranslation } from 'react-i18next'
import { LastSessionHero } from '../components/brand/LastSessionHero'
import { RecentRecords } from '../components/dashboard/RecentRecords'
import { RecentSessions } from '../components/dashboard/RecentSessions'
import { TodayCard } from '../components/dashboard/TodayCard'
import { WeekStats } from '../components/dashboard/WeekStats'
import { PageHeader } from '../components/design-system'
import { useStreaks } from '../hooks/useStreaks'
import { EMPTY_LIST, useLiveQuery } from '../lib/liveQuery'
import { progressRepository } from '../repositories/progressRepository'
import { capitalize, formatLongDate } from '../utils/format'

export function DashboardPage() {
  const { t, i18n } = useTranslation()
  const streaks = useStreaks()
  const trainings = useLiveQuery(() => progressRepository.listTrainingsRecent(30), [], EMPTY_LIST)
  const bundles = useLiveQuery(() => progressRepository.listRecentWorkouts(5), [], EMPTY_LIST)
  const routines = useLiveQuery(() => progressRepository.listRoutines(), [], EMPTY_LIST)
  const prs = useLiveQuery(() => progressRepository.listPersonalRecords(), [], EMPTY_LIST)
  const exercises = useLiveQuery(() => progressRepository.listExercises(), [], EMPTY_LIST)
  const sets = useLiveQuery(
    () => progressRepository.listPerformedExercisesSince(new Date(Date.now() - 30 * 86400000).toISOString()),
    [],
    EMPTY_LIST,
  )

  const today = new Date().toISOString()
  const [weekday, ...rest] = formatLongDate(today, i18n.language).split(', ')

  return (
    <div className="space-y-8">
      <PageHeader title={capitalize(weekday)} subtitle={rest.join(', ') || t('dashboard.subtitle')}>
        <TodayCard routines={routines} trainedToday={streaks.trainedToday} />
      </PageHeader>
      <LastSessionHero performedSets={sets} exercises={exercises} />
      <WeekStats trainings={trainings} sets={sets} streak={streaks.currentDayStreak} />
      <RecentSessions bundles={bundles} routines={routines} exercises={exercises} prs={prs} />
      <RecentRecords prs={prs} exercises={exercises} />
    </div>
  )
}
