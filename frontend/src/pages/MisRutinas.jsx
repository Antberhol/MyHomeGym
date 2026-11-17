import { FolderPlus, Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button, EmptyState, PageHeader, Section } from '../components/design-system'
import { FolderFormSheet } from '../components/routines/FolderFormSheet'
import { RoutineCard } from '../components/routines/RoutineCard'
import { RoutineFormSheet } from '../components/routines/RoutineFormSheet'
import { TemplateList } from '../components/routines/TemplateList'
import { useRoutineData } from '../hooks/useRoutineData'

export function MisRutinasPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { routines, routineExercises, folders, actions } = useRoutineData()
  const [creating, setCreating] = useState(false)
  const [folderSheet, setFolderSheet] = useState(null)
  const [busyTemplate, setBusyTemplate] = useState('')

  const countFor = (id) => routineExercises.filter((item) => item.rutinaId === id).length
  const folderIds = new Set(folders.map((folder) => folder.id))
  const loose = routines.filter((routine) => !routine.folderId || !folderIds.has(routine.folderId))

  const applyTemplate = async (template) => {
    setBusyTemplate(template.id)
    const id = await actions.createFromTemplate(template, t)
    setBusyTemplate('')
    navigate(`/rutinas/${id}`)
  }

  const list = (items) => (
    <div className="space-y-3">
      {items.map((routine) => (
        <RoutineCard key={routine.id} routine={routine} exerciseCount={countFor(routine.id)} />
      ))}
    </div>
  )

  return (
    <div className="space-y-8">
      <PageHeader
        title={t('routines.title')}
        subtitle={t('routineForm.subtitle', { count: routines.length })}
        action={
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setCreating(true)}
            aria-label={t('routines.newRoutine')}
          >
            <Plus size={22} />
          </Button>
        }
      />

      {routines.length === 0 ? (
        <EmptyState
          title={t('routineForm.emptyTitle')}
          text={t('routineForm.emptyText')}
          action={
            <Button onClick={() => setCreating(true)}>
              <Plus size={20} /> {t('routines.newRoutine')}
            </Button>
          }
        />
      ) : (
        <>
          {folders.map((folder) => {
            const items = routines.filter((routine) => routine.folderId === folder.id)
            return (
              <Section
                key={folder.id}
                title={
                  <span className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: folder.color }}
                      aria-hidden="true"
                    />
                    {folder.nombre}
                  </span>
                }
                action={
                  <Button variant="quiet" size="sm" onClick={() => setFolderSheet(folder)}>
                    {t('common.edit')}
                  </Button>
                }
              >
                {items.length ? (
                  list(items)
                ) : (
                  <p className="text-gym-text-muted">{t('routineForm.folderEmpty')}</p>
                )}
              </Section>
            )
          })}
          {loose.length > 0 && (
            <Section title={folders.length ? t('routineForm.noFolderTitle') : undefined}>
              {list(loose)}
            </Section>
          )}
        </>
      )}

      <Section title={t('routines.templates.title')} description={t('routines.templates.description')}>
        <TemplateList onUse={(template) => void applyTemplate(template)} busyId={busyTemplate} />
      </Section>

      <Button variant="quiet" onClick={() => setFolderSheet({})}>
        <FolderPlus size={18} /> {t('routines.folders.newTitle')}
      </Button>

      {creating && (
        <RoutineFormSheet
          open
          folders={folders}
          onClose={() => setCreating(false)}
          onSave={async (values) => {
            const id = await actions.createRoutine(values)
            setCreating(false)
            navigate(`/rutinas/${id}`)
          }}
        />
      )}
      {folderSheet && (
        <FolderFormSheet
          open
          folder={folderSheet.id ? folderSheet : null}
          onClose={() => setFolderSheet(null)}
          onSave={async (values) => {
            if (folderSheet.id) await actions.updateFolder(folderSheet.id, values)
            else await actions.createFolder(values)
            setFolderSheet(null)
          }}
          onDelete={async () => {
            await actions.deleteFolder(folderSheet.id)
            setFolderSheet(null)
          }}
        />
      )}
    </div>
  )
}
