import { Play } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { routineRunsOn } from '../../utils/weekdays'
import { Button } from '../design-system'

/** La única llamada a la acción del inicio: qué toca hoy y el botón para empezar. */
export function TodayCard({ routines, trainedToday }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const today = routines.find((routine) => routine.activa !== false && routineRunsOn(routine))

  return (
    <div className="space-y-2">
      <p className="text-[15px] text-gym-text-dim">
        {trainedToday
          ? t('home.trainedToday')
          : today
            ? t('home.todayRoutine', { name: today.nombre })
            : t('home.noRoutineToday')}
      </p>
      <Button fullWidth size="lg" onClick={() => navigate('/entrenar')}>
        <Play size={20} fill="currentColor" />
        {today && !trainedToday
          ? t('home.startRoutine', { name: today.nombre })
          : t('dashboard.startWorkout')}
      </Button>
    </div>
  )
}
