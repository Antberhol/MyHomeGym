import { Plus, StickyNote, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExerciseThumbnail } from '../exercises/ExerciseThumbnail'
import { SetOptionsSheet } from './SetOptionsSheet'
import { SetTable } from './SetTable'

/**
 * Un ejercicio dentro del entreno: cabecera con foto y objetivo, tabla de series y nota.
 * Lo usan igual el entreno guiado y el libre; el libre además puede añadir y quitar series.
 */
export function ExerciseBlock({
  exercise,
  target,
  suggestion,
  rows,
  note,
  onNoteChange,
  onChangeSet,
  onToggleDone,
  onAddSet,
  onRemoveSet,
  onRemoveExercise,
  media,
}) {
  const { t } = useTranslation()
  const [optionsIndex, setOptionsIndex] = useState(null)
  const [noteOpen, setNoteOpen] = useState(Boolean(note))
  const optionsRow = optionsIndex === null ? null : rows[optionsIndex]
  const doneCount = rows.filter((row) => row.done).length

  return (
    <article className="rounded-2xl border border-gym-border bg-gym-card">
      {media}
      <header className="flex items-center gap-3 p-4 pb-3">
        {!media && (
          <ExerciseThumbnail
            imagenUrl={exercise?.imagenUrl}
            nombre={exercise?.nombre}
            className="h-14 w-14"
          />
        )}
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-2xl leading-tight text-gym-text-bright">
            {exercise?.nombre ?? t('training.exercise')}
          </h2>
          <p className="tabular mt-0.5 text-sm text-gym-text-muted">
            {target ? `${target}. ` : ''}
            {t('workout.setsDone', { done: doneCount, total: rows.length })}
          </p>
        </div>
        {onRemoveExercise && (
          <button
            type="button"
            onClick={onRemoveExercise}
            aria-label={t('workout.removeExercise', { name: exercise?.nombre ?? '' })}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gym-text-muted hover:bg-gym-card-2 hover:text-gym-text-bright"
          >
            <Trash2 size={18} />
          </button>
        )}
      </header>

      {suggestion && (
        <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl bg-gym-card-2 px-3 py-2">
          <p className="min-w-0 flex-1 text-sm text-gym-text-dim">{suggestion.text}</p>
          <button
            type="button"
            onClick={suggestion.onApply}
            className="h-9 shrink-0 rounded-lg border border-gym-border-2 px-3 text-sm font-semibold text-gym-text-bright hover:bg-gym-border"
          >
            {suggestion.action}
          </button>
        </div>
      )}

      <div className="px-3">
        <SetTable
          rows={rows}
          onChange={onChangeSet}
          onToggleDone={onToggleDone}
          onOpenOptions={setOptionsIndex}
        />
      </div>

      <div className="flex flex-wrap gap-2 p-3 pt-2">
        {onAddSet && (
          <button
            type="button"
            onClick={onAddSet}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 font-semibold text-gym-text-dim hover:bg-gym-card-2 hover:text-gym-text-bright"
          >
            <Plus size={18} /> {t('workout.addSet')}
          </button>
        )}
        {!noteOpen && (
          <button
            type="button"
            onClick={() => setNoteOpen(true)}
            className="inline-flex h-11 items-center gap-1.5 rounded-xl px-3 font-semibold text-gym-text-dim hover:bg-gym-card-2 hover:text-gym-text-bright"
          >
            <StickyNote size={17} /> {t('workout.addNote')}
          </button>
        )}
      </div>

      {noteOpen && (
        <div className="px-4 pb-4">
          <label className="sr-only" htmlFor={`note-${exercise?.id}`}>
            {t('training.exerciseCard.exerciseNotesLabel')}
          </label>
          <input
            id={`note-${exercise?.id}`}
            value={note ?? ''}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder={t('training.exerciseCard.exerciseNotesPlaceholder')}
            className="h-11 w-full rounded-xl border border-gym-border px-3 text-[15px]"
          />
        </div>
      )}

      <SetOptionsSheet
        open={optionsRow !== null}
        number={(optionsIndex ?? 0) + 1}
        type={optionsRow?.type}
        rpe={optionsRow?.rpe}
        onChange={(field, value) => onChangeSet(optionsIndex, field, value)}
        onRemove={
          onRemoveSet && rows.length > 1
            ? () => {
                onRemoveSet(optionsIndex)
                setOptionsIndex(null)
              }
            : undefined
        }
        onClose={() => setOptionsIndex(null)}
      />
    </article>
  )
}
