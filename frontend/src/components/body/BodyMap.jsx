import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BODY_ZONES, HEAT_INTENSITY, levelsFromVolumes } from '../../utils/muscleMap'
import { formatNumber } from '../../utils/format'
import { BodyFigure } from './BodyFigure'

/**
 * Mapa muscular de frente y de espaldas, con el color relativo a tu músculo más trabajado.
 * Toca una zona para ver su volumen; debajo, las zonas más y menos trabajadas.
 */
export function BodyMap({ volumes, showRanking = true }) {
  const { t, i18n } = useTranslation()
  const [selected, setSelected] = useState(null)
  const levels = useMemo(() => levelsFromVolumes(volumes), [volumes])
  const ranked = BODY_ZONES.map((zone) => ({ zone, volume: volumes[zone] ?? 0 })).sort(
    (a, b) => b.volume - a.volume,
  )
  const trained = ranked.filter((item) => item.volume > 0)
  const untrained = ranked.filter((item) => item.volume === 0)
  const max = trained[0]?.volume ?? 0
  const label = (zone) => t(`bodyMap.zones.${zone}`)

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 rounded-2xl border border-gym-border bg-gym-card px-3 py-4">
        {['frontal', 'posterior'].map((view) => (
          <figure key={view} className="space-y-1">
            <BodyFigure
              view={view}
              levelByZone={levels}
              onSelectZone={setSelected}
              ariaLabel={t(`bodyMap.${view}`)}
            />
            <figcaption className="text-center text-sm text-gym-text-muted">
              {t(`bodyMap.${view}`)}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="flex items-center gap-2 text-sm text-gym-text-muted" aria-hidden="true">
        <span>{t('bodyMap.less')}</span>
        <span className="h-2 w-6 rounded-full bg-gym-border-2" />
        {HEAT_INTENSITY.map((intensity) => (
          <span
            key={intensity}
            className="h-2 w-6 rounded-full bg-plate-blue"
            style={{ opacity: intensity / 100 }}
          />
        ))}
        <span>{t('bodyMap.more')}</span>
      </div>

      {selected && (
        <p className="rounded-xl bg-gym-card-2 px-4 py-3 text-[15px] text-gym-text-dim" role="status">
          <span className="font-semibold text-gym-text-bright">{label(selected)}</span>:{' '}
          {(volumes[selected] ?? 0) > 0
            ? t('bodyMap.zoneVolume', { volume: formatNumber(volumes[selected], i18n.language, 0) })
            : t('bodyMap.zoneNone')}
        </p>
      )}

      {showRanking && trained.length > 0 && (
        <ul className="space-y-2.5">
          {trained.map((item) => (
            <li key={item.zone} className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3">
              <span className="truncate text-[15px] text-gym-text-base">{label(item.zone)}</span>
              <span className="h-2 overflow-hidden rounded-full bg-gym-border">
                <span
                  className="block h-full rounded-full bg-plate-blue"
                  style={{ width: `${(item.volume / max) * 100}%` }}
                />
              </span>
              <span className="tabular text-right text-sm text-gym-text-muted">
                {formatNumber(item.volume, i18n.language, 0)} kg
              </span>
            </li>
          ))}
        </ul>
      )}
      {showRanking && trained.length > 0 && untrained.length > 0 && (
        <p className="text-[15px] text-gym-text-muted">
          {t('bodyMap.untrained', {
            zones: untrained.map((item) => label(item.zone).toLowerCase()).join(', '),
          })}
        </p>
      )}
    </div>
  )
}
