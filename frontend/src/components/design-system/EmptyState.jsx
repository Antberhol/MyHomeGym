import { cn } from './cn'

/** Pantalla o lista vacía: qué falta y qué hacer, con la acción a mano. */
export function EmptyState({ icon: Icon, title, text, action, className }) {
  return (
    <div
      className={cn('rounded-2xl border border-dashed border-gym-border-2 px-5 py-8 text-center', className)}
    >
      {Icon && (
        <Icon className="mx-auto mb-3 text-gym-text-muted" size={28} strokeWidth={1.8} aria-hidden="true" />
      )}
      <p className="font-display text-xl text-gym-text-bright">{title}</p>
      {text && <p className="mx-auto mt-1 max-w-xs text-[15px] text-gym-text-muted">{text}</p>}
      {action && <div className="mt-4 flex justify-center">{action}</div>}
    </div>
  )
}
