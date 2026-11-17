import { useTranslation } from 'react-i18next'
import { ROUTINE_TEMPLATES } from '../../constants/routineTemplates'
import { Button } from '../design-system'
import { WeekdayStrip } from '../workout/WeekdayStrip'

/** Plantillas listas para usar: una tarjeta por plantilla con sus días y ejercicios. */
export function TemplateList({ onUse, busyId }) {
  const { t } = useTranslation()
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {ROUTINE_TEMPLATES.map((template) => (
        <article
          key={template.id}
          className="flex flex-col rounded-2xl border border-gym-border bg-gym-card p-4"
        >
          <h3 className="font-display text-xl leading-tight text-gym-text-bright">{t(template.nameKey)}</h3>
          <p className="mt-1 flex-1 text-sm text-gym-text-muted">{t(template.descriptionKey)}</p>
          <div className="mt-3">
            <WeekdayStrip days={template.diasSemana} color={template.color} />
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-3"
            disabled={busyId === template.id}
            onClick={() => onUse(template)}
          >
            {t('routineForm.useTemplate', { count: template.exercises.length })}
          </Button>
        </article>
      ))}
    </div>
  )
}
