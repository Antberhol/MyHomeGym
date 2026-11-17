import { useTranslation } from 'react-i18next'

/**
 * Barra de descanso pegada encima de la navegación: cuenta atrás grande, barra de progreso
 * y ajustes de ±15 s. Desaparece sola al llegar a cero.
 */
export function RestTimerOverlay({ restSeconds, restTotal, formatClock, onAdjust, onSkip }) {
  const { t } = useTranslation()
  if (restSeconds <= 0) return null
  const progress = restTotal > 0 ? Math.min(1, restSeconds / restTotal) : 1

  return (
    <div
      role="timer"
      aria-live="off"
      aria-label={t('restTimerOverlay.label')}
      className="fixed inset-x-0 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 px-3 md:bottom-6 md:left-auto md:right-6 md:w-96"
    >
      <div className="overflow-hidden rounded-2xl border border-gym-border-2 bg-gym-black shadow-[0_-8px_24px_rgba(0,0,0,0.35)]">
        <div className="h-1 bg-gym-border">
          <div
            className="h-full bg-plate-blue transition-[width] duration-1000 ease-linear"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gym-text-muted">{t('restTimerOverlay.label')}</p>
            <p className="tabular font-display text-3xl font-extrabold leading-none text-gym-text-bright">
              {formatClock(restSeconds)}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAdjust(-15)}
            className="tabular h-11 rounded-lg px-3 font-semibold text-gym-text-dim hover:bg-gym-card-2"
          >
            −15
          </button>
          <button
            type="button"
            onClick={() => onAdjust(15)}
            className="tabular h-11 rounded-lg px-3 font-semibold text-gym-text-dim hover:bg-gym-card-2"
          >
            +15
          </button>
          <button
            type="button"
            onClick={onSkip}
            className="h-11 rounded-lg border border-gym-border-2 px-3 font-semibold text-gym-text-bright hover:bg-gym-card-2"
          >
            {t('workout.skipRest')}
          </button>
        </div>
      </div>
    </div>
  )
}
