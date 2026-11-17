import { cn } from './cn'

/** Una cifra con su etiqueta. La cifra manda; la etiqueta explica. */
export function Stat({ label, value, unit, note, className, accent }) {
  return (
    <div className={cn('min-w-0', className)}>
      <p className="truncate text-sm text-gym-text-muted">{label}</p>
      <p className="tabular mt-0.5 flex items-baseline gap-1 font-display text-[2rem] font-extrabold leading-none text-gym-text-bright">
        {accent && (
          <span
            className="mr-1 inline-block h-2.5 w-2.5 self-center rounded-full"
            style={{ backgroundColor: accent }}
            aria-hidden="true"
          />
        )}
        <span className="truncate">{value}</span>
        {unit && <span className="font-body text-base font-semibold text-gym-text-dim">{unit}</span>}
      </p>
      {note && <p className="mt-1 truncate text-sm text-gym-text-muted">{note}</p>}
    </div>
  )
}

/** Rejilla de cifras separadas por líneas finas, sin una caja por cifra. */
export function StatGrid({ children, columns = 2, className }) {
  return (
    <div
      className={cn(
        'grid gap-px overflow-hidden rounded-2xl border border-gym-border bg-gym-border',
        columns === 3 ? 'grid-cols-3' : 'grid-cols-2',
        className,
      )}
    >
      {[children]
        .flat()
        .filter(Boolean)
        .map((child, index) => (
          <div key={index} className="bg-gym-card px-4 py-3.5">
            {child}
          </div>
        ))}
    </div>
  )
}
