import { Dumbbell } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Hueco de imagen para ejercicios sin foto: una mancuerna sobre el fondo, sin texto. */
export function ExerciseMediaFallback({ className = '', label }) {
  const { t } = useTranslation()
  return (
    <div
      role="img"
      aria-label={label ?? t('a11y.noImageAvailable')}
      className={`flex h-full w-full items-center justify-center bg-gym-card-2 text-gym-text-muted ${className}`}
    >
      <Dumbbell size={22} strokeWidth={1.8} aria-hidden="true" />
    </div>
  )
}
