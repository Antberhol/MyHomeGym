import { Minus, Plus } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'

/** Campo numérico con botones grandes de - y +, pensado para usar con el pulgar entre series. */
export function NumberStepper({ value, onChange, step = 1, min = 0, max, label, id, decimals, unit }) {
  const { t } = useTranslation()
  const reactId = useId()
  const inputId = id ?? `number-stepper-${reactId}`

  const clampValue = (nextValue) => {
    const withMin = Math.max(min, nextValue)
    return typeof max === 'number' ? Math.min(max, withMin) : withMin
  }

  const normalizeValue = (nextValue) => {
    const fixed = typeof decimals === 'number' ? Number(nextValue.toFixed(decimals)) : nextValue
    return clampValue(fixed)
  }

  const handleInputChange = (raw) => {
    const normalizedRaw = raw.replace(',', '.')
    if (!normalizedRaw.trim()) {
      onChange(normalizeValue(0))
      return
    }
    const parsed = Number(normalizedRaw)
    onChange(normalizeValue(Number.isFinite(parsed) ? parsed : 0))
  }

  const name = label ?? t('numberStepper.valueLabel')

  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-gym-text-dim">
          {label}
        </label>
      )}
      <div className="grid h-12 grid-cols-[2.75rem_1fr_2.75rem] items-stretch overflow-hidden rounded-xl border border-gym-border bg-gym-black">
        <button
          type="button"
          onClick={() => onChange(normalizeValue(value - step))}
          className="flex items-center justify-center text-gym-text-dim hover:bg-gym-card-2 active:bg-gym-border"
          aria-label={t('numberStepper.decreaseAria', { label: name })}
        >
          <Minus size={18} strokeWidth={2.5} />
        </button>
        <div className="relative flex items-center">
          <input
            id={inputId}
            type="number"
            value={Number.isFinite(value) && value !== 0 ? value : ''}
            placeholder="0"
            onChange={(event) => handleInputChange(event.target.value)}
            className="tabular h-full w-full border-x border-gym-border !bg-transparent px-1 text-center font-display text-2xl font-extrabold text-gym-text-bright outline-none placeholder:text-gym-text-muted"
            inputMode="decimal"
          />
          {unit && (
            <span className="pointer-events-none absolute right-2 text-xs font-semibold text-gym-text-muted">
              {unit}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={() => onChange(normalizeValue(value + step))}
          className="flex items-center justify-center text-gym-text-dim hover:bg-gym-card-2 active:bg-gym-border"
          aria-label={t('numberStepper.increaseAria', { label: name })}
        >
          <Plus size={18} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  )
}
