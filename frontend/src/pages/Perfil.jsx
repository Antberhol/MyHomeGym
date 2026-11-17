import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  EmptyState,
  ListGroup,
  PageHeader,
  Section,
  Stat,
  StatGrid,
} from '../components/design-system'
import { MeasurementSheet } from '../components/profile/MeasurementSheet'
import { MEASUREMENT_FIELDS } from '../constants/measurements'
import { ProfileEditSheet } from '../components/profile/ProfileEditSheet'
import { db } from '../lib/db'
import { EMPTY_LIST, useLiveQuery } from '../lib/liveQuery'
import { profileRepository } from '../repositories/profileRepository'
import { progressRepository } from '../repositories/progressRepository'
import { formatNumber, formatShortDate } from '../utils/format'

function imcKey(imc) {
  if (imc < 18.5) return 'underweight'
  if (imc < 25) return 'normal'
  if (imc < 30) return 'overweight'
  return 'obesity'
}

export function PerfilPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const profile = useLiveQuery(() => profileRepository.getProfile(), [])
  const measurements = useLiveQuery(() => progressRepository.listBodyMeasurements(), [], EMPTY_LIST)
  const [editing, setEditing] = useState(false)
  const [measuring, setMeasuring] = useState(false)
  const sorted = measurements.slice().sort((a, b) => +new Date(b.fechaRegistro) - +new Date(a.fechaRegistro))

  if (!profile) {
    return (
      <div>
        <PageHeader title={t('profile.title')} />
        <EmptyState title={t('profile.notFound')} />
      </div>
    )
  }

  const summary = (item) =>
    MEASUREMENT_FIELDS.filter((field) => item[field])
      .map((field) => `${t(`measurements.form.fields.${field}`)} ${formatNumber(item[field], lang)}`)
      .join(', ')

  return (
    <div className="space-y-8">
      <PageHeader
        title={profile.nombre || t('profile.noName')}
        subtitle={t('profilePage.subtitle')}
        action={
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setEditing(true)}
            aria-label={t('measurements.profile.editButton')}
          >
            <Pencil size={18} />
          </Button>
        }
      />

      <StatGrid columns={3}>
        <Stat label={t('profile.weight')} value={formatNumber(profile.pesoCorporal, lang)} unit="kg" />
        <Stat label={t('profile.height')} value={formatNumber(profile.altura, lang, 0)} unit="cm" />
        <Stat
          label={t('profile.imc')}
          value={formatNumber(profile.imc, lang)}
          note={t(`imcStatus.${imcKey(profile.imc)}`)}
        />
      </StatGrid>

      <Section
        title={t('measurements.history.title')}
        action={
          <Button variant="quiet" size="sm" onClick={() => setMeasuring(true)}>
            <Plus size={18} /> {t('profilePage.add')}
          </Button>
        }
      >
        {sorted.length === 0 ? (
          <EmptyState
            title={t('measurements.history.empty')}
            text={t('profilePage.emptyText')}
            action={
              <Button variant="secondary" onClick={() => setMeasuring(true)}>
                {t('measurements.form.sectionTitle')}
              </Button>
            }
          />
        ) : (
          <ListGroup>
            {sorted.map((item) => (
              <div key={item.id} className="flex items-center gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gym-text-bright">
                    <span className="tabular font-display text-xl font-extrabold">
                      {formatNumber(item.pesoCorporal, lang)}
                    </span>{' '}
                    <span className="text-sm text-gym-text-muted">kg</span>
                    <span className="ml-2 text-sm font-normal text-gym-text-muted">
                      {formatShortDate(item.fechaRegistro, lang)}
                    </span>
                  </p>
                  {summary(item) && (
                    <p className="truncate text-sm text-gym-text-muted">{summary(item)} cm</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => void db.deleteBodyMeasurement(item.id)}
                  aria-label={t('profilePage.deleteMeasurement', {
                    date: formatShortDate(item.fechaRegistro, lang),
                  })}
                  className="flex h-11 w-11 items-center justify-center rounded-full text-gym-text-muted hover:bg-gym-card-2 hover:text-gym-text-bright"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </ListGroup>
        )}
      </Section>

      {editing && (
        <ProfileEditSheet
          profile={profile}
          onClose={() => setEditing(false)}
          onSave={async (values) => {
            await profileRepository.updateProfile(values)
            setEditing(false)
          }}
        />
      )}
      {measuring && (
        <MeasurementSheet
          initialWeight={sorted[0]?.pesoCorporal ?? profile.pesoCorporal}
          onClose={() => setMeasuring(false)}
          onSave={async (values) => {
            const meters = profile.altura / 100
            await db.addBodyMeasurement({
              id: crypto.randomUUID(),
              ...values,
              imc: meters > 0 ? values.pesoCorporal / (meters * meters) : 0,
              fechaRegistro: new Date().toISOString(),
            })
            setMeasuring(false)
          }}
        />
      )}
    </div>
  )
}
