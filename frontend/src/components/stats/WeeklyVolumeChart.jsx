import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { useTranslation } from 'react-i18next'
import { formatNumber } from '../../utils/format'

const AXIS = { fill: '#9AA0A6', fontSize: 12 }

/** Volumen por semana. La semana en curso va en amarillo; las anteriores en azul. */
export function WeeklyVolumeChart({ data }) {
  const { i18n } = useTranslation()
  const lang = i18n.language
  return (
    <div className="h-52 rounded-2xl border border-gym-border bg-gym-card px-2 pb-2 pt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ left: 0, right: 8, top: 4, bottom: 0 }}>
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} interval={1} />
          <YAxis
            tick={AXIS}
            axisLine={false}
            tickLine={false}
            width={44}
            tickFormatter={(v) => formatNumber(v / 1000, lang, 1) + 't'}
          />
          <Tooltip
            cursor={{ fill: 'rgba(244,241,234,0.06)' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <div className="rounded-lg border border-gym-border-2 bg-gym-black px-3 py-2">
                  <p className="text-xs text-gym-text-muted">{label}</p>
                  <p className="tabular font-semibold text-gym-text-bright">
                    {formatNumber(payload[0].value, lang, 0)} kg
                  </p>
                </div>
              ) : null
            }
          />
          <Bar dataKey="volume" radius={[4, 4, 0, 0]}>
            {data.map((entry) => (
              <Cell key={entry.label} fill={entry.isCurrent ? '#F2C230' : '#2F6FDE'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
