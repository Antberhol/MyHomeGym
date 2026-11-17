import { useTranslation } from 'react-i18next'
import { readableTextOn } from '../../utils/color'
import { WEEKDAYS, normalizeWeekday, todayWeekday } from '../../utils/weekdays'

/** Los siete días en fila, con los de la rutina encendidos y hoy subrayado. */
export function WeekdayStrip({ days = [], color }) {
  const { t } = useTranslation()
  const active = new Set(days.map(normalizeWeekday).filter(Boolean))
  const today = todayWeekday()
  return (
    <span
      className="flex gap-1"
      aria-label={WEEKDAYS.filter((d) => active.has(d))
        .map((d) => t(`weekdays.long.${d}`))
        .join(', ')}
    >
      {WEEKDAYS.map((day) => (
        <span
          key={day}
          aria-hidden="true"
          className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
            active.has(day) ? '' : 'text-gym-text-muted'
          } ${day === today ? 'ring-1 ring-gym-text-dim' : ''}`}
          style={
            active.has(day)
              ? { backgroundColor: color || '#E9E7E2', color: readableTextOn(color || '#E9E7E2') }
              : undefined
          }
        >
          {t(`weekdays.short.${day}`)}
        </span>
      ))}
    </span>
  )
}
