import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExerciseMediaFallback } from './ExerciseMediaFallback'

/**
 * free-exercise-db da dos fotos por ejercicio (posición inicial y final). Alternarlas muestra el
 * movimiento como un GIF ligero. Con "reducir movimiento" activado se quedan quietas y se
 * pueden cambiar a mano.
 */
export function ExerciseMotion({ images = [], alt, className = '' }) {
  const { t } = useTranslation()
  const [frame, setFrame] = useState(0)
  const [failed, setFailed] = useState(false)
  const [reducedMotion] = useState(
    () => typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
  )
  const total = images.length

  useEffect(() => {
    if (total < 2 || reducedMotion) return undefined
    const id = window.setInterval(() => setFrame((current) => (current + 1) % total), 1100)
    return () => window.clearInterval(id)
  }, [total, reducedMotion])

  if (total === 0 || failed) {
    return (
      <div className={`aspect-[4/3] w-full overflow-hidden rounded-2xl ${className}`}>
        <ExerciseMediaFallback />
      </div>
    )
  }

  return (
    <div className={`relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-white ${className}`}>
      {images.map((src, index) => (
        <img
          key={src}
          src={src}
          alt={index === 0 ? alt : ''}
          aria-hidden={index !== 0}
          loading="lazy"
          onError={() => setFailed(true)}
          className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${
            index === frame ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      {total > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1.5">
          {images.map((src, index) => (
            <button
              key={src}
              type="button"
              aria-label={t('exerciseDetail.frame', { n: index + 1, total })}
              aria-pressed={index === frame}
              onClick={() => setFrame(index)}
              className={`h-2.5 w-2.5 min-h-0 min-w-0 rounded-full ${index === frame ? 'bg-gym-black' : 'bg-gym-black/25'}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
