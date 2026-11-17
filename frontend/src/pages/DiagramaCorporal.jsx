import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BodyMap } from '../components/body/BodyMap'
import { Chips, PageHeader } from '../components/design-system'
import { EMPTY_LIST, useLiveQuery } from '../lib/liveQuery'
import { progressRepository } from '../repositories/progressRepository'
import { volumeByZone } from '../utils/muscleMap'

const RANGES = { week: 7, month: 30, quarter: 90, total: null }

export function DiagramaCorporalPage() {
  const { t } = useTranslation()
  const [range, setRange] = useState('month')
  const [now] = useState(() => Date.now())
  const sets = useLiveQuery(() => progressRepository.listPerformedExercises(), [], EMPTY_LIST)
  const exercises = useLiveQuery(() => progressRepository.listExercises(), [], EMPTY_LIST)

  const volumes = useMemo(() => {
    const days = RANGES[range]
    const since = days ? now - days * 86400000 : 0
    const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))
    return volumeByZone(
      sets.filter((set) => +new Date(set.fecha) >= since),
      byId,
    )
  }, [exercises, now, range, sets])

  return (
    <div>
      <PageHeader
        title={t('bodyDiagram.title')}
        subtitle={t('progressPage.musclesHintLong')}
        back="/progreso"
      >
        <Chips
          label={t('bodyDiagram.range.aria')}
          value={range}
          onChange={setRange}
          options={Object.keys(RANGES).map((value) => ({ value, label: t(`progressPage.ranges.${value}`) }))}
        />
      </PageHeader>
      <BodyMap volumes={volumes} />
    </div>
  )
}
