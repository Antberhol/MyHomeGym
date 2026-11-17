import { Share2, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber, formatVolume } from '../../utils/format'
import { Button, ListGroup, ListRow, Section, Stat, StatGrid } from '../design-system'
import { WorkoutShareCard } from '../share/WorkoutShareCard'

/** Lo que ves al terminar: cifras de la sesión, récords, desglose y compartir. */
export function WorkoutSummary({ summary, sharePreviewData, onShare, onExit }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const volume = formatVolume(summary.totalVolume, lang)

  return (
    <div className="space-y-6">
      <header className="pt-2">
        <p className="text-[15px] font-semibold text-gym-text-muted">{t('workout.savedEyebrow')}</p>
        <h1 className="font-display text-[2.75rem] leading-[0.95] text-gym-text-bright">
          {t('workout.savedTitle')}
        </h1>
      </header>

      <StatGrid>
        <Stat label={t('training.summary.duration')} value={summary.durationMinutes} unit="min" />
        <Stat label={t('training.summary.volume')} value={volume.value} unit={volume.unit} />
        <Stat label={t('training.summary.sets')} value={summary.setCount} />
        <Stat
          label={t('workout.records')}
          value={summary.prsCreated}
          accent={summary.prsCreated > 0 ? '#F2C230' : undefined}
        />
      </StatGrid>

      {summary.prsCreated > 0 && (
        <p className="flex items-center gap-2 text-[15px] text-gym-text-dim">
          <Trophy size={18} className="text-plate-yellow" />{' '}
          {t('workout.recordsText', { count: summary.prsCreated })}
        </p>
      )}

      <Section title={t('training.summary.breakdownByExercise')}>
        {summary.byExercise.length === 0 ? (
          <p className="text-gym-text-muted">{t('training.summary.noBreakdown')}</p>
        ) : (
          <ListGroup>
            {summary.byExercise.map((item) => (
              <ListRow
                key={item.exerciseId}
                title={item.name}
                subtitle={t('workout.setsCount', { count: item.sets })}
                trailing={
                  <span className="tabular font-display text-xl font-extrabold text-gym-text-bright">
                    {formatNumber(item.volume, lang, 0)}{' '}
                    <span className="font-body text-sm font-semibold text-gym-text-muted">kg</span>
                  </span>
                }
              />
            ))}
          </ListGroup>
        )}
      </Section>

      {summary.exerciseNotes.length > 0 && (
        <Section title={t('training.summary.exerciseNotes')}>
          <ListGroup>
            {summary.exerciseNotes.map((entry) => (
              <div key={entry.exerciseId} className="px-4 py-3">
                <p className="font-semibold text-gym-text-bright">{entry.name}</p>
                <p className="text-gym-text-dim">{entry.note}</p>
              </div>
            ))}
          </ListGroup>
        </Section>
      )}

      {sharePreviewData && (
        <Section title={t('training.summary.sharePreview')}>
          <div className="mx-auto w-fit overflow-hidden rounded-2xl border border-gym-border">
            <div className="relative h-[320px] w-[180px] overflow-hidden">
              <div className="absolute left-0 top-0 origin-top-left scale-50">
                <WorkoutShareCard data={sharePreviewData} />
              </div>
            </div>
          </div>
        </Section>
      )}

      <div className="space-y-2">
        <Button variant="secondary" fullWidth size="lg" className="font-body text-base" onClick={onShare}>
          <Share2 size={18} /> {t('training.summary.share')}
        </Button>
        <Button fullWidth size="lg" onClick={onExit}>
          {t('workout.close')}
        </Button>
      </div>
    </div>
  )
}
