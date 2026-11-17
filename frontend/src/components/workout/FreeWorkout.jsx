import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, EmptyState } from '../design-system'
import { ExercisePicker } from '../exercises/ExercisePicker'
import { ExerciseBlock } from './ExerciseBlock'

/** Entreno libre: añades ejercicios del catálogo según vas y registras sus series. */
export function FreeWorkout({
  exercises,
  drafts,
  previousSessionByExercise,
  onAddExercise,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onStartRest,
  exerciseNotes,
  onUpdateExerciseNote,
}) {
  const { t } = useTranslation()
  const [pickerOpen, setPickerOpen] = useState(false)
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]))

  return (
    <div className="space-y-4">
      {drafts.length === 0 ? (
        <EmptyState
          title={t('workout.freeEmptyTitle')}
          text={t('workout.freeEmptyText')}
          action={
            <Button onClick={() => setPickerOpen(true)}>
              <Plus size={20} /> {t('training.addExercise')}
            </Button>
          }
        />
      ) : (
        drafts.map((draft) => {
          const previous = previousSessionByExercise[draft.ejercicioId]?.sets ?? []
          const rows = draft.sets.map((set, index) => ({
            key: `${draft.id}-${index}`,
            ...set,
            previous: previous[index]
              ? { peso: previous[index].pesoUtilizado, reps: previous[index].repeticionesRealizadas }
              : null,
          }))
          return (
            <ExerciseBlock
              key={draft.id}
              exercise={byId.get(draft.ejercicioId)}
              rows={rows}
              note={exerciseNotes[draft.ejercicioId]}
              onNoteChange={(note) => onUpdateExerciseNote(draft.ejercicioId, note)}
              onChangeSet={(index, field, value) => onUpdateSet(draft.id, index, field, value)}
              onToggleDone={(index) => {
                const done = !rows[index].done
                onUpdateSet(draft.id, index, 'done', done)
                if (done) onStartRest(90)
              }}
              onAddSet={() => onAddSet(draft.id)}
              onRemoveSet={(index) => onRemoveSet(draft.id, index)}
              onRemoveExercise={() => onRemoveExercise(draft.id)}
            />
          )
        })
      )}

      {drafts.length > 0 && (
        <Button
          variant="secondary"
          fullWidth
          size="lg"
          className="font-body text-base"
          onClick={() => setPickerOpen(true)}
        >
          <Plus size={20} /> {t('training.addExercise')}
        </Button>
      )}

      <ExercisePicker
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        exercises={exercises}
        onPick={(exercise) => {
          onAddExercise(exercise.id)
          setPickerOpen(false)
        }}
      />
    </div>
  )
}
