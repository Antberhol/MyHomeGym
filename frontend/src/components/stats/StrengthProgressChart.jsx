import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null

  const point = payload[0]?.payload ?? null

  return (
    <div className="bg-gym-card border border-gym-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-gym-text-dim text-xs mb-1">{label}</p>
      <p className="font-bold text-sm text-gym-text-bright">
        1RM: {Number(point?.oneRm ?? 0).toLocaleString()} kg
      </p>
      {typeof point?.weight === 'number' && (
        <p className="text-gym-text-dim text-xs mt-1">{Number(point.weight).toLocaleString()} kg</p>
      )}
    </div>
  )
}

export function StrengthProgressChart({ data }) {
  const { t } = useTranslation()

  const best = useMemo(() => data.reduce((max, p) => Math.max(max, p.oneRm), 0), [data])

  if (data.length < 3) {
    return (
      <div className="bg-gym-card border border-gym-border rounded-xl p-6 text-center">
        <div className="font-display text-gym-text-bright text-2xl font-extrabold">
          {t('progress.strength.notEnoughData.title')}
        </div>
        <p className="mt-2 text-gym-text-dim text-sm">{t('progress.strength.notEnoughData.body')}</p>
      </div>
    )
  }

  return (
    <div className="bg-gym-card border border-gym-border rounded-xl p-4">
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <defs>
              <linearGradient id="oneRmArea" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2F6FDE" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#2F6FDE" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
            <XAxis
              tick={{ fill: '#888888', fontSize: 11 }}
              axisLine={{ stroke: '#2A2A2A' }}
              dataKey="label"
              minTickGap={12}
            />
            <YAxis tick={{ fill: '#888888', fontSize: 11 }} axisLine={{ stroke: '#2A2A2A' }} />
            <Tooltip content={<CustomTooltip />} />
            {best > 0 && <ReferenceLine y={best} stroke="rgba(245,197,24,0.5)" strokeDasharray="6 6" />}
            <Area type="monotone" dataKey="oneRm" stroke="none" fill="url(#oneRmArea)" />
            <Line stroke="#2F6FDE" strokeWidth={2} dataKey="oneRm" dot={{ fill: '#2F6FDE', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
