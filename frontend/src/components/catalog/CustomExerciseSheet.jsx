import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { MUSCLE_GROUPS } from '../../constants/muscleGroups'
import { Button, Chips, Input, Textarea } from '../design-system'
import { Sheet } from '../ui/BottomSheet'

const LEVELS = ['basico', 'intermedio', 'avanzado']

/** Crear o editar un ejercicio propio (los del catálogo no se editan). */
export function CustomExerciseSheet({ exercise, onSave, onDelete, onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({
    nombre: exercise?.nombre ?? '',
    grupoMuscularPrimario: exercise?.grupoMuscularPrimario ?? 'pecho',
    equipoNecesario: exercise?.equipoNecesario ?? '',
    nivelDificultad: exercise?.nivelDificultad ?? 'basico',
    instrucciones: exercise?.instrucciones ?? '',
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))
  const valid = form.nombre.trim().length >= 2

  return (
    <Sheet
      isOpen
      onClose={onClose}
      title={exercise ? t('customExercise.editTitle') : t('customExercise.newTitle')}
      footer={
        <Button
          fullWidth
          size="lg"
          disabled={!valid}
          onClick={() => onSave({ ...form, nombre: form.nombre.trim() })}
        >
          {t('common.save')}
        </Button>
      }
    >
      <div className="space-y-5 pb-2">
        <Input
          label={t('routineForm.name')}
          value={form.nombre}
          onChange={(event) => set('nombre')(event.target.value)}
          placeholder={t('customExercise.namePlaceholder')}
          autoFocus={!exercise}
        />
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-gym-text-dim">{t('customExercise.group')}</p>
          <Chips
            label={t('customExercise.group')}
            value={form.grupoMuscularPrimario}
            onChange={set('grupoMuscularPrimario')}
            options={MUSCLE_GROUPS.map((value) => ({ value, label: t(`muscleGroups.${value}`) }))}
          />
        </div>
        <Input
          label={t('customExercise.equipment')}
          value={form.equipoNecesario}
          onChange={(event) => set('equipoNecesario')(event.target.value)}
          placeholder={t('customExercise.equipmentPlaceholder')}
        />
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-gym-text-dim">{t('exerciseDetail.level')}</p>
          <Chips
            label={t('exerciseDetail.level')}
            value={form.nivelDificultad}
            onChange={set('nivelDificultad')}
            options={LEVELS.map((value) => ({ value, label: t(`exerciseDetail.levels.${value}`) }))}
          />
        </div>
        <Textarea
          label={t('customExercise.instructions')}
          value={form.instrucciones}
          onChange={(event) => set('instrucciones')(event.target.value)}
          placeholder={t('customExercise.instructionsPlaceholder')}
          rows={4}
        />
        {exercise && onDelete && (
          <div className="border-t border-gym-border pt-4">
            {confirmDelete ? (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                  {t('common.cancel')}
                </Button>
                <Button variant="danger" onClick={onDelete}>
                  {t('routineForm.deleteConfirm')}
                </Button>
              </div>
            ) : (
              <Button variant="danger" fullWidth onClick={() => setConfirmDelete(true)}>
                <Trash2 size={18} /> {t('customExercise.delete')}
              </Button>
            )}
          </div>
        )}
      </div>
    </Sheet>
  )
}
