import { useState } from 'react'
import { ExerciseMediaFallback } from './ExerciseMediaFallback'

/**
 * Miniatura de un ejercicio: la primera foto del catálogo, cargada solo cuando se ve.
 * Los ejercicios propios sin foto muestran el icono genérico.
 */
export function ExerciseThumbnail({ imagenUrl, imagenes, nombre, className = '' }) {
  const [failed, setFailed] = useState(false)
  const src = imagenUrl || imagenes?.[0]
  return (
    <div className={`shrink-0 overflow-hidden rounded-xl bg-gym-black ${className}`}>
      {src && !failed ? (
        <img
          src={src}
          alt=""
          title={nombre}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <ExerciseMediaFallback />
      )}
    </div>
  )
}
