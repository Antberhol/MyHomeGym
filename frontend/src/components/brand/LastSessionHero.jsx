import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { calculatePlateDistribution } from '../../utils/plateCalculator'
import { LoadedBarbell } from './LoadedBarbell'

/**
 * Portada del inicio: la serie más pesada de tu última sesión, dibujada como la barra que
 * levantaste. Sin datos, la barra aparece vacía y anima a entrenar.
 */
export function LastSessionHero({ performedSets, exercises }) {
  const { t, i18n } = useTranslation()

  const best = useMemo(() => {
    if (!performedSets.length) return null
    const latest = performedSets.reduce((acc, set) => (set.fecha > acc.fecha ? set : acc))
    const sameSession = performedSets.filter((set) =>
      latest.entrenamientoId
        ? set.entrenamientoId === latest.entrenamientoId
        : set.fecha.slice(0, 10) === latest.fecha.slice(0, 10),
    )
    const top = sameSession.reduce((acc, set) =>
      set.pesoUtilizado > acc.pesoUtilizado ||
      (set.pesoUtilizado === acc.pesoUtilizado && set.repeticionesRealizadas > acc.repeticionesRealizadas)
        ? set
        : acc,
    )
    const exercise = exercises.find((item) => item.id === top.ejercicioId)
    return { ...top, name: exercise?.nombre ?? '' }
  }, [exercises, performedSets])

  const weight = best?.pesoUtilizado ?? 20
  const perSide = calculatePlateDistribution(weight, 20).perSide
  const platesText = perSide.length
    ? t('dashboard.hero.plates', {
        plates: perSide.map((plate) => plate.toLocaleString(i18n.language)).join(' + '),
      })
    : t('dashboard.hero.barOnly')

  return (
    <section aria-labelledby="hero-title" className="rounded-3xl bg-gym-black px-4 pb-5 pt-4">
      <h2 id="hero-title" className="font-body text-sm font-semibold text-gym-text-muted">
        {t('dashboard.hero.title')}
      </h2>
      <div className="-mx-1 mt-1">
        <LoadedBarbell weight={weight} label={`${weight} kg. ${platesText}`} />
      </div>
      {best ? (
        <div className="mt-2 flex flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div>
            <p className="font-display text-6xl font-black leading-none text-gym-text-bright tabular">
              {best.pesoUtilizado.toLocaleString(i18n.language)}
              <span className="ml-1 text-3xl text-gym-text-dim">kg</span>
            </p>
            <p className="mt-1 text-base font-semibold text-gym-text-base">
              {best.name} · {t('dashboard.hero.reps', { count: best.repeticionesRealizadas })}
            </p>
          </div>
          <p className="text-sm text-gym-text-muted">
            {new Date(best.fecha).toLocaleDateString(i18n.language, {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}
          </p>
          <p className="w-full text-xs text-gym-text-muted">{platesText}</p>
        </div>
      ) : (
        <div className="mt-3">
          <p className="max-w-[40ch] text-base text-gym-text-base">{t('dashboard.hero.empty')}</p>
        </div>
      )}
    </section>
  )
}
