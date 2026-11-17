import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../../utils/format'

const TYPE_MARK = { warmup: 'C', dropset: 'D', failure: 'F' }

function NumberCell({ value, onChange, label, step }) {
  return (
    <input
      type="number"
      inputMode="decimal"
      step={step}
      min={0}
      aria-label={label}
      value={value > 0 ? value : ''}
      placeholder="0"
      onChange={(event) => onChange(event.target.value.replace(',', '.'))}
      onFocus={(event) => event.target.select()}
      className="tabular h-11 w-full rounded-lg border border-transparent !bg-gym-card-2 px-1 text-center font-display text-xl font-extrabold !text-gym-text-bright outline-none placeholder:text-gym-text-muted focus:!border-gym-text-dim"
    />
  )
}

/**
 * Tabla de series: número (toca para cambiar tipo o RPE), lo que hiciste la última vez,
 * kilos, repeticiones y el check que marca la serie como hecha y arranca el descanso.
 */
export function SetTable({ rows, onChange, onToggleDone, onOpenOptions }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <div role="table" aria-label={t('workout.sets')} className="space-y-1.5">
      <div
        role="row"
        className="grid grid-cols-[2.75rem_1fr_4.5rem_3.75rem_2.75rem] items-center gap-2 px-1 text-xs font-semibold text-gym-text-muted"
      >
        <span role="columnheader" className="text-center">
          {t('workout.setShort')}
        </span>
        <span role="columnheader">{t('workout.previous')}</span>
        <span role="columnheader" className="text-center">
          kg
        </span>
        <span role="columnheader" className="text-center">
          {t('workout.reps')}
        </span>
        <span role="columnheader" className="sr-only">
          {t('workout.done')}
        </span>
      </div>
      {rows.map((row, index) => {
        const canComplete = row.reps > 0
        return (
          <div
            role="row"
            key={row.key}
            className={`grid grid-cols-[2.75rem_1fr_4.5rem_3.75rem_2.75rem] items-center gap-2 rounded-xl px-1 py-1 transition-colors ${
              row.done ? 'bg-plate-green/15' : ''
            }`}
          >
            <div role="cell">
              <button
                type="button"
                onClick={() => onOpenOptions(index)}
                aria-label={t('workout.setOptions', { number: index + 1 })}
                className={`tabular flex h-11 w-11 items-center justify-center rounded-lg font-display text-lg font-extrabold ${
                  row.type && row.type !== 'normal'
                    ? 'bg-plate-yellow text-gym-black'
                    : 'text-gym-text-dim hover:bg-gym-card-2'
                }`}
              >
                {TYPE_MARK[row.type] ?? index + 1}
              </button>
            </div>
            <span role="cell" className="tabular truncate text-sm text-gym-text-muted">
              {row.previous ? `${formatNumber(row.previous.peso, lang)} × ${row.previous.reps}` : '–'}
              {row.rpe ? <span className="ml-1 text-gym-text-dim">@{row.rpe}</span> : null}
            </span>
            <div role="cell">
              <NumberCell
                value={row.peso}
                step={0.5}
                label={t('workout.weightOfSet', { number: index + 1 })}
                onChange={(v) => onChange(index, 'peso', v)}
              />
            </div>
            <div role="cell">
              <NumberCell
                value={row.reps}
                step={1}
                label={t('workout.repsOfSet', { number: index + 1 })}
                onChange={(v) => onChange(index, 'reps', v)}
              />
            </div>
            <div role="cell">
              <button
                type="button"
                onClick={() => onToggleDone(index)}
                disabled={!canComplete && !row.done}
                aria-pressed={Boolean(row.done)}
                aria-label={t(row.done ? 'workout.undoSet' : 'workout.completeSet', { number: index + 1 })}
                className={`flex h-11 w-11 items-center justify-center rounded-lg border transition-colors disabled:opacity-30 ${
                  row.done
                    ? 'border-plate-green bg-plate-green text-gym-black'
                    : 'border-gym-border-2 text-gym-text-dim hover:text-gym-text-bright'
                }`}
              >
                <Check size={20} strokeWidth={3} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
