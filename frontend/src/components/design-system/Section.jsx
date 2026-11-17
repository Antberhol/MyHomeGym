import { cn } from './cn'

/** Bloque de una pantalla: título, acción opcional a la derecha y contenido sin caja. */
export function Section({ title, action, description, className, children, id }) {
  const headingId = id ? `${id}-title` : undefined
  return (
    <section aria-labelledby={headingId} className={cn('space-y-3', className)}>
      {(title || action) && (
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            {title && (
              <h2 id={headingId} className="font-display text-2xl leading-tight text-gym-text-bright">
                {title}
              </h2>
            )}
            {description && <p className="mt-0.5 text-sm text-gym-text-muted">{description}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
