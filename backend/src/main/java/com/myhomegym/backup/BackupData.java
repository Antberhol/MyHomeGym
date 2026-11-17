package com.myhomegym.backup;

import java.util.List;

import com.myhomegym.domain.BodyMeasurement;
import com.myhomegym.domain.CustomExercise;
import com.myhomegym.domain.ExerciseNote;
import com.myhomegym.domain.NotificationSettings;
import com.myhomegym.domain.PerformedSet;
import com.myhomegym.domain.PersonalRecord;
import com.myhomegym.domain.Profile;
import com.myhomegym.domain.Routine;
import com.myhomegym.domain.RoutineExercise;
import com.myhomegym.domain.RoutineFolder;
import com.myhomegym.domain.Training;

/**
 * Copia de seguridad completa de un usuario. Los nombres de campo coinciden con el formato
 * de exportación JSON que ya usaba la app, para que los ficheros antiguos se puedan importar.
 */
public record BackupData(
        List<Profile> userProfile,
        List<CustomExercise> ejerciciosCatalogo,
        List<Routine> rutinas,
        List<RoutineFolder> rutinaCarpetas,
        List<RoutineExercise> rutinaEjercicios,
        List<Training> entrenamientosRegistrados,
        List<PerformedSet> ejerciciosRealizados,
        List<BodyMeasurement> medidasCorporalesHistorico,
        List<PersonalRecord> prs,
        List<NotificationSettings> notificationSettings,
        List<ExerciseNote> notasEjercicios) {
}
