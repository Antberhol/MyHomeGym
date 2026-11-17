import { calculatePlateDistribution } from '../../utils/plateCalculator'

/*
 * Barra olímpica vista de lado, cargada con discos de competición (código de color IWF).
 * Los discos de 10 a 25 kg comparten diámetro, como en la realidad: se distinguen por color
 * y grosor. Es el único elemento decorativo de la app y siempre representa un dato real.
 */
const PLATE_STYLE = {
  25: { fill: '#E5383B', rim: '#B8392F', height: 96, width: 15 },
  20: { fill: '#2F6FDE', rim: '#2457B3', height: 96, width: 13 },
  15: { fill: '#F2C230', rim: '#C99D1E', height: 96, width: 11 },
  10: { fill: '#2BA36B', rim: '#1F7B50', height: 96, width: 9 },
  5: { fill: '#E9E7E2', rim: '#BDB9B1', height: 58, width: 8 },
  2.5: { fill: '#E5383B', rim: '#B8392F', height: 44, width: 7 },
  1.25: { fill: '#8B9097', rim: '#6B7077', height: 36, width: 6 },
}

const BAR_Y = 60
const SLEEVE_GAP = 6

export function LoadedBarbell({ weight = 0, barWeight = 20, label, className = '' }) {
  const plates = calculatePlateDistribution(weight, barWeight).perSide
  const loadWidth = plates.reduce((sum, plate) => sum + (PLATE_STYLE[plate]?.width ?? 6) + 2, 0)
  const sleeve = Math.max(70, loadWidth + 22)
  const shaft = 150
  const width = shaft + sleeve * 2 + 24
  const shaftStart = 12 + sleeve
  const shaftEnd = shaftStart + shaft

  const renderSide = (side) => {
    let cursor = side === 'left' ? shaftStart - SLEEVE_GAP : shaftEnd + SLEEVE_GAP
    return plates.map((plate, index) => {
      const style = PLATE_STYLE[plate] ?? PLATE_STYLE[1.25]
      const x = side === 'left' ? cursor - style.width : cursor
      cursor = side === 'left' ? cursor - style.width - 2 : cursor + style.width + 2
      return (
        <g key={`${side}-${index}`}>
          <rect
            x={x}
            y={BAR_Y - style.height / 2}
            width={style.width}
            height={style.height}
            rx={3}
            fill={style.fill}
          />
          <rect
            x={x + style.width / 2 - 0.75}
            y={BAR_Y - style.height / 2 + 4}
            width={1.5}
            height={style.height - 8}
            fill={style.rim}
            opacity={0.6}
          />
        </g>
      )
    })
  }

  return (
    <svg
      viewBox={`0 0 ${width} 120`}
      role="img"
      aria-label={label}
      className={`block h-auto w-full ${className}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {/* mangas */}
      <rect x={12} y={BAR_Y - 5} width={sleeve} height={10} rx={2} fill="#8B9097" />
      <rect x={shaftEnd} y={BAR_Y - 5} width={sleeve} height={10} rx={2} fill="#8B9097" />
      {/* barra con moleteado */}
      <rect x={shaftStart} y={BAR_Y - 3} width={shaft} height={6} rx={1} fill="#9C9A95" />
      <rect
        x={shaftStart + 30}
        y={BAR_Y - 3}
        width={shaft - 60}
        height={6}
        fill="url(#knurl)"
        opacity={0.5}
      />
      {/* topes */}
      <rect x={shaftStart - 6} y={BAR_Y - 10} width={6} height={20} rx={1.5} fill="#6B7077" />
      <rect x={shaftEnd} y={BAR_Y - 10} width={6} height={20} rx={1.5} fill="#6B7077" />
      {renderSide('left')}
      {renderSide('right')}
      <defs>
        <pattern id="knurl" width="3" height="3" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="1.2" height="3" fill="#55575B" />
        </pattern>
      </defs>
    </svg>
  )
}
