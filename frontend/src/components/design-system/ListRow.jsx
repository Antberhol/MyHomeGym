import { ChevronRight } from 'lucide-react'
import { cn } from './cn'

/** Fila de lista agrupada. Si tiene onClick o `to` es tocable entera. */
export function ListGroup({ children, className }) {
  return (
    <div
      className={cn(
        'divide-y divide-gym-border overflow-hidden rounded-2xl border border-gym-border bg-gym-card',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onClick,
  chevron = Boolean(onClick),
  className,
  as,
}) {
  const Tag = as ?? (onClick ? 'button' : 'div')
  return (
    <Tag
      type={Tag === 'button' ? 'button' : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-4 py-3 text-left',
        onClick && 'transition-colors hover:bg-gym-card-2 active:bg-gym-border',
        className,
      )}
    >
      {leading}
      <div className="min-w-0 flex-1">
        <div className="truncate text-[16px] font-semibold text-gym-text-bright">{title}</div>
        {subtitle && <div className="mt-0.5 truncate text-sm text-gym-text-muted">{subtitle}</div>}
      </div>
      {trailing}
      {chevron && <ChevronRight size={18} className="shrink-0 text-gym-text-muted" aria-hidden="true" />}
    </Tag>
  )
}
