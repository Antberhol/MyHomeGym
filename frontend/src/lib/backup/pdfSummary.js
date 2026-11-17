import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import i18n from '../../i18n'
import { db } from '../db'
import { SESSION_RECORD_EXERCISE, weightOfRepsRecord } from '../prs'
import { today } from './download'

const newestFirst = (dateOf) => (a, b) => +new Date(dateOf(b)) - +new Date(dateOf(a))
const fixed = (value, digits) => (typeof value === 'number' ? value.toFixed(digits) : '-')

/**
 * Contenido del resumen, ya traducido y con formato: una lista de secciones {title, head, rows}.
 * Función pura (no dibuja nada) para poder probarla. Los datos que faltan salen como "-".
 */
export function buildSummary({ profile, trainings, prs, measurements, exercises, routines }, t, lang) {
  const date = (iso) => new Date(iso).toLocaleDateString(lang)
  const number = (value) => Number(value ?? 0).toLocaleString(lang, { maximumFractionDigits: 1 })
  const kg = (value) => `${number(value)} kg`
  const cm = (value) => (value ? `${number(value)} cm` : '-')
  const exerciseName = new Map(exercises.map((exercise) => [exercise.id, exercise.nombre]))
  const exercisePrs = prs.filter((pr) => pr.ejercicioId !== SESSION_RECORD_EXERCISE)
  const totalMinutes = trainings.reduce((sum, training) => sum + (training.duracionMinutos ?? 0), 0)
  const totalVolume = trainings.reduce((sum, training) => sum + (training.volumenTotal ?? 0), 0)
  const sections = []

  if (profile) {
    sections.push({
      title: t('pdf.profile'),
      rows: [
        [t('pdf.name'), profile.nombre || t('pdf.noName')],
        [t('pdf.weight'), kg(profile.pesoCorporal)],
        [t('pdf.height'), cm(profile.altura)],
        [t('pdf.bmi'), fixed(profile.imc, 1)],
      ],
    })
  }

  sections.push({
    title: t('pdf.stats'),
    rows: [
      [t('pdf.totalTrainings'), String(trainings.length)],
      [t('pdf.totalTime'), t('pdf.hours', { count: Math.round(totalMinutes / 60) })],
      [t('pdf.totalVolume'), kg(totalVolume)],
      [t('pdf.records'), String(exercisePrs.length)],
      // Una rutina está activa salvo que se haya puesto en pausa (RN-2.04).
      [t('pdf.activeRoutines'), String(routines.filter((routine) => routine.activa !== false).length)],
    ],
  })

  if (trainings.length > 0) {
    sections.push({
      title: t('pdf.recentTrainings'),
      head: [t('pdf.date'), t('pdf.duration'), t('pdf.volume'), t('pdf.notes')],
      rows: trainings
        .slice()
        .sort(newestFirst((training) => training.fecha))
        .slice(0, 10)
        .map((training) => [
          date(training.fecha),
          `${number(training.duracionMinutos)} min`,
          kg(training.volumenTotal),
          training.notas || '-',
        ]),
    })
  }

  if (exercisePrs.length > 0) {
    sections.push({
      title: t('pdf.records'),
      head: [t('pdf.exercise'), t('pdf.type'), t('pdf.value'), t('pdf.date')],
      rows: exercisePrs
        .slice()
        .sort(newestFirst((pr) => pr.fecha))
        .slice(0, 15)
        .map((pr) => [
          exerciseName.get(pr.ejercicioId) ?? t('pdf.unknownExercise'),
          t(`progressPage.types.${pr.tipo}`),
          pr.tipo === 'reps_mismo_peso'
            ? `${pr.valor} ${t('progressPage.repsAt', { weight: number(weightOfRepsRecord(pr)) })}`
            : kg(pr.valor),
          date(pr.fecha),
        ]),
    })
  }

  if (measurements.length > 0) {
    sections.push({
      title: t('pdf.measurements'),
      head: [t('pdf.date'), t('pdf.weight'), t('pdf.bmi'), t('pdf.waist'), t('pdf.chest')],
      rows: measurements
        .slice()
        .sort(newestFirst((item) => item.fechaRegistro))
        .slice(0, 10)
        .map((item) => [
          date(item.fechaRegistro),
          kg(item.pesoCorporal),
          fixed(item.imc, 1),
          cm(item.cintura),
          cm(item.pecho),
        ]),
    })
  }

  return sections
}

/** Resumen imprimible en el idioma de la app: perfil, estadísticas, entrenos, récords y mediciones. */
export async function exportSummaryPdf() {
  const [profiles, trainings, prs, measurements, exercises, routines] = await Promise.all([
    db.getAllUserProfiles(),
    db.getAllTrainings(),
    db.getAllPersonalRecords(),
    db.getAllBodyMeasurements(),
    db.getAllExercisesCatalog(),
    db.getAllRoutines(),
  ])
  const t = i18n.t.bind(i18n)
  const lang = i18n.language
  const sections = buildSummary(
    { profile: profiles[0], trainings, prs, measurements, exercises, routines },
    t,
    lang,
  )

  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()

  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(t('pdf.title'), pageWidth / 2, 20, { align: 'center' })
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(t('pdf.generatedOn', { date: new Date().toLocaleDateString(lang) }), pageWidth / 2, 28, {
    align: 'center',
  })

  let y = 42
  for (const section of sections) {
    if (y > pageHeight - 50) {
      doc.addPage()
      y = 20
    }
    doc.setFontSize(14)
    doc.setFont('helvetica', 'bold')
    doc.text(section.title, 14, y)
    autoTable(doc, {
      startY: y + 4,
      head: section.head ? [section.head] : [],
      body: section.rows,
      theme: section.head ? 'striped' : 'plain',
      styles: { fontSize: section.head ? 9 : 10 },
      headStyles: { fillColor: [112, 96, 224] },
      columnStyles: section.head ? {} : { 0: { fontStyle: 'bold', cellWidth: 60 } },
    })
    y = doc.lastAutoTable.finalY + 12
  }

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(t('pdf.page', { page, total: pageCount }), pageWidth / 2, pageHeight - 10, { align: 'center' })
  }

  doc.save(`myhomegym-summary-${today()}.pdf`)
}
