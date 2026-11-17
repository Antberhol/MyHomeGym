import { MuscleMap } from 'js-rich-body-highlighter/react'
import { figureHighlights, zoneOfFigureGroup } from '../../utils/muscleMap'

/**
 * Figura anatómica de frente o de espaldas, con cada músculo coloreado según su nivel (0-4).
 * La ilustración es de js-rich-body-highlighter (MIT).
 */
export function BodyFigure({ view, levelByZone, onSelectZone, ariaLabel }) {
  return (
    <div role="img" aria-label={ariaLabel} className="mx-auto w-full max-w-[220px]">
      <MuscleMap
        view={view === 'posterior' ? 'back' : 'front'}
        gender="male"
        theme="dark"
        width="100%"
        blendMode="color"
        highlights={figureHighlights(levelByZone)}
        hoverIntensity={30}
        hoverColor="#F4F1EA"
        onMuscleClick={(muscle) => {
          const zone = zoneOfFigureGroup(muscle.group)
          if (zone) onSelectZone?.(zone)
        }}
      />
    </div>
  )
}
