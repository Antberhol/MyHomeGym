import { zodResolver } from '@hookform/resolvers/zod'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { finishWorkout } from '../lib/finishWorkout'
import { useLiveQuery } from '../lib/liveQuery'
import { shareWorkoutResult } from '../lib/shareWorkoutResult'
import { routineRepository } from '../repositories/routineRepository'
import { settingsRepository } from '../repositories/settingsRepository'
import { historyByExercise, latestSessionByExercise, muscleDistribution } from '../utils/workoutRules'
import { useAudioFeedback } from './useAudioFeedback'
import { useFreeWorkoutDraft } from './useFreeWorkoutDraft'
import { useHaptic } from './useHaptic'
import { useRoutineSetTable } from './useRoutineSetTable'
import { getPersistedWorkoutSession, usePersistedWorkoutSession } from './usePersistedWorkoutSession'
import { useWorkoutTimer } from './useWorkoutTimer'

const trainingSchema = z.object({
  rutinaId: z.string().optional(),
  duracionMinutos: z.coerce.number().min(1).max(300),
  volumenTotalManual: z.coerce.number().min(0).max(100000).optional(),
  notas: z.string().max(300).optional(),
})

const EMPTY_FORM = { rutinaId: '', duracionMinutos: 45, volumenTotalManual: 0, notas: '' }

function hasSessionInProgress(session) {
  return Boolean(
    session &&
    (session.selectedRoutineId ||
      (session.freeExercisesDraft ?? []).length > 0 ||
      Object.keys(session.setData ?? {}).length > 0 ||
      (session.sessionSeconds ?? 0) > 0 ||
      (session.activeExerciseIndex ?? 0) > 0),
  )
}

/** Orquesta el entreno en curso. Las reglas viven en utils/workoutRules.js; el entreno libre, en useFreeWorkoutDraft. */
export function useActiveWorkoutController() {
  const { t, i18n } = useTranslation()
  useAudioFeedback()
  useHaptic()

  const persistedSession = getPersistedWorkoutSession()

  const routines = useLiveQuery(() => routineRepository.listRoutines(), []) ?? []
  const routineExercisesData = useLiveQuery(() => routineRepository.listRoutineExercises(), [])
  const exercisesData = useLiveQuery(() => routineRepository.listExercises(), [])
  const performedData = useLiveQuery(() => routineRepository.listPerformedExercises(), [])
  const prs = useLiveQuery(() => routineRepository.listPersonalRecords(), []) ?? []
  const notificationSettings = useLiveQuery(() => settingsRepository.getNotificationSettings(), [])

  const exercises = useMemo(() => exercisesData ?? [], [exercisesData])
  const performedExercises = useMemo(() => performedData ?? [], [performedData])

  const [view, setView] = useState(hasSessionInProgress(persistedSession) ? 'active' : 'selection')
  const [lastSavedMessage, setLastSavedMessage] = useState('')
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(
    Math.max(0, persistedSession?.activeExerciseIndex ?? 0),
  )
  const [trainingSummary, setTrainingSummary] = useState(null)
  const [restTotal, setRestTotal] = useState(0)
  const [isPlateCalculatorOpen, setIsPlateCalculatorOpen] = useState(false)
  const [exerciseNotes, setExerciseNotes] = useState({})

  const timer = useWorkoutTimer({
    initialSessionSeconds: persistedSession?.sessionSeconds ?? 0,
    initialSessionRunning: false,
    initialRestSeconds: 0,
    restNotificationsEnabled: notificationSettings?.restTimerNotificationEnabled ?? false,
  })
  const { sessionSeconds, setSessionRunning, restSeconds, setRestSeconds, startRestTimer } = timer

  const form = useForm({
    resolver: zodResolver(trainingSchema),
    defaultValues: { ...EMPTY_FORM, rutinaId: persistedSession?.selectedRoutineId ?? '' },
  })
  const selectedRoutineId = useWatch({ control: form.control, name: 'rutinaId' }) || ''

  // "La última vez" de cada ejercicio: su sesión más reciente antes de ahora (RN-3.03).
  const latestSessions = useMemo(
    () => latestSessionByExercise(performedExercises, new Date().toISOString()),
    [performedExercises],
  )
  const history = useMemo(() => historyByExercise(performedExercises), [performedExercises])

  const free = useFreeWorkoutDraft({
    initialDraft: persistedSession?.freeExercisesDraft ?? [],
    latestSessions,
  })

  useEffect(() => {
    setSessionRunning(view === 'active')
  }, [setSessionRunning, view])

  const selectedRoutineExercises = useMemo(() => {
    if (!selectedRoutineId) return []
    return (routineExercisesData ?? [])
      .filter((item) => item.rutinaId === selectedRoutineId)
      .sort((a, b) => a.orden - b.orden)
      .map((item) => ({ ...item, ejercicio: exercises.find((exercise) => exercise.id === item.ejercicioId) }))
  }, [exercises, routineExercisesData, selectedRoutineId])

  const activeRoutineExercise = selectedRoutineExercises[activeExerciseIndex]
  const table = useRoutineSetTable({
    initialSetData: persistedSession?.setData ?? {},
    routineExercises: selectedRoutineExercises,
    activeRoutineExercise,
    latestSessions,
    history,
    prs,
  })

  const { clearSession } = usePersistedWorkoutSession({
    selectedRoutineId,
    setData: table.setData,
    sessionSeconds,
    activeExerciseIndex,
    freeExercisesDraft: free.drafts,
  })

  const nameOf = (exerciseId) =>
    exercises.find((exercise) => exercise.id === exerciseId)?.nombre || t('training.exercise')

  const applySessionTimeToDuration = () => {
    form.setValue('duracionMinutos', Math.max(1, Math.ceil(sessionSeconds / 60)))
  }

  const start = (routineId) => {
    form.setValue('rutinaId', routineId)
    setTrainingSummary(null)
    setLastSavedMessage('')
    setActiveExerciseIndex(0)
    setView('active')
  }

  const resetSession = () => {
    table.clear()
    free.reset()
    setExerciseNotes({})
    setActiveExerciseIndex(0)
    clearSession()
  }

  const exitToSelection = () => {
    resetSession()
    setTrainingSummary(null)
    setLastSavedMessage('')
    form.reset(EMPTY_FORM)
    timer.resetTimers()
    setSessionRunning(false)
    setView('selection')
  }

  const clearLastSavedMessage = useCallback(() => setLastSavedMessage(''), [setLastSavedMessage])

  const onSubmit = form.handleSubmit(async (values) => {
    setSessionRunning(false)
    // La duración sale del cronómetro salvo que la hayas escrito a mano (RN-3.04).
    const durationMinutes = form.getFieldState('duracionMinutos').isDirty
      ? Number(values.duracionMinutos)
      : Math.max(1, Math.round(sessionSeconds / 60))
    let summary
    try {
      summary = await finishWorkout({
        routineId: values.rutinaId,
        durationMinutes,
        notes: values.notas,
        manualVolume: values.volumenTotalManual,
        routineExercises: selectedRoutineExercises,
        readRoutineSet: table.getSetValue,
        freeDrafts: free.drafts,
        exerciseNotes,
        nameOf,
      })
    } catch {
      // No se ha guardado nada (la operación es atómica). El entreno sigue abierto para reintentarlo.
      setSessionRunning(true)
      setLastSavedMessage(t('training.feedback.saveFailed'))
      return
    }
    setTrainingSummary(summary)
    setLastSavedMessage(
      t('training.feedback.saved', {
        sets: summary.setCount,
        volumeKg: summary.totalVolume.toFixed(0),
        prs: summary.prsCreated,
      }),
    )
    resetSession()
    setRestSeconds(0)
    setView('summary')
  })

  const sharePreviewData = useMemo(() => {
    if (!trainingSummary) return null
    const groupOf = (exerciseId) =>
      exercises.find((exercise) => exercise.id === exerciseId)?.grupoMuscularPrimario
    return {
      totalVolume: trainingSummary.totalVolume,
      durationMinutes: trainingSummary.durationMinutes,
      prsCreated: trainingSummary.prsCreated,
      setCount: trainingSummary.setCount,
      dateLabel: new Date().toLocaleDateString(i18n.language, {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }),
      muscleDistribution: muscleDistribution(trainingSummary.performed, groupOf),
      topExercises: trainingSummary.byExercise,
    }
  }, [exercises, i18n.language, trainingSummary])

  const onShareSummary = async () => {
    if (!sharePreviewData) return
    try {
      const status = await shareWorkoutResult(sharePreviewData)
      setLastSavedMessage(
        status === 'shared' ? t('training.feedback.shareSuccess') : t('training.feedback.shareDownloaded'),
      )
    } catch {
      setLastSavedMessage(t('training.feedback.shareFailed'))
    }
  }

  const startRest = (seconds) => {
    setRestTotal(seconds)
    startRestTimer(seconds)
  }

  const adjustRest = (delta) => {
    const next = Math.max(0, restSeconds + delta)
    setRestTotal((total) => Math.max(total, next))
    setRestSeconds(next)
  }

  return {
    form,
    view,
    routines,
    exercises,
    selectedRoutineExercises,
    activeRoutineExercise,
    activeExerciseIndex,
    previousSessionByExercise: latestSessions,
    activeExerciseHistory: table.activeExerciseHistory,
    activeExerciseSuggestedWeight: table.activeExerciseSuggestedWeight,
    activeExercisePrTarget: table.activeExercisePrTarget,
    setData: table.setData,
    exerciseNotes,
    freeExerciseId: free.exerciseId,
    freeSeriesCount: free.seriesCount,
    freeExercisesDraft: free.drafts,
    trainingSummary,
    lastSavedMessage,
    clearLastSavedMessage,
    sharePreviewData,
    sessionSeconds,
    sessionRunning: timer.sessionRunning,
    restSeconds,
    restTotal,
    adjustRest,
    formatClock: timer.formatClock,
    isPlateCalculatorOpen,
    startRoutine: start,
    startFreeTraining: () => start(''),
    exitToSelection,
    applySessionTimeToDuration,
    toggleSessionRunning: timer.toggleSessionRunning,
    startRestTimer: startRest,
    setRestSeconds,
    onSubmit,
    onShareSummary,
    getSetValue: table.getSetValue,
    updateSetData: table.updateSetData,
    applySuggestedWeight: table.applySuggestedWeight,
    setActiveExerciseIndex,
    setFreeExerciseId: free.setExerciseId,
    setFreeSeriesCount: free.setSeriesCount,
    addFreeExerciseDraft: free.addExercise,
    addFreeSet: free.addSet,
    removeFreeExerciseDraft: free.removeExercise,
    moveFreeExerciseDraft: free.moveExercise,
    removeFreeSet: free.removeSet,
    updateFreeSetData: free.updateSet,
    updateExerciseNote: (exerciseId, note) =>
      setExerciseNotes((current) => ({ ...current, [exerciseId]: note })),
    openPlateCalculator: () => setIsPlateCalculatorOpen(true),
    closePlateCalculator: () => setIsPlateCalculatorOpen(false),
  }
}
