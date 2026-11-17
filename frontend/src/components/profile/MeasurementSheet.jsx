import { useState } from 'react'
import { MEASUREMENT_FIELDS } from '../../constants/measurements'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '../design-system'
import { Sheet } from '../ui/BottomSheet'

function parse(value) {
  const text = value.trim().replace(',', '.')
  if (!text) return undefined
  const number = Number(text)
  return Number.isFinite(number) && number > 0 ? number : null
}

/** Nueva medición: el peso es obligatorio; los perímetros, opcionales. */
export function MeasurementSheet({ initialWeight, onSave, onClose }) {
  const { t } = useTranslation()
  const [values, setValues] = useState({ pesoCorporal: initialWeight ? String(initialWeight) : '' })
  const [error, setError] = useState('')

  const submit = async () => {
    const pesoCorporal = parse(values.pesoCorporal ?? '')
    if (!pesoCorporal) {
      setError(t('measurements.form.invalidWeight'))
      return
    }
    const extra = Object.fromEntries(MEASUREMENT_FIELDS.map((field) => [field, parse(values[field] ?? '')]))
    if (Object.values(extra).some((value) => value === null)) {
      setError(t('measurements.form.invalidOptionalValues'))
      return
    }
    try {
      await onSave({ pesoCorporal, ...extra })
    } catch {
      setError(t('measurements.form.saveFailed'))
    }
  }

  const field = (name, unit) => (
    <Input
      key={name}
      label={t(`measurements.form.fields.${name}`)}
      inputMode="decimal"
      suffix={unit}
      value={values[name] ?? ''}
      onChange={(event) => setValues((current) => ({ ...current, [name]: event.target.value }))}
    />
  )

  return (
    <Sheet
      isOpen
      onClose={onClose}
      title={t('measurements.form.sectionTitle')}
      footer={
        <Button fullWidth size="lg" onClick={submit}>
          {t('measurements.form.submitButton')}
        </Button>
      }
    >
      <div className="space-y-4 pb-2">
        {field('pesoCorporal', 'kg')}
        <p className="text-sm text-gym-text-muted">{t('profilePage.optionalHint')}</p>
        <div className="grid grid-cols-2 gap-3">{MEASUREMENT_FIELDS.map((name) => field(name, 'cm'))}</div>
        {error && <p className="text-[15px] text-gym-danger">{error}</p>}
      </div>
    </Sheet>
  )
}
