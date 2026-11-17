import { Calculator, MoreHorizontal, Pause, Play } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '../design-system'
import { Sheet } from '../ui/BottomSheet'

/**
 * Cabecera fija del entreno en curso: nombre, cronómetro de sesión y el botón de terminar.
 * Las acciones raras (pausar, calculadora, descartar) van en el menú de "más".
 */
export function WorkoutControls({
  title,
  sessionSeconds,
  sessionRunning,
  formatClock,
  onToggleSession,
  onOpenPlateCalculator,
  onFinishWorkout,
  onDiscardWorkout,
}) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <div className="sticky top-0 z-30 -mx-4 mb-4 border-b border-gym-border bg-gym-bg-dark/95 px-4 pb-3 pt-1 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-gym-text-muted">{title}</p>
            <p
              className={`tabular font-display text-4xl font-black leading-none ${sessionRunning ? 'text-gym-text-bright' : 'text-gym-text-muted'}`}
              aria-label={t('workout.elapsed', { time: formatClock(sessionSeconds) })}
            >
              {formatClock(sessionSeconds)}
            </p>
          </div>
          <Button
            variant="quiet"
            size="icon"
            onClick={() => setMenuOpen(true)}
            aria-label={t('workout.more')}
          >
            <MoreHorizontal size={22} />
          </Button>
          <Button onClick={onFinishWorkout} className="px-5">
            {t('workout.finish')}
          </Button>
        </div>
      </div>

      <Sheet isOpen={menuOpen} onClose={() => setMenuOpen(false)} title={t('workout.options')}>
        <div className="space-y-2 pb-2">
          <Button
            variant="secondary"
            fullWidth
            className="justify-start"
            onClick={() => {
              onToggleSession()
              setMenuOpen(false)
            }}
          >
            {sessionRunning ? <Pause size={18} /> : <Play size={18} />}
            {sessionRunning ? t('training.controls.pause') : t('training.controls.resume')}
          </Button>
          <Button
            variant="secondary"
            fullWidth
            className="justify-start"
            onClick={() => {
              setMenuOpen(false)
              onOpenPlateCalculator()
            }}
          >
            <Calculator size={18} /> {t('training.plateCalculator')}
          </Button>
          <Button
            variant="danger"
            fullWidth
            className="justify-start"
            onClick={() => {
              setMenuOpen(false)
              onDiscardWorkout()
            }}
          >
            {t('training.controls.discardWorkout')}
          </Button>
        </div>
      </Sheet>
    </>
  )
}
