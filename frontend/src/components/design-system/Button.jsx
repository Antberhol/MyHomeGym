import { cva } from 'class-variance-authority'
import { cn } from './cn'

/*
 * primary: la acción principal de la pantalla (una sola). Color de acción.
 * secondary: acciones normales. Contorno.
 * quiet: acciones de poco peso dentro de listas.
 * danger: borrar o cerrar sesión. Texto rojo, nunca relleno, para no competir con primary.
 */
const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 rounded-xl transition-colors disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'bg-gym-accent font-display text-lg font-extrabold text-gym-on-accent hover:bg-gym-accent-light active:bg-gym-accent-dim',
        secondary:
          'border border-gym-border-2 bg-gym-card font-semibold text-gym-text-bright hover:bg-gym-card-2 active:bg-gym-border',
        quiet: 'font-semibold text-gym-text-dim hover:bg-gym-card-2 hover:text-gym-text-bright',
        danger: 'border border-gym-border-2 font-semibold text-gym-danger hover:bg-gym-card-2',
        ghost: 'text-gym-text-dim hover:text-gym-text-bright',
      },
      size: {
        sm: 'h-11 px-3 text-sm',
        md: 'h-11 px-4 text-[15px]',
        lg: 'h-14 px-5 text-xl',
        icon: 'h-11 w-11',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
    },
  },
)

export function Button({ className, variant, size, fullWidth, type = 'button', ...props }) {
  return (
    <button type={type} className={cn(buttonVariants({ variant, size, fullWidth }), className)} {...props} />
  )
}
