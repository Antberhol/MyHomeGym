import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ExerciseThumbnail } from '../exercises/ExerciseThumbnail'

function Row({ item, index, onOpen }) {
  const { t } = useTranslation()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1 bg-gym-card ${isDragging ? 'relative z-10 shadow-xl' : ''}`}
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label={t('routineForm.dragHandle', { name: item.ejercicio?.nombre ?? '' })}
        className="flex h-16 w-10 shrink-0 cursor-grab touch-none items-center justify-center text-gym-text-muted active:cursor-grabbing"
      >
        <GripVertical size={18} />
      </button>
      <button
        type="button"
        onClick={() => onOpen(item)}
        className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pr-4 text-left"
      >
        <ExerciseThumbnail
          imagenUrl={item.ejercicio?.imagenUrl}
          nombre={item.ejercicio?.nombre}
          className="h-12 w-12"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-gym-text-bright">
            {item.ejercicio?.nombre ?? t('sortableExerciseList.exerciseNotFound')}
          </span>
          <span className="tabular block text-sm text-gym-text-muted">
            {t('workout.target', {
              series: item.series,
              reps: item.repeticiones,
              rest: item.descansoSegundos,
            })}
          </span>
        </span>
        <span className="tabular font-display text-lg font-extrabold text-gym-text-muted" aria-hidden="true">
          {index + 1}
        </span>
      </button>
    </li>
  )
}

/** Ejercicios de una rutina: arrastra el asa para reordenar, toca la fila para editar. */
export function SortableExerciseList({ items, onReorder, onOpen }) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 120, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const ids = items.map((item) => item.id)

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={({ active, over }) => {
        if (!over || active.id === over.id) return
        onReorder(arrayMove(ids, ids.indexOf(active.id), ids.indexOf(over.id)))
      }}
    >
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ul className="divide-y divide-gym-border overflow-hidden rounded-2xl border border-gym-border bg-gym-card">
          {items.map((item, index) => (
            <Row key={item.id} item={item} index={index} onOpen={onOpen} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}
