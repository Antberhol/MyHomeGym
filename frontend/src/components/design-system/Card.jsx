import { cn } from './cn'

/** Superficie para un grupo de cosas que se tocan juntas. Para texto suelto, usa Section. */
export function Card({ className, as: Tag = 'div', ...props }) {
  return <Tag className={cn('rounded-2xl border border-gym-border bg-gym-card p-4', className)} {...props} />
}
