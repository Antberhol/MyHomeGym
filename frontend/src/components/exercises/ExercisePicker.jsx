import { Check, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Virtuoso } from 'react-virtuoso'
import { MUSCLE_GROUPS } from '../../constants/muscleGroups'
import { normalizeExerciseName } from '../../utils/text'
import { Button, Chips } from '../design-system'
import { Sheet } from '../ui/BottomSheet'
import { ExerciseThumbnail } from './ExerciseThumbnail'

/**
 * Buscador de ejercicios en una hoja: texto + grupo muscular, lista virtual con fotos.
 * Modo simple (`onPick`): un toque añade y cierra. Modo múltiple (`onConfirm`): marca varios.
 */
export function ExercisePicker({ isOpen, onClose, exercises, onPick, onConfirm, selectedIds = [], title }) {
  const { t } = useTranslation()
  const multiple = Boolean(onConfirm)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('all')
  const [picked, setPicked] = useState(selectedIds)

  const filtered = useMemo(() => {
    const query = normalizeExerciseName(search)
    return exercises.filter((exercise) => {
      if (group !== 'all' && exercise.grupoMuscularPrimario !== group) return false
      if (!query) return true
      return (
        normalizeExerciseName(exercise.nombre).includes(query) ||
        normalizeExerciseName(exercise.nombreOriginal ?? '').includes(query)
      )
    })
  }, [exercises, group, search])

  const toggle = (id) =>
    setPicked((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))

  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title={title ?? t('exerciseSelector.title')}
      footer={
        multiple ? (
          <Button fullWidth size="lg" disabled={picked.length === 0} onClick={() => onConfirm(picked)}>
            {t('exercisePicker.addCount', { count: picked.length })}
          </Button>
        ) : null
      }
    >
      <div className="space-y-3">
        <div className="relative">
          <Search
            size={18}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gym-text-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t('exerciseSelector.searchPlaceholder')}
            aria-label={t('exerciseSelector.searchPlaceholder')}
            className="h-12 w-full rounded-xl border border-gym-border pl-11 pr-3 text-[16px]"
          />
        </div>
        <Chips
          scroll
          className="-mx-5 px-5"
          label={t('exercisePicker.group')}
          value={group}
          onChange={setGroup}
          options={[
            { value: 'all', label: t('exerciseSelector.allGroup') },
            ...MUSCLE_GROUPS.map((value) => ({ value, label: t(`muscleGroups.${value}`) })),
          ]}
        />
        <p className="tabular text-sm text-gym-text-muted">
          {t('exercisePicker.results', { count: filtered.length })}
        </p>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-gym-text-muted">{t('exerciseSelector.emptyWithFilters')}</p>
        ) : (
          <div className="h-[52dvh]">
            <Virtuoso
              data={filtered}
              itemContent={(_, exercise) => {
                const isPicked = picked.includes(exercise.id)
                return (
                  <button
                    type="button"
                    onClick={() => (multiple ? toggle(exercise.id) : onPick(exercise))}
                    aria-pressed={multiple ? isPicked : undefined}
                    className="flex w-full items-center gap-3 rounded-xl px-1 py-1.5 text-left hover:bg-gym-card-2"
                  >
                    <ExerciseThumbnail
                      imagenUrl={exercise.imagenUrl}
                      nombre={exercise.nombre}
                      className="h-12 w-12"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-gym-text-bright">
                        {exercise.nombre}
                      </span>
                      <span className="block truncate text-sm text-gym-text-muted">
                        {t(`muscleGroups.${exercise.grupoMuscularPrimario}`, {
                          defaultValue: exercise.grupoMuscularPrimario,
                        })}
                        {exercise.equipoNecesario ? `, ${exercise.equipoNecesario}` : ''}
                      </span>
                    </span>
                    {multiple && (
                      <span
                        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                          isPicked
                            ? 'border-gym-text-bright bg-gym-text-bright text-gym-black'
                            : 'border-gym-border-2'
                        }`}
                        aria-hidden="true"
                      >
                        {isPicked && <Check size={16} strokeWidth={3} />}
                      </span>
                    )}
                  </button>
                )
              }}
            />
          </div>
        )}
      </div>
    </Sheet>
  )
}
