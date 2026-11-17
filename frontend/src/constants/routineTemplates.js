/**
 * Plantillas de rutina. Los ids de ejercicio son los del catálogo (free-exercise-db);
 * si uno no existe, se omite al crear la rutina.
 */
export const ROUTINE_TEMPLATES = [
  {
    id: 'fullBody3d',
    nameKey: 'routines.templates.items.fullBody3d.name',
    descriptionKey: 'routines.templates.items.fullBody3d.description',
    diasSemana: ['lunes', 'miercoles', 'viernes'],
    color: '#2F6FDE',
    exercises: [
      {
        ejercicioId: 'Barbell_Bench_Press_-_Medium_Grip',
        series: 4,
        repeticiones: '6-10',
        descansoSegundos: 120,
      },
      { ejercicioId: 'Pullups', series: 4, repeticiones: '6-10', descansoSegundos: 120 },
      { ejercicioId: 'Barbell_Squat', series: 4, repeticiones: '5-8', descansoSegundos: 150 },
      { ejercicioId: 'Standing_Military_Press', series: 3, repeticiones: '8-12', descansoSegundos: 90 },
    ],
  },
  {
    id: 'pushPullLegs',
    nameKey: 'routines.templates.items.pushPullLegs.name',
    descriptionKey: 'routines.templates.items.pushPullLegs.description',
    diasSemana: ['lunes', 'martes', 'jueves', 'viernes', 'sabado'],
    color: '#F2C230',
    exercises: [
      {
        ejercicioId: 'Barbell_Bench_Press_-_Medium_Grip',
        series: 4,
        repeticiones: '6-10',
        descansoSegundos: 120,
      },
      { ejercicioId: 'Standing_Military_Press', series: 4, repeticiones: '6-10', descansoSegundos: 120 },
      { ejercicioId: 'EZ-Bar_Skullcrusher', series: 3, repeticiones: '10-14', descansoSegundos: 75 },
      { ejercicioId: 'Pullups', series: 4, repeticiones: '6-10', descansoSegundos: 120 },
      { ejercicioId: 'Bent_Over_Barbell_Row', series: 4, repeticiones: '8-12', descansoSegundos: 105 },
      { ejercicioId: 'Barbell_Curl', series: 3, repeticiones: '10-14', descansoSegundos: 75 },
      { ejercicioId: 'Barbell_Squat', series: 4, repeticiones: '5-8', descansoSegundos: 150 },
      { ejercicioId: 'Barbell_Deadlift', series: 3, repeticiones: '4-6', descansoSegundos: 180 },
      { ejercicioId: 'Barbell_Hip_Thrust', series: 4, repeticiones: '8-12', descansoSegundos: 120 },
    ],
  },
  {
    id: 'upperLower4d',
    nameKey: 'routines.templates.items.upperLower4d.name',
    descriptionKey: 'routines.templates.items.upperLower4d.description',
    diasSemana: ['lunes', 'martes', 'jueves', 'viernes'],
    color: '#2BA36B',
    exercises: [
      {
        ejercicioId: 'Barbell_Bench_Press_-_Medium_Grip',
        series: 4,
        repeticiones: '6-10',
        descansoSegundos: 120,
      },
      { ejercicioId: 'Pullups', series: 4, repeticiones: '6-10', descansoSegundos: 120 },
      { ejercicioId: 'Bent_Over_Barbell_Row', series: 4, repeticiones: '8-12', descansoSegundos: 105 },
      { ejercicioId: 'Standing_Military_Press', series: 3, repeticiones: '8-12', descansoSegundos: 90 },
      { ejercicioId: 'Barbell_Curl', series: 3, repeticiones: '10-14', descansoSegundos: 75 },
      { ejercicioId: 'EZ-Bar_Skullcrusher', series: 3, repeticiones: '10-14', descansoSegundos: 75 },
      { ejercicioId: 'Barbell_Squat', series: 4, repeticiones: '5-8', descansoSegundos: 150 },
      { ejercicioId: 'Barbell_Hip_Thrust', series: 4, repeticiones: '8-12', descansoSegundos: 120 },
    ],
  },
  {
    id: 'fuerza5x5',
    nameKey: 'routines.templates.items.fuerza5x5.name',
    descriptionKey: 'routines.templates.items.fuerza5x5.description',
    diasSemana: ['lunes', 'martes', 'miercoles', 'viernes', 'sabado'],
    color: '#E5383B',
    exercises: [
      { ejercicioId: 'Barbell_Squat', series: 5, repeticiones: '5', descansoSegundos: 180 },
      {
        ejercicioId: 'Barbell_Bench_Press_-_Medium_Grip',
        series: 5,
        repeticiones: '5',
        descansoSegundos: 180,
      },
      { ejercicioId: 'Bent_Over_Barbell_Row', series: 5, repeticiones: '5', descansoSegundos: 150 },
      { ejercicioId: 'Barbell_Deadlift', series: 5, repeticiones: '5', descansoSegundos: 210 },
      { ejercicioId: 'Standing_Military_Press', series: 5, repeticiones: '5', descansoSegundos: 150 },
    ],
  },
]

/** Colores para rutinas y carpetas: los de los discos olímpicos. */
export const ROUTINE_COLORS = ['#E5383B', '#2F6FDE', '#F2C230', '#2BA36B', '#E9E7E2', '#8B9097']
