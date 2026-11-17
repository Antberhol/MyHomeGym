import { Trash2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button, Chips } from '../design-system'
import { Sheet } from '../ui/BottomSheet'

const TYPES = ['normal', 'warmup', 'dropset', 'failure']
const RPES = [6, 7, 7.5, 8, 8.5, 9, 9.5, 10]

/** Tipo de serie y RPE de una serie concreta. Quitar la serie solo existe en el entreno libre. */
export function SetOptionsSheet({ open, number, type, rpe, onChange, onRemove, onClose }) {
  const { t } = useTranslation()
  return (
    <Sheet isOpen={open} onClose={onClose} title={t('workout.setTitle', { number })}>
      <div className="space-y-5 pb-2">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gym-text-dim">{t('workout.setType')}</p>
          <Chips
            label={t('workout.setType')}
            value={type ?? 'normal'}
            onChange={(value) => onChange('type', value)}
            options={TYPES.map((value) => ({ value, label: t(`training.exerciseCard.setTypes.${value}`) }))}
          />
          <p className="text-sm text-gym-text-muted">{t('workout.warmupHint')}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gym-text-dim">{t('workout.rpe')}</p>
          <Chips
            label={t('workout.rpe')}
            value={rpe ?? 0}
            onChange={(value) => onChange('rpe', value === rpe ? 0 : value)}
            options={RPES.map((value) => ({ value, label: String(value).replace('.', ',') }))}
          />
          <p className="text-sm text-gym-text-muted">{t('workout.rpeHint')}</p>
        </div>
        {onRemove && (
          <Button variant="danger" fullWidth onClick={onRemove}>
            <Trash2 size={18} /> {t('workout.removeSet')}
          </Button>
        )}
      </div>
    </Sheet>
  )
}
