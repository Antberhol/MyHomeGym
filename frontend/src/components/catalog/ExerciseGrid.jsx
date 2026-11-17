import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ExerciseThumbnail } from '../exercises/ExerciseThumbnail'

/** Rejilla de ejercicios con foto. Se pinta por tandas para no cargar 876 fotos de golpe. */
export function ExerciseGrid({ exercises, visible, onShowMore }) {
  const { t } = useTranslation()
  const shown = exercises.slice(0, visible)
  return (
    <div className="space-y-4">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {shown.map((exercise) => (
          <li key={exercise.id}>
            <Link
              to={`/catalogo/${exercise.id}`}
              className="group block overflow-hidden rounded-2xl border border-gym-border bg-gym-card transition-colors hover:bg-gym-card-2"
            >
              <div className="relative">
                <ExerciseThumbnail
                  imagenUrl={exercise.imagenUrl}
                  nombre={exercise.nombre}
                  className="aspect-[4/3] w-full rounded-none"
                />
                {exercise.esPersonalizado && (
                  <span className="absolute left-2 top-2 rounded-md bg-gym-black/85 px-2 py-0.5 text-xs font-semibold text-gym-text-bright">
                    {t('exerciseDetail.custom')}
                  </span>
                )}
              </div>
              <div className="px-3 pb-3 pt-2">
                <p className="line-clamp-2 min-h-[2.5rem] text-[15px] font-semibold leading-5 text-gym-text-bright">
                  {exercise.nombre}
                </p>
                <p className="mt-1 truncate text-sm text-gym-text-muted">
                  {t(`muscleGroups.${exercise.grupoMuscularPrimario}`, {
                    defaultValue: exercise.grupoMuscularPrimario,
                  })}
                </p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {exercises.length > visible && (
        <button
          type="button"
          onClick={onShowMore}
          className="h-12 w-full rounded-xl border border-gym-border-2 font-semibold text-gym-text-bright hover:bg-gym-card"
        >
          {t('catalogPage.showMore', { count: exercises.length - visible })}
        </button>
      )}
    </div>
  )
}
