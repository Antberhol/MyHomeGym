import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { PageHeader } from '../components/design-system'
import { PlateCalculatorModal } from '../components/tools/PlateCalculatorModal'
import { FreeWorkout } from '../components/workout/FreeWorkout'
import { GuidedWorkout } from '../components/workout/GuidedWorkout'
import { RestTimerOverlay } from '../components/workout/RestTimerOverlay'
import { RoutineSelector } from '../components/workout/RoutineSelector'
import { WorkoutControls } from '../components/workout/WorkoutControls'
import { WorkoutSummary } from '../components/workout/WorkoutSummary'
import { useActiveWorkoutController } from '../hooks/useActiveWorkoutController'

export function EntrenarPage() {
  const { t } = useTranslation()
  const w = useActiveWorkoutController()
  const { lastSavedMessage, clearLastSavedMessage, startRoutine, view } = w
  const location = useLocation()
  const navigate = useNavigate()
  const startRoutineId = location.state?.startRoutineId

  // Desde el detalle de una rutina se llega con la rutina ya elegida.
  useEffect(() => {
    if (!startRoutineId) return
    if (view === 'selection') startRoutine(startRoutineId)
    navigate('.', { replace: true, state: null })
  }, [navigate, startRoutine, startRoutineId, view])

  useEffect(() => {
    if (!lastSavedMessage) return undefined
    const timeoutId = window.setTimeout(clearLastSavedMessage, 3500)
    return () => window.clearTimeout(timeoutId)
  }, [clearLastSavedMessage, lastSavedMessage])

  const toast = (
    <AnimatePresence>
      {lastSavedMessage ? (
        <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex justify-center px-4">
          <motion.div
            key={lastSavedMessage}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="w-full max-w-md rounded-xl border border-gym-border-2 bg-gym-black px-4 py-3 text-[15px] text-gym-text-bright shadow-xl"
            role="status"
            aria-live="polite"
          >
            {lastSavedMessage}
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  )

  if (w.view === 'selection') {
    return (
      <div>
        {toast}
        <PageHeader title={t('training.pageTitle')} subtitle={t('workout.pickSubtitle')} />
        <RoutineSelector
          routines={w.routines}
          onStartRoutine={w.startRoutine}
          onStartFree={w.startFreeTraining}
        />
      </div>
    )
  }

  if (w.view === 'summary' && w.trainingSummary) {
    return (
      <div>
        <WorkoutSummary
          summary={w.trainingSummary}
          sharePreviewData={w.sharePreviewData}
          onShare={() => void w.onShareSummary()}
          onExit={w.exitToSelection}
        />
      </div>
    )
  }

  const routine = w.routines.find((item) => item.id === w.form.getValues('rutinaId'))
  const guided = w.selectedRoutineExercises.length > 0

  return (
    <div className="pb-24">
      {toast}
      <WorkoutControls
        title={routine?.nombre ?? t('training.freeTraining')}
        sessionSeconds={w.sessionSeconds}
        sessionRunning={w.sessionRunning}
        formatClock={w.formatClock}
        onToggleSession={w.toggleSessionRunning}
        onOpenPlateCalculator={w.openPlateCalculator}
        onFinishWorkout={() => void w.onSubmit()}
        onDiscardWorkout={() => {
          if (window.confirm(t('training.confirmDiscard'))) w.exitToSelection()
        }}
      />

      {guided ? (
        <GuidedWorkout
          routineExercises={w.selectedRoutineExercises}
          activeIndex={w.activeExerciseIndex}
          onSelectIndex={(index) =>
            w.setActiveExerciseIndex(Math.max(0, Math.min(w.selectedRoutineExercises.length - 1, index)))
          }
          previousSessionByExercise={w.previousSessionByExercise}
          suggestedWeight={w.activeExerciseSuggestedWeight}
          getSetValue={w.getSetValue}
          updateSetData={w.updateSetData}
          onApplySuggestedWeight={w.applySuggestedWeight}
          onStartRest={w.startRestTimer}
          exerciseNotes={w.exerciseNotes}
          onUpdateExerciseNote={w.updateExerciseNote}
        />
      ) : (
        <FreeWorkout
          exercises={w.exercises}
          drafts={w.freeExercisesDraft}
          previousSessionByExercise={w.previousSessionByExercise}
          onAddExercise={w.addFreeExerciseDraft}
          onRemoveExercise={w.removeFreeExerciseDraft}
          onAddSet={w.addFreeSet}
          onRemoveSet={w.removeFreeSet}
          onUpdateSet={w.updateFreeSetData}
          onStartRest={w.startRestTimer}
          exerciseNotes={w.exerciseNotes}
          onUpdateExerciseNote={w.updateExerciseNote}
        />
      )}

      <RestTimerOverlay
        restSeconds={w.restSeconds}
        restTotal={w.restTotal}
        formatClock={w.formatClock}
        onAdjust={w.adjustRest}
        onSkip={() => w.setRestSeconds(0)}
      />

      <PlateCalculatorModal
        isOpen={w.isPlateCalculatorOpen}
        onClose={w.closePlateCalculator}
        initialTargetWeight={w.activeExerciseSuggestedWeight ?? 100}
      />
    </div>
  )
}
