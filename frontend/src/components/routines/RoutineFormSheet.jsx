import { Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ROUTINE_COLORS } from '../../constants/routineTemplates'
import { WEEKDAYS, normalizeWeekday } from '../../utils/weekdays'
import { Button, Chips, Input, Select } from '../design-system'
import { Sheet } from '../ui/BottomSheet'
import { ColorPicker } from './ColorPicker'

function initialState(routine) {
  return {
    nombre: routine?.nombre ?? '',
    descripcion: routine?.descripcion ?? '',
    dias: (routine?.diasSemana ?? []).map(normalizeWeekday).filter(Boolean),
    color: routine?.color ?? ROUTINE_COLORS[1],
    folderId: routine?.folderId ?? '',
    activa: routine?.activa ?? true,
  }
}

/**
 * Crear o editar una rutina. Se monta de nuevo en cada apertura (key en el padre), así que el
 * estado inicial sale de la rutina sin efectos.
 */
export function RoutineFormSheet({ open, routine, folders, onSave, onDelete, onClose }) {
  const { t } = useTranslation()
  const [form, setForm] = useState(() => initialState(routine))
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = (field) => (value) => setForm((current) => ({ ...current, [field]: value }))
  const valid = form.nombre.trim().length >= 2

  const submit = (event) => {
    event?.preventDefault()
    if (!valid) return
    onSave({
      nombre: form.nombre.trim(),
      descripcion: form.descripcion.trim() || undefined,
      diasSemana: WEEKDAYS.filter((day) => form.dias.includes(day)),
      color: form.color,
      folderId: form.folderId || undefined,
      activa: form.activa,
    })
  }

  return (
    <Sheet
      isOpen={open}
      onClose={onClose}
      title={routine ? t('routineForm.editTitle') : t('routines.newRoutine')}
      footer={
        <Button fullWidth size="lg" disabled={!valid} onClick={submit}>
          {routine ? t('common.save') : t('routines.createRoutine')}
        </Button>
      }
    >
      <form onSubmit={submit} className="space-y-5 pb-2">
        <Input
          label={t('routineForm.name')}
          value={form.nombre}
          onChange={(event) => set('nombre')(event.target.value)}
          placeholder={t('routineForm.namePlaceholder')}
          autoFocus={!routine}
          maxLength={80}
        />
        <div className="space-y-1.5">
          <p className="text-sm font-semibold text-gym-text-dim">{t('routineForm.days')}</p>
          <Chips
            multiple
            label={t('routineForm.days')}
            value={form.dias}
            onChange={set('dias')}
            options={WEEKDAYS.map((day) => ({ value: day, label: t(`weekdays.long.${day}`).slice(0, 3) }))}
          />
          <p className="text-sm text-gym-text-muted">{t('routineForm.daysHint')}</p>
        </div>
        <ColorPicker label={t('routineForm.color')} value={form.color} onChange={set('color')} />
        <Input
          label={t('routineForm.description')}
          value={form.descripcion}
          onChange={(event) => set('descripcion')(event.target.value)}
          placeholder={t('routineForm.descriptionPlaceholder')}
          maxLength={200}
        />
        {folders.length > 0 && (
          <Select
            label={t('routineForm.folder')}
            value={form.folderId}
            onChange={(event) => set('folderId')(event.target.value)}
          >
            <option value="">{t('routines.folders.noFolder')}</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.nombre}
              </option>
            ))}
          </Select>
        )}
        {routine && (
          <label className="flex min-h-11 items-center justify-between gap-3">
            <span>
              <span className="block font-semibold text-gym-text-bright">{t('routineForm.active')}</span>
              <span className="block text-sm text-gym-text-muted">{t('routineForm.activeHint')}</span>
            </span>
            <input
              type="checkbox"
              checked={form.activa}
              onChange={(event) => set('activa')(event.target.checked)}
              className="h-6 w-6 accent-[#2BA36B]"
            />
          </label>
        )}
        {routine && onDelete && (
          <div className="border-t border-gym-border pt-4">
            {confirmDelete ? (
              <div className="space-y-2">
                <p className="text-[15px] text-gym-text-dim">{t('routineForm.deleteWarning')}</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="secondary" onClick={() => setConfirmDelete(false)}>
                    {t('common.cancel')}
                  </Button>
                  <Button variant="danger" onClick={onDelete}>
                    {t('routineForm.deleteConfirm')}
                  </Button>
                </div>
              </div>
            ) : (
              <Button variant="danger" fullWidth onClick={() => setConfirmDelete(true)}>
                <Trash2 size={18} /> {t('routineForm.delete')}
              </Button>
            )}
          </div>
        )}
      </form>
    </Sheet>
  )
}
