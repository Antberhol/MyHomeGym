import { Pencil, Play, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { Button, EmptyState, PageHeader, Section } from '../components/design-system'
import { ExercisePicker } from '../components/exercises/ExercisePicker'
import { RoutineExerciseSheet } from '../components/routines/RoutineExerciseSheet'
import { RoutineFormSheet } from '../components/routines/RoutineFormSheet'
import { SortableExerciseList } from '../components/routines/SortableExerciseList'
import { WeekdayStrip } from '../components/workout/WeekdayStrip'
import { useRoutineData } from '../hooks/useRoutineData'

export function RoutineDetailPage() {
  const { id } = useParams()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { routines, exercises, folders, itemsOf, actions } = useRoutineData()
  const [editing, setEditing] = useState(false)
  const [picking, setPicking] = useState(false)
  const [openItem, setOpenItem] = useState(null)
  const routine = routines.find((item) => item.id === id)
  // Orden recién arrastrado, mientras el servidor lo guarda. Si falla, se vuelve al orden guardado.
  const [pendingOrder, setPendingOrder] = useState(null)
  const saved = itemsOf(id)
  const items = pendingOrder
    ? pendingOrder.map((itemId) => saved.find((item) => item.id === itemId)).filter(Boolean)
    : saved

  const reorder = async (ids) => {
    setPendingOrder(ids)
    try {
      await actions.reorder(ids)
    } finally {
      setPendingOrder(null)
    }
  }

  if (!routine) {
    return (
      <div>
        <PageHeader title={t('routines.title')} back="/rutinas" />
        <EmptyState title={t('routineForm.notFound')} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={routine.nombre}
        subtitle={routine.descripcion}
        back="/rutinas"
        action={
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setEditing(true)}
            aria-label={t('routineForm.editTitle')}
          >
            <Pencil size={18} />
          </Button>
        }
      >
        <div className="space-y-4">
          <WeekdayStrip days={routine.diasSemana} color={routine.color} />
          <Button
            fullWidth
            size="lg"
            disabled={items.length === 0}
            onClick={() => navigate('/entrenar', { state: { startRoutineId: routine.id } })}
          >
            <Play size={20} fill="currentColor" /> {t('routineForm.start')}
          </Button>
        </div>
      </PageHeader>

      <Section
        title={t('routineForm.exercises', { count: items.length })}
        action={
          <Button variant="quiet" size="sm" onClick={() => setPicking(true)}>
            <Plus size={18} /> {t('routineForm.add')}
          </Button>
        }
      >
        {items.length === 0 ? (
          <EmptyState
            title={t('routines.noExercises')}
            action={
              <Button variant="secondary" onClick={() => setPicking(true)}>
                <Plus size={18} /> {t('training.addExercise')}
              </Button>
            }
          />
        ) : (
          <>
            <SortableExerciseList items={items} onOpen={setOpenItem} onReorder={(ids) => void reorder(ids)} />
            <p className="text-sm text-gym-text-muted">{t('routineForm.reorderHint')}</p>
          </>
        )}
      </Section>

      {editing && (
        <RoutineFormSheet
          open
          routine={routine}
          folders={folders}
          onClose={() => setEditing(false)}
          onSave={async (values) => {
            await actions.updateRoutine(routine.id, values)
            setEditing(false)
          }}
          onDelete={async () => {
            await actions.deleteRoutine(routine.id)
            navigate('/rutinas', { replace: true })
          }}
        />
      )}

      {picking && (
        <ExercisePicker
          isOpen
          exercises={exercises}
          selectedIds={[]}
          onClose={() => setPicking(false)}
          onConfirm={async (ids) => {
            await actions.addExercises(routine.id, ids)
            setPicking(false)
          }}
        />
      )}

      {openItem && (
        <RoutineExerciseSheet
          key={openItem.id}
          item={openItem}
          onClose={() => setOpenItem(null)}
          onSave={async (values) => {
            await actions.updateRoutineExercise(openItem.id, values)
            setOpenItem(null)
          }}
          onRemove={async () => {
            await actions.removeRoutineExercise(openItem.id)
            setOpenItem(null)
          }}
        />
      )}
    </div>
  )
}
