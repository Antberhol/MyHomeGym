import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ROUTINE_COLORS } from '../../constants/routineTemplates'
import { readableTextOn } from '../../utils/color'

/** Muestras de color de disco. Sustituye al selector de color del navegador. */
export function ColorPicker({ value, onChange, label }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-1.5">
      <p className="text-sm font-semibold text-gym-text-dim">{label}</p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2.5">
        {ROUTINE_COLORS.map((color) => {
          const on = value?.toLowerCase() === color.toLowerCase()
          return (
            <button
              key={color}
              type="button"
              role="radio"
              aria-checked={on}
              aria-label={t(`colors.${color.slice(1).toLowerCase()}`)}
              onClick={() => onChange(color)}
              className={`flex h-11 w-11 items-center justify-center rounded-full ${on ? 'ring-2 ring-gym-text-bright ring-offset-2 ring-offset-gym-card' : ''}`}
              style={{ backgroundColor: color }}
            >
              {on && <Check size={20} strokeWidth={3} style={{ color: readableTextOn(color) }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
