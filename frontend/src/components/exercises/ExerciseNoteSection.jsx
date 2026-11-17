import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { exerciseRepository } from '../../repositories/exerciseRepository'
import { Button, Section } from '../design-system'

/** Nota personal del ejercicio. Se guarda en el servidor, así que sirve en cualquier dispositivo. */
export function ExerciseNoteSection({ exerciseId }) {
  const { t } = useTranslation()
  const [text, setText] = useState('')
  const [status, setStatus] = useState('idle')

  useEffect(() => {
    let cancelled = false
    exerciseRepository
      .getNote(exerciseId)
      .then((note) => {
        if (!cancelled) setText(note)
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [exerciseId])

  const save = async () => {
    setStatus('saving')
    try {
      await exerciseRepository.saveNote(exerciseId, text)
      setStatus('saved')
      window.setTimeout(() => setStatus('idle'), 1500)
    } catch {
      setStatus('error')
    }
  }

  return (
    <Section title={t('exerciseDetail.notes.title')} id="notes">
      <textarea
        value={text}
        onChange={(event) => setText(event.target.value)}
        rows={3}
        maxLength={4000}
        placeholder={t('exerciseDetail.notes.placeholder')}
        aria-label={t('exerciseDetail.notes.title')}
        className="w-full rounded-xl border border-gym-border p-3 text-base"
      />
      {status === 'error' && (
        <p className="text-[15px] text-gym-danger" role="alert">
          {t('exerciseDetail.notes.error')}
        </p>
      )}
      <Button variant="secondary" onClick={save} disabled={status === 'saving'}>
        {status === 'saved' ? t('exerciseDetail.notes.saved') : t('exerciseDetail.notes.save')}
      </Button>
    </Section>
  )
}
