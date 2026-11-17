import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Chips, Input } from '../design-system'
import { Sheet } from '../ui/BottomSheet'
import { NumberStepper } from '../ui/NumberStepper'

const REST_OPTIONS = [60, 90, 120, 150, 180, 240]
const REP_PRESETS = ['5', '6-8', '8-12', '12-15']

/** Series, repeticiones objetivo y descanso de un ejercicio dentro de una rutina. */
export function RoutineExerciseSheet({ item, onSave, onRemove, onClose }) {
  const { t } = useTranslation()
  const [series, setSeries] = useState(item.series)
  const [reps, setReps] = useState(item.repeticiones)
  const [rest, setRest] = useState(item.descansoSegundos)

  return (
    <Sheet
      isOpen
      onClose={onClose}
      title={item.ejercicio?.nombre ?? t('training.exercise')}
      footer={
        <Button
          fullWidth
          size="lg"
          onClick={() =>
            onSave({
              series: Math.max(1, series),
              repeticiones: reps.trim() || '8-12',
              descansoSegundos: rest,
            })
          }
        >
          {t('common.save')}
        </Button>
      }
    >
      <div className="space-y-5 pb-2">
        <NumberStepper label={t('routineForm.series')} value={series} min={1} max={12} onChange={setSeries} />
        <div className="space-y-2">
          <Input
            label={t('routineForm.reps')}
            value={reps}
            onChange={(event) => setReps(event.target.value)}
            hint={t('routineForm.repsHint')}
          />
          <Chips
            label={t('routineForm.reps')}
            value={reps}
            onChange={setReps}
            options={REP_PRESETS.map((value) => ({ value, label: value }))}
          />
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gym-text-dim">{t('routineForm.rest')}</p>
          <Chips
            label={t('routineForm.rest')}
            value={rest}
            onChange={setRest}
            options={REST_OPTIONS.map((value) => ({
              value,
              label:
                value % 60 === 0
                  ? `${value / 60} min`
                  : `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`,
            }))}
          />
        </div>
        <Button variant="danger" fullWidth onClick={onRemove}>
          <Trash2 size={18} /> {t('routineForm.removeExercise')}
        </Button>
      </div>
    </Sheet>
  )
}
