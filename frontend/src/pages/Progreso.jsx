import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Chips, PageHeader } from '../components/design-system'
import { BodyTab } from '../components/progress/BodyTab'
import { RecordsTab } from '../components/progress/RecordsTab'
import { StrengthTab } from '../components/progress/StrengthTab'
import { SummaryTab } from '../components/progress/SummaryTab'
import { useProgressData } from '../hooks/useProgressData'

const TABS = { summary: SummaryTab, strength: StrengthTab, records: RecordsTab, body: BodyTab }

export function ProgresoPage() {
  const { t } = useTranslation()
  const [now] = useState(() => new Date())
  const [tab, setTab] = useState('summary')
  const data = useProgressData(now)
  const Tab = TABS[tab]

  return (
    <div>
      <PageHeader
        title={t('progress.title')}
        subtitle={t('progressPage.subtitle', { count: data.trainings.length })}
      >
        <Chips
          scroll
          label={t('progressPage.sections')}
          value={tab}
          onChange={setTab}
          options={Object.keys(TABS).map((value) => ({ value, label: t(`progressPage.tabs.${value}`) }))}
        />
      </PageHeader>
      <Tab data={data} />
    </div>
  )
}
