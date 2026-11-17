import { useTranslation } from 'react-i18next'
import { formatNumber } from '../../utils/format'

/**
 * Imagen para compartir (360×640). Mismo sistema visual que la app: grafito, tiza y
 * los colores de disco solo para datos. Se rasteriza con html2canvas, por eso todo va inline.
 */
export function WorkoutShareCard({ data }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const muscles = (data.muscleDistribution ?? []).slice(0, 4)
  const maxMuscle = Math.max(1, ...muscles.map((item) => item.volume))
  const exercises = (data.topExercises ?? []).slice(0, 4)

  return (
    <div className="flex h-[640px] w-[360px] flex-col overflow-hidden rounded-[2rem] bg-[#14131B] p-7 text-[#DDD9D0]">
      <header>
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded-full border-[3px] border-[#7060E0] bg-[#9284FA]" />
          <span className="font-display text-lg font-black text-[#F4F1EA]">MyHomeGym</span>
        </div>
        <h2 className="mt-5 font-display text-[3.25rem] font-black leading-[0.9] text-[#F4F1EA]">
          {t('workoutShare.title')}
        </h2>
        <p className="mt-2 text-sm text-[#9AA0A6]">{data.dateLabel}</p>
      </header>

      <div className="mt-6">
        <p className="text-sm text-[#9AA0A6]">{t('workoutShare.totalVolume')}</p>
        <p className="font-display text-6xl font-black leading-none text-[#F4F1EA]">
          {formatNumber(data.totalVolume, lang, 0)}
          <span className="ml-1 font-body text-2xl font-semibold text-[#9AA0A6]">kg</span>
        </p>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-px overflow-hidden rounded-2xl bg-[#353940]">
        {[
          [t('workoutShare.time'), `${data.durationMinutes} min`],
          [t('workoutShare.sets'), data.setCount],
          [t('workoutShare.prs'), data.prsCreated],
        ].map(([label, value]) => (
          <div key={label} className="bg-[#24272C] px-3 py-2.5">
            <p className="text-xs text-[#9AA0A6]">{label}</p>
            <p className="font-display text-2xl font-extrabold text-[#F4F1EA]">{value}</p>
          </div>
        ))}
      </div>

      {exercises.length > 0 && (
        <ul className="mt-5 space-y-2">
          {exercises.map((item) => (
            <li
              key={item.exerciseId ?? item.name}
              className="flex items-baseline justify-between gap-3 text-sm"
            >
              <span className="truncate text-[#DDD9D0]">{item.name}</span>
              <span className="shrink-0 font-semibold text-[#F4F1EA]">
                {formatNumber(item.volume, lang, 0)} kg
              </span>
            </li>
          ))}
        </ul>
      )}

      {muscles.length > 0 && (
        <div className="mt-auto space-y-1.5">
          {muscles.map((item) => (
            <div key={item.muscle} className="grid grid-cols-[5.5rem_1fr] items-center gap-2 text-xs">
              <span className="truncate text-[#9AA0A6]">
                {t(`muscleGroups.${item.muscle}`, { defaultValue: item.muscle })}
              </span>
              <span className="h-1.5 rounded-full bg-[#353940]">
                <span
                  className="block h-full rounded-full bg-[#2F6FDE]"
                  style={{ width: `${(item.volume / maxMuscle) * 100}%` }}
                />
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
