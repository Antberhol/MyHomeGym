import { Bell, Download, FileText, LogOut, Trash2, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Chips, ListGroup, PageHeader, Section } from '../components/design-system'
import { useLanguage } from '../context/useLanguage'
import {
  exportAllDataJson,
  exportSummaryPdf,
  exportTrainingsCsv,
  importAllDataJson,
  importTrainingsCsv,
} from '../lib/export'
import { useLiveQuery } from '../lib/liveQuery'
import { requestNotificationPermission, sendLocalNotification } from '../lib/notifications'
import { DEFAULT_NOTIFICATION_SETTINGS, settingsRepository } from '../repositories/settingsRepository'
import { useAuthStore } from '../stores/auth-store'

function Toggle({ label, hint, checked, onChange }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-4 px-4 py-3">
      <span>
        <span className="block font-semibold text-gym-text-bright">{label}</span>
        {hint && <span className="block text-sm text-gym-text-muted">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-6 w-6 shrink-0 accent-[#2BA36B]"
      />
    </label>
  )
}

function ActionRow({ icon: Icon, label, hint, onClick, danger }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-gym-card-2"
    >
      <Icon size={20} className={danger ? 'text-gym-danger' : 'text-gym-text-dim'} />
      <span className="min-w-0 flex-1">
        <span className={`block font-semibold ${danger ? 'text-gym-danger' : 'text-gym-text-bright'}`}>
          {label}
        </span>
        {hint && <span className="block text-sm text-gym-text-muted">{hint}</span>}
      </span>
    </button>
  )
}

export function ConfiguracionPage() {
  const { t } = useTranslation()
  const { currentLanguage, changeLanguage } = useLanguage()
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const stored = useLiveQuery(() => settingsRepository.getNotificationSettings(), [])
  const [draft, setDraft] = useState(null)
  const [status, setStatus] = useState('')
  const jsonInput = useRef(null)
  const csvInput = useRef(null)
  const notifications = draft ?? stored ?? DEFAULT_NOTIFICATION_SETTINGS

  const run = async (action, success) => {
    try {
      const result = await action()
      setStatus(typeof success === 'function' ? success(result) : success)
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t('settingsPage.genericError'))
    }
  }

  const updateNotifications = async (changes) => {
    const next = { ...notifications, ...changes }
    setDraft(next)
    await settingsRepository.saveNotificationSettings(next)
  }

  const onFile = (importer, success) => async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (file) await run(() => importer(file), success)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('settings.title')}
        subtitle={t('settingsPage.signedInAs', { name: user?.displayName || user?.username || '' })}
      />

      {status && (
        <p role="status" className="rounded-xl bg-gym-card-2 px-4 py-3 text-[15px] text-gym-text-bright">
          {status}
        </p>
      )}

      <Section title={t('settingsPage.language')}>
        <Chips
          label={t('settingsPage.language')}
          value={currentLanguage}
          onChange={(lang) => void changeLanguage(lang)}
          options={[
            { value: 'es', label: 'Español' },
            { value: 'en', label: 'English' },
          ]}
        />
      </Section>

      <Section title={t('settingsPage.notifications')} description={t('settingsPage.notificationsHint')}>
        <ListGroup>
          <Toggle
            label={t('settingsPage.streakWarning')}
            hint={t('settingsPage.streakWarningHint', { hour: notifications.streakWarningHour })}
            checked={notifications.streakWarningEnabled}
            onChange={(value) => void updateNotifications({ streakWarningEnabled: value })}
          />
          <label className="flex min-h-14 items-center justify-between gap-4 px-4 py-3">
            <span className="font-semibold text-gym-text-bright">{t('settingsPage.streakHour')}</span>
            <select
              value={notifications.streakWarningHour}
              onChange={(event) =>
                void updateNotifications({ streakWarningHour: Number(event.target.value) })
              }
              className="h-11 rounded-lg border border-gym-border px-3"
            >
              {Array.from({ length: 17 }, (_, index) => index + 7).map((hour) => (
                <option key={hour} value={hour}>{`${hour}:00`}</option>
              ))}
            </select>
          </label>
          <Toggle
            label={t('settingsPage.restAlert')}
            hint={t('settingsPage.restAlertHint')}
            checked={notifications.restTimerNotificationEnabled}
            onChange={(value) => void updateNotifications({ restTimerNotificationEnabled: value })}
          />
        </ListGroup>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              void run(
                async () =>
                  (await requestNotificationPermission())
                    ? t('settingsPage.permissionGranted')
                    : t('settingsPage.permissionDenied'),
                (msg) => msg,
              )
            }
          >
            <Bell size={18} /> {t('settingsPage.allow')}
          </Button>
          <Button
            variant="quiet"
            onClick={() =>
              void run(
                () => sendLocalNotification('MyHomeGym', t('settingsPage.testBody')),
                t('settingsPage.testSent'),
              )
            }
          >
            {t('settingsPage.test')}
          </Button>
        </div>
      </Section>

      <Section title={t('settingsPage.data')} description={t('settingsPage.dataHint')}>
        <ListGroup>
          <ActionRow
            icon={Download}
            label={t('settingsPage.exportJson')}
            hint={t('settingsPage.exportJsonHint')}
            onClick={() => void run(exportAllDataJson, t('settingsPage.exported'))}
          />
          <ActionRow
            icon={Upload}
            label={t('settingsPage.importJson')}
            hint={t('settingsPage.importJsonHint')}
            onClick={() => jsonInput.current?.click()}
          />
          <ActionRow
            icon={Download}
            label={t('settingsPage.exportCsv')}
            hint={t('settingsPage.exportCsvHint')}
            onClick={() => void run(exportTrainingsCsv, t('settingsPage.exported'))}
          />
          <ActionRow
            icon={Upload}
            label={t('settingsPage.importCsv')}
            onClick={() => csvInput.current?.click()}
          />
          <ActionRow
            icon={FileText}
            label={t('settingsPage.exportPdf')}
            hint={t('settingsPage.exportPdfHint')}
            onClick={() => void run(exportSummaryPdf, t('settingsPage.exported'))}
          />
        </ListGroup>
        <input
          ref={jsonInput}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={onFile(importAllDataJson, (r) =>
            t('settingsPage.importedJson', { imported: r.imported, skipped: r.skipped }),
          )}
        />
        <input
          ref={csvInput}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={onFile(importTrainingsCsv, (n) => t('settingsPage.importedCsv', { count: n }))}
        />
      </Section>

      <Section title={t('settingsPage.account')}>
        <ListGroup>
          <ActionRow icon={LogOut} label={t('auth.logout')} onClick={() => void logout()} />
          <ActionRow
            icon={Trash2}
            danger
            label={t('settingsPage.deleteAll')}
            hint={t('settingsPage.deleteAllHint')}
            onClick={async () => {
              if (!window.confirm(t('settingsPage.deleteAllConfirm'))) return
              await settingsRepository.clearAllData()
              window.location.reload()
            }}
          />
        </ListGroup>
      </Section>
    </div>
  )
}
