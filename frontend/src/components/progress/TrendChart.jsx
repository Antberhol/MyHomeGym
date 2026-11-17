import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const AXIS = { fill: '#9AA0A6', fontSize: 12 }

function ChartTooltip({ active, payload, label, unit, format }) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-gym-border-2 bg-gym-black px-3 py-2">
      <p className="text-xs text-gym-text-muted">{label}</p>
      <p className="tabular font-semibold text-gym-text-bright">
        {format(payload[0].value)} {unit}
      </p>
    </div>
  )
}

/** Línea de evolución con el estilo de la app: azul de disco sobre grafito. */
export function TrendChart({ data, dataKey, unit, format = (v) => v, height = 220 }) {
  return (
    <div className="rounded-2xl border border-gym-border bg-gym-card px-2 pb-2 pt-4" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ left: 0, right: 12, top: 4, bottom: 0 }}>
          <CartesianGrid stroke="#353940" vertical={false} />
          <XAxis dataKey="label" tick={AXIS} axisLine={false} tickLine={false} minTickGap={16} />
          <YAxis tick={AXIS} axisLine={false} tickLine={false} width={40} domain={['auto', 'auto']} />
          <Tooltip content={<ChartTooltip unit={unit} format={format} />} cursor={{ stroke: '#55575B' }} />
          <Line
            type="monotone"
            dataKey={dataKey}
            stroke="#2F6FDE"
            strokeWidth={2.5}
            dot={{ r: 3, fill: '#2F6FDE' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
