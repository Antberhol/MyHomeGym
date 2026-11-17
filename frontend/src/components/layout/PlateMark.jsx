/** Disco en miniatura con el color de acción: la marca de la app. */
export function PlateMark({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <circle cx="16" cy="16" r="15" fill="rgb(var(--gym-accent))" />
      <circle cx="16" cy="16" r="12" fill="none" stroke="rgb(var(--gym-accent-dim))" strokeWidth="1" />
      <circle cx="16" cy="16" r="5" fill="#8B9097" />
      <circle cx="16" cy="16" r="2.2" fill="rgb(var(--gym-bg))" />
    </svg>
  )
}
