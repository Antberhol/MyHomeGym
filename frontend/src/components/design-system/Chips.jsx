import { cn } from './cn'

/**
 * Fichas para elegir una opción (o varias con `multiple`). Sustituyen a los desplegables
 * cuando las opciones caben a la vista: se ven todas y se eligen con un toque.
 */
export function Chips({ options, value, onChange, multiple = false, label, scroll = false, className }) {
  const selected = multiple ? new Set(value ?? []) : null
  const isOn = (v) => (multiple ? selected.has(v) : value === v)
  const toggle = (v) => {
    if (!multiple) return onChange(v)
    const next = new Set(selected)
    if (next.has(v)) next.delete(v)
    else next.add(v)
    return onChange(options.map((o) => o.value).filter((o) => next.has(o)))
  }

  return (
    <div
      role={multiple ? 'group' : 'radiogroup'}
      aria-label={label}
      className={cn(
        'flex gap-2',
        scroll
          ? '-mx-4 overflow-x-auto px-4 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
          : 'flex-wrap',
        className,
      )}
    >
      {options.map((option) => {
        const on = isOn(option.value)
        return (
          <button
            key={String(option.value)}
            type="button"
            role={multiple ? 'checkbox' : 'radio'}
            aria-checked={on}
            onClick={() => toggle(option.value)}
            className={cn(
              'inline-flex h-11 shrink-0 items-center gap-1.5 rounded-full border px-4 text-[15px] font-semibold transition-colors',
              on
                ? 'border-gym-text-bright bg-gym-text-bright text-gym-black'
                : 'border-gym-border-2 text-gym-text-dim hover:text-gym-text-bright',
            )}
          >
            {option.swatch && (
              <span
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: option.swatch }}
                aria-hidden="true"
              />
            )}
            {option.label}
            {option.count !== undefined && (
              <span className={cn('tabular text-sm', on ? 'text-gym-black/60' : 'text-gym-text-muted')}>
                {option.count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
