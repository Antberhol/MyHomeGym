import { Copy, FileSpreadsheet } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { correctSession } from '../../lib/correctSession'
import { formatWorkoutToCSV, formatWorkoutToText } from '../../utils/clipboard'
import { formatLongDate } from '../../utils/format'
import { Button } from '../design-system'
import { Sheet } from '../ui/BottomSheet'

/** Agrupa las series de una sesión por ejercicio, en el orden en que se hicieron. */
function groupSets(sets, nameById, fallback) {
  const groups = new Map()
  for (const set of sets.slice().sort((a, b) => a.serieNumero - b.serieNumero)) {
    if (!groups.has(set.ejercicioId)) {
      groups.set(set.ejercicioId, {
        id: set.ejercicioId,
        name: nameById.get(set.ejercicioId) ?? fallback,
        sets: [],
      })
    }
    groups.get(set.ejercicioId).sets.push(set)
  }
  return Array.from(groups.values())
}

/**
 * Detalle de una sesión pasada: series por ejercicio editables, y copiar para WhatsApp o Excel.
 * Al guardar se recalculan el volumen de la sesión y los récords afectados (RN-4.15).
 */
export function SessionSheet({ session, routineName, nameById, onClose }) {
  const { t, i18n } = useTranslation()
  const [drafts, setDrafts] = useState({})
  const [copied, setCopied] = useState('')
  const [saving, setSaving] = useState(false)

  if (!session) return <Sheet isOpen={false} onClose={onClose} title="" />

  const { training, exercises: sets } = session
  const groups = groupSets(sets, nameById, t('training.exercise'))
  const valueOf = (set, field) =>
    drafts[set.id]?.[field] ?? String(field === 'peso' ? set.pesoUtilizado : set.repeticionesRealizadas)
  const dirty = Object.keys(drafts).length > 0

  const edit = (setId, field, value) =>
    setDrafts((current) => ({ ...current, [setId]: { ...current[setId], [field]: value.replace(',', '.') } }))

  const plain = {
    date: training.fecha,
    routineName,
    durationMinutes: training.duracionMinutos,
    totalVolumeKg: training.volumenTotal,
    exercises: groups.map((group) => ({
      name: group.name,
      sets: group.sets.map((set) => ({
        weight: Number(valueOf(set, 'peso')),
        reps: Number(valueOf(set, 'reps')),
      })),
    })),
  }

  const copy = async (format) => {
    if (!navigator.clipboard) return
    await navigator.clipboard.writeText(
      format === 'text' ? formatWorkoutToText(plain, t, i18n.language) : formatWorkoutToCSV(plain, t),
    )
    setCopied(format)
    window.setTimeout(() => setCopied(''), 2000)
  }

  // Si falla, la hoja sigue abierta con los cambios y el aviso de error sale solo (ErrorToast).
  const save = async () => {
    setSaving(true)
    try {
      await correctSession(training, drafts)
      setDrafts({})
      onClose()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Sheet
      isOpen
      onClose={onClose}
      title={routineName || t('training.freeTraining')}
      footer={
        dirty ? (
          <Button fullWidth size="lg" onClick={save} disabled={saving}>
            {t('common.save')}
          </Button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" onClick={() => void copy('text')}>
              <Copy size={17} /> {copied === 'text' ? t('session.copied') : t('session.copyText')}
            </Button>
            <Button variant="secondary" onClick={() => void copy('csv')}>
              <FileSpreadsheet size={17} /> {copied === 'csv' ? t('session.copied') : t('session.copyCsv')}
            </Button>
          </div>
        )
      }
    >
      <p className="-mt-1 mb-4 text-[15px] text-gym-text-muted">
        {formatLongDate(training.fecha, i18n.language)},{' '}
        {t('session.minutes', { count: training.duracionMinutos })}
      </p>
      {groups.length === 0 ? (
        <p className="text-gym-text-muted">{t('dashboard.recentSessions.editorEmpty')}</p>
      ) : (
        <div className="space-y-5">
          {groups.map((group) => (
            <section key={group.id}>
              <h3 className="mb-2 font-display text-xl text-gym-text-bright">{group.name}</h3>
              <div className="space-y-1.5">
                {group.sets.map((set, index) => (
                  <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2">
                    <span className="tabular text-center font-display text-lg font-extrabold text-gym-text-muted">
                      {set.type === 'warmup' ? 'C' : index + 1}
                    </span>
                    <label className="relative">
                      <span className="sr-only">{t('workout.weightOfSet', { number: index + 1 })}</span>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={valueOf(set, 'peso')}
                        onChange={(event) => edit(set.id, 'peso', event.target.value)}
                        className="tabular h-11 w-full rounded-lg border border-gym-border px-3 pr-9 font-semibold"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gym-text-muted">
                        kg
                      </span>
                    </label>
                    <label className="relative">
                      <span className="sr-only">{t('workout.repsOfSet', { number: index + 1 })}</span>
                      <input
                        type="number"
                        inputMode="numeric"
                        value={valueOf(set, 'reps')}
                        onChange={(event) => edit(set.id, 'reps', event.target.value)}
                        className="tabular h-11 w-full rounded-lg border border-gym-border px-3 pr-12 font-semibold"
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gym-text-muted">
                        {t('workout.reps').toLowerCase()}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </Sheet>
  )
}
