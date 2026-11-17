import { Pencil } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useParams } from 'react-router-dom'
import { CustomExerciseSheet } from '../components/catalog/CustomExerciseSheet'
import { Button, PageHeader, Section, Stat, StatGrid } from '../components/design-system'
import { ExerciseMotion } from '../components/exercises/ExerciseMotion'
import { ExerciseNoteSection } from '../components/exercises/ExerciseNoteSection'
import { StrengthProgressChart } from '../components/stats/StrengthProgressChart'
import { useLiveQuery } from '../lib/liveQuery'
import { exerciseRepository } from '../repositories/exerciseRepository'
import { progressRepository } from '../repositories/progressRepository'
import { estimateOneRmEpley } from '../utils/calculations'
import { formatNumber } from '../utils/format'

const EMPTY = []

function DetailSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true">
      <div className="aspect-[4/3] w-full animate-pulse rounded-2xl bg-gym-card" />
      <div className="h-10 w-3/4 animate-pulse rounded-lg bg-gym-card" />
      <div className="h-4 w-1/2 animate-pulse rounded bg-gym-card" />
    </div>
  )
}

function Fact({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-baseline justify-between gap-4 px-4 py-3">
      <dt className="text-[15px] text-gym-text-muted">{label}</dt>
      <dd className="text-right text-[15px] font-semibold text-gym-text-bright first-letter:uppercase">
        {value}
      </dd>
    </div>
  )
}

export function ExerciseDetailPage() {
  const { i18n } = useTranslation()
  const { id } = useParams()
  // La clave reinicia el estado al cambiar de ejercicio o de idioma.
  return <ExerciseDetail key={`${id}-${i18n.language}`} id={id} />
}

function ExerciseDetail({ id }) {
  const { t, i18n } = useTranslation()
  const [state, setState] = useState({ status: 'loading', exercise: null })
  const [editing, setEditing] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    let cancelled = false
    exerciseRepository
      .getExerciseById(id)
      .then((exercise) => {
        if (!cancelled) setState({ status: exercise ? 'ready' : 'missing', exercise: exercise ?? null })
      })
      .catch(() => {
        if (!cancelled) setState({ status: 'error', exercise: null })
      })
    return () => {
      cancelled = true
    }
  }, [id])

  const history = useLiveQuery(() => progressRepository.getExerciseHistory(id), [id], EMPTY)

  const sessions = useMemo(() => {
    const grouped = new Map()
    for (const set of history) {
      const key = set.entrenamientoId ?? set.fecha
      const current = grouped.get(key)
      if (!current || set.pesoUtilizado > current.pesoUtilizado) grouped.set(key, set)
    }
    return [...grouped.values()].sort((a, b) => +new Date(a.fecha) - +new Date(b.fecha))
  }, [history])

  const chartData = useMemo(
    () =>
      sessions.map((set) => ({
        label: new Date(set.fecha).toLocaleDateString(i18n.language),
        oneRm: estimateOneRmEpley(set.pesoUtilizado, set.repeticionesRealizadas),
        weight: set.pesoUtilizado,
      })),
    [i18n.language, sessions],
  )

  if (state.status === 'loading') return <DetailSkeleton />

  if (state.status !== 'ready') {
    return (
      <div className="space-y-4">
        <PageHeader title={t('catalogPage.title')} back="/catalogo" />
        <p className="rounded-2xl bg-gym-card p-5 text-gym-text-base">
          {state.status === 'missing'
            ? t('exerciseDetail.requestedExerciseNotFound')
            : t('exerciseDetail.exerciseLoadFailed')}
        </p>
      </div>
    )
  }

  const exercise = state.exercise
  const images = exercise.imagenes?.length
    ? exercise.imagenes
    : exercise.imagenUrl
      ? [exercise.imagenUrl]
      : []
  const steps = exercise.pasos?.length
    ? exercise.pasos
    : (exercise.instrucciones ?? '')
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean)
  const isSpanish = i18n.language.startsWith('es')
  const showOriginal = exercise.nombreOriginal && exercise.nombreOriginal !== exercise.nombre
  const secondary = exercise.gruposMuscularesSecundarios ?? []
  const primary = exercise.musculosPrimarios?.length
    ? exercise.musculosPrimarios
    : [exercise.grupoMuscularPrimario]

  const best = sessions.reduce(
    (acc, set) => ({
      weight: Math.max(acc.weight, set.pesoUtilizado),
      oneRm: Math.max(acc.oneRm, estimateOneRmEpley(set.pesoUtilizado, set.repeticionesRealizadas)),
    }),
    { weight: 0, oneRm: 0 },
  )
  const lang = i18n.language

  return (
    <article className="space-y-8">
      <PageHeader
        title={exercise.nombre}
        subtitle={
          exercise.esPersonalizado
            ? t('exerciseDetail.custom')
            : showOriginal
              ? t('exerciseDetail.originalName', { name: exercise.nombreOriginal })
              : undefined
        }
        back="/catalogo"
        action={
          exercise.esPersonalizado ? (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setEditing(true)}
              aria-label={t('customExercise.editTitle')}
            >
              <Pencil size={18} />
            </Button>
          ) : null
        }
      />

      <div className="grid gap-6 md:grid-cols-[1.1fr_1fr] md:items-start">
        <ExerciseMotion images={images} alt={exercise.nombre} />
        <div className="space-y-4">
          {exercise.descripcion && (
            <p className="max-w-[60ch] text-[17px] leading-relaxed text-gym-text-base">
              {exercise.descripcion}
            </p>
          )}
          <dl className="divide-y divide-gym-border overflow-hidden rounded-2xl border border-gym-border bg-gym-card">
            <Fact label={t('exerciseDetail.equipment')} value={exercise.equipoNecesario} />
            <Fact
              label={t('exerciseDetail.level')}
              value={t(`exerciseDetail.levels.${exercise.nivelDificultad}`, {
                defaultValue: exercise.nivelDificultad,
              })}
            />
            <Fact label={t('exerciseDetail.mechanic')} value={exercise.mecanica} />
            <Fact label={t('exerciseDetail.force')} value={exercise.fuerza} />
          </dl>
        </div>
      </div>

      <Section title={t('exerciseDetail.muscles')} id="muscles">
        <div className="flex flex-wrap gap-2">
          {primary.map((muscle) => (
            <span
              key={`p-${muscle}`}
              className="rounded-full bg-gym-text-bright px-3.5 py-1.5 text-[15px] font-semibold text-gym-black first-letter:uppercase"
            >
              {muscle}
            </span>
          ))}
          {secondary.map((muscle) => (
            <span
              key={`s-${muscle}`}
              className="rounded-full border border-gym-border-2 px-3.5 py-1.5 text-[15px] font-semibold text-gym-text-dim first-letter:uppercase"
            >
              {muscle}
            </span>
          ))}
        </div>
        {secondary.length > 0 && (
          <p className="text-sm text-gym-text-muted">{t('exerciseDetail.musclesLegend')}</p>
        )}
      </Section>

      <Section title={t('exerciseDetail.howTo')} id="howto">
        {steps.length === 0 ? (
          <p className="text-gym-text-dim">{t('exerciseDetail.noSteps')}</p>
        ) : (
          <ol className="space-y-5">
            {steps.map((step, index) => (
              <li key={index} className="grid grid-cols-[2.25rem_1fr] gap-3">
                <span className="tabular font-display text-3xl font-black leading-none text-gym-text-muted">
                  {index + 1}
                </span>
                <p className="max-w-[65ch] text-[17px] leading-relaxed text-gym-text-base">{step}</p>
              </li>
            ))}
          </ol>
        )}
        {isSpanish && !exercise.esPersonalizado && steps.length > 0 && (
          <p className="text-sm text-gym-text-muted">
            {exercise.instruccionesTraducidas
              ? t('exerciseDetail.machineTranslated')
              : t('exerciseDetail.notTranslated')}
          </p>
        )}
      </Section>

      <Section title={t('exerciseDetail.history')} id="history">
        {sessions.length === 0 ? (
          <p className="text-gym-text-dim">{t('exerciseDetail.noHistory')}</p>
        ) : (
          <>
            <StatGrid columns={3}>
              <Stat
                label={t('exerciseDetail.bestWeight')}
                value={formatNumber(best.weight, lang)}
                unit="kg"
              />
              <Stat
                label={t('exerciseDetail.progress.oneRm')}
                value={formatNumber(best.oneRm, lang, 0)}
                unit="kg"
              />
              <Stat label={t('exerciseDetail.sessions')} value={sessions.length} />
            </StatGrid>
            {sessions.length > 1 && <StrengthProgressChart data={chartData} />}
          </>
        )}
      </Section>

      <ExerciseNoteSection exerciseId={id} />

      {!exercise.esPersonalizado && (
        <p className="text-sm text-gym-text-muted">{t('exerciseDetail.source')}</p>
      )}

      {editing && (
        <CustomExerciseSheet
          exercise={exercise}
          onClose={() => setEditing(false)}
          onSave={async (values) => {
            await exerciseRepository.updateExercise(exercise.id, {
              ...values,
              updatedAt: new Date().toISOString(),
            })
            setState({ status: 'ready', exercise: { ...exercise, ...values } })
            setEditing(false)
          }}
          onDelete={async () => {
            await exerciseRepository.deleteExercise(exercise.id)
            navigate('/catalogo', { replace: true })
          }}
        />
      )}
    </article>
  )
}
