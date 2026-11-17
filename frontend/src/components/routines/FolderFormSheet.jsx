import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ROUTINE_COLORS } from '../../constants/routineTemplates'
import { Button, Input } from '../design-system'
import { Sheet } from '../ui/BottomSheet'
import { ColorPicker } from './ColorPicker'

/** Crear, renombrar o borrar una carpeta. Borrarla no borra sus rutinas: pasan a "Sin carpeta". */
export function FolderFormSheet({ open, folder, onSave, onDelete, onClose }) {
  const { t } = useTranslation()
  const [nombre, setNombre] = useState(folder?.nombre ?? '')
  const [color, setColor] = useState(folder?.color ?? ROUTINE_COLORS[5])

  return (
    <Sheet
      isOpen={open}
      onClose={onClose}
      title={folder ? t('routines.folders.editTitle') : t('routines.folders.newTitle')}
      footer={
        <div className="space-y-2">
          <Button
            fullWidth
            size="lg"
            disabled={!nombre.trim()}
            onClick={() => onSave({ nombre: nombre.trim(), color })}
          >
            {t('common.save')}
          </Button>
          {folder && (
            <Button variant="danger" fullWidth onClick={onDelete}>
              {t('routines.folders.delete')}
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5 pb-2">
        <Input
          label={t('routineForm.name')}
          value={nombre}
          onChange={(event) => setNombre(event.target.value)}
          placeholder={t('routines.folders.namePlaceholder')}
          autoFocus
        />
        <ColorPicker label={t('routines.folders.colorLabel')} value={color} onChange={setColor} />
        {folder && <p className="text-sm text-gym-text-muted">{t('routineForm.folderDeleteHint')}</p>}
      </div>
    </Sheet>
  )
}
