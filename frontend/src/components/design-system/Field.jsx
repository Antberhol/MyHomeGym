import { forwardRef, useId } from 'react'
import { cn } from './cn'

const control =
  'w-full rounded-xl border border-gym-border bg-gym-black px-3.5 text-[16px] text-gym-text-bright outline-none transition-colors placeholder:text-gym-text-muted focus:border-gym-text-dim'

/** Etiqueta + control + ayuda o error. Envuelve input, select o textarea. */
export function Field({ label, hint, error, htmlFor, className, children }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-semibold text-gym-text-dim">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-sm font-medium text-gym-danger">{error}</p>
      ) : (
        hint && <p className="text-sm text-gym-text-muted">{hint}</p>
      )}
    </div>
  )
}

export const Input = forwardRef(function Input(
  { label, hint, error, className, containerClassName, id, suffix, ...props },
  ref,
) {
  const auto = useId()
  const inputId = id ?? props.name ?? auto
  return (
    <Field label={label} hint={hint} error={error} htmlFor={inputId} className={containerClassName}>
      <div className="relative">
        <input
          ref={ref}
          id={inputId}
          className={cn(control, 'h-12', suffix && 'pr-12', error && 'border-gym-danger', className)}
          {...props}
        />
        {suffix && (
          <span className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-sm text-gym-text-muted">
            {suffix}
          </span>
        )}
      </div>
    </Field>
  )
})

export const Select = forwardRef(function Select(
  { label, hint, className, containerClassName, id, children, ...props },
  ref,
) {
  const auto = useId()
  const selectId = id ?? props.name ?? auto
  return (
    <Field label={label} hint={hint} htmlFor={selectId} className={containerClassName}>
      <select
        ref={ref}
        id={selectId}
        className={cn(control, 'h-12 appearance-none bg-[length:16px] pr-10', className)}
        {...props}
      >
        {children}
      </select>
    </Field>
  )
})

export const Textarea = forwardRef(function Textarea(
  { label, hint, className, containerClassName, id, ...props },
  ref,
) {
  const auto = useId()
  const textareaId = id ?? props.name ?? auto
  return (
    <Field label={label} hint={hint} htmlFor={textareaId} className={containerClassName}>
      <textarea ref={ref} id={textareaId} className={cn(control, 'min-h-24 py-3', className)} {...props} />
    </Field>
  )
})
