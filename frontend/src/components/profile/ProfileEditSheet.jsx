import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button, Input } from '../design-system'
import { Sheet } from '../ui/BottomSheet'

/** Nombre, peso y altura del perfil. */
export function ProfileEditSheet({ profile, onSave, onClose }) {
  const { t } = useTranslation()
  const [nombre, setNombre] = useState(profile.nombre ?? '')
  const [peso, setPeso] = useState(String(profile.pesoCorporal ?? ''))
  const [altura, setAltura] = useState(String(profile.altura ?? ''))
  const [error, setError] = useState('')

  const submit = async () => {
    const pesoCorporal = Number(peso.replace(',', '.'))
    const alturaCm = Number(altura.replace(',', '.'))
    if (!(pesoCorporal > 0) || !(alturaCm > 0)) {
      setError(t('measurements.profile.invalidData'))
      return
    }
    try {
      await onSave({ nombre: nombre.trim(), pesoCorporal, altura: alturaCm })
    } catch {
      setError(t('measurements.profile.saveFailed'))
    }
  }

  return (
    <Sheet
      isOpen
      onClose={onClose}
      title={t('measurements.profile.formTitle')}
      footer={
        <Button fullWidth size="lg" onClick={submit}>
          {t('common.save')}
        </Button>
      }
    >
      <div className="space-y-4 pb-2">
        <Input label={t('profile.name')} value={nombre} onChange={(event) => setNombre(event.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label={t('profile.weight')}
            inputMode="decimal"
            suffix="kg"
            value={peso}
            onChange={(event) => setPeso(event.target.value)}
          />
          <Input
            label={t('profile.height')}
            inputMode="numeric"
            suffix="cm"
            value={altura}
            onChange={(event) => setAltura(event.target.value)}
          />
        </div>
        {error && <p className="text-[15px] text-gym-danger">{error}</p>}
      </div>
    </Sheet>
  )
}
