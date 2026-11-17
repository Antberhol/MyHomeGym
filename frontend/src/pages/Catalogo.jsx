import { Plus, Search, SlidersHorizontal } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { CatalogFiltersSheet } from '../components/catalog/CatalogFiltersSheet'
import { CustomExerciseSheet } from '../components/catalog/CustomExerciseSheet'
import { ExerciseGrid } from '../components/catalog/ExerciseGrid'
import { Button, Chips, EmptyState, PageHeader } from '../components/design-system'
import { MUSCLE_GROUPS } from '../constants/muscleGroups'
import { EMPTY_LIST, useLiveQuery } from '../lib/liveQuery'
import { exerciseRepository } from '../repositories/exerciseRepository'
import { normalizeExerciseName } from '../utils/text'

const PAGE = 40
const LEVELS = ['basico', 'intermedio', 'avanzado']

function countBy(items, key) {
  const counts = new Map()
  for (const item of items) counts.set(item[key], (counts.get(item[key]) ?? 0) + 1)
  return counts
}

export function CatalogoPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const exercises = useLiveQuery(() => exerciseRepository.listExercises(), [], EMPTY_LIST)
  const [search, setSearch] = useState('')
  const [group, setGroup] = useState('all')
  const [filters, setFilters] = useState({ equipment: [], level: 'all' })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [visible, setVisible] = useState(PAGE)

  const filtered = useMemo(() => {
    const query = normalizeExerciseName(search)
    return exercises.filter((exercise) => {
      if (group === 'mine' && !exercise.esPersonalizado) return false
      if (group !== 'all' && group !== 'mine' && exercise.grupoMuscularPrimario !== group) return false
      if (filters.equipment.length && !filters.equipment.includes(exercise.equipoNecesario)) return false
      if (filters.level !== 'all' && exercise.nivelDificultad !== filters.level) return false
      if (!query) return true
      return (
        normalizeExerciseName(exercise.nombre).includes(query) ||
        normalizeExerciseName(exercise.nombreOriginal ?? '').includes(query)
      )
    })
  }, [exercises, filters, group, search])

  const equipmentCounts = useMemo(() => countBy(exercises, 'equipoNecesario'), [exercises])
  const levelCounts = useMemo(() => countBy(exercises, 'nivelDificultad'), [exercises])
  const hasCustom = exercises.some((exercise) => exercise.esPersonalizado)
  const activeFilters = filters.equipment.length + (filters.level !== 'all' ? 1 : 0)

  const resetPaging = (fn) => (value) => {
    fn(value)
    setVisible(PAGE)
  }

  return (
    <div>
      <PageHeader
        title={t('catalogPage.title')}
        subtitle={t('catalogPage.subtitle', { count: exercises.length })}
        action={
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCreating(true)}
            aria-label={t('customExercise.newTitle')}
          >
            <Plus size={22} />
          </Button>
        }
      />

      <div className="sticky top-0 z-20 -mx-4 space-y-3 bg-gym-bg-dark/95 px-4 pb-3 pt-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gym-text-muted"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => resetPaging(setSearch)(event.target.value)}
              placeholder={t('exerciseSelector.searchPlaceholder')}
              aria-label={t('exerciseSelector.searchPlaceholder')}
              className="h-12 w-full rounded-xl border border-gym-border pl-11 pr-3 text-[16px]"
            />
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            aria-label={t('catalogPage.filtersCount', { count: activeFilters })}
            className={`relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border ${
              activeFilters
                ? 'border-gym-text-bright text-gym-text-bright'
                : 'border-gym-border text-gym-text-dim'
            }`}
          >
            <SlidersHorizontal size={20} />
            {activeFilters > 0 && (
              <span className="tabular absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gym-text-bright px-1 text-xs font-bold text-gym-black">
                {activeFilters}
              </span>
            )}
          </button>
        </div>
        <Chips
          scroll
          label={t('exercisePicker.group')}
          value={group}
          onChange={resetPaging(setGroup)}
          options={[
            { value: 'all', label: t('exerciseSelector.allGroup') },
            ...(hasCustom ? [{ value: 'mine', label: t('catalogPage.mine') }] : []),
            ...MUSCLE_GROUPS.map((value) => ({ value, label: t(`muscleGroups.${value}`) })),
          ]}
        />
      </div>

      <p className="tabular mb-3 mt-1 text-sm text-gym-text-muted">
        {t('exercisePicker.results', { count: filtered.length })}
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t('catalogPage.emptyTitle')}
          text={t('catalogPage.emptyText')}
          action={
            <Button variant="secondary" onClick={() => setCreating(true)}>
              <Plus size={18} /> {t('customExercise.newTitle')}
            </Button>
          }
        />
      ) : (
        <ExerciseGrid exercises={filtered} visible={visible} onShowMore={() => setVisible((v) => v + PAGE)} />
      )}

      <CatalogFiltersSheet
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        value={filters}
        onChange={resetPaging(setFilters)}
        resultCount={filtered.length}
        equipment={Array.from(equipmentCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .map(([value, count]) => ({ value, label: value, count }))}
        levels={LEVELS.map((value) => ({
          value,
          label: t(`exerciseDetail.levels.${value}`),
          count: levelCounts.get(value) ?? 0,
        }))}
      />

      {creating && (
        <CustomExerciseSheet
          onClose={() => setCreating(false)}
          onSave={async (values) => {
            const id = crypto.randomUUID()
            const now = new Date().toISOString()
            await exerciseRepository.createExercise({
              id,
              ...values,
              descripcion: '',
              gruposMuscularesSecundarios: [],
              esPersonalizado: true,
              createdAt: now,
              updatedAt: now,
            })
            setCreating(false)
            navigate(`/catalogo/${id}`)
          }}
        />
      )}
    </div>
  )
}
