package com.myhomegym.backup;

import java.util.List;
import java.util.Set;
import java.util.function.Consumer;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.myhomegym.common.OwnedEntity;
import com.myhomegym.common.OwnedRepository;
import com.myhomegym.domain.BodyMeasurementRepository;
import com.myhomegym.domain.CustomExercise;
import com.myhomegym.domain.CustomExerciseRepository;
import com.myhomegym.domain.ExerciseNoteRepository;
import com.myhomegym.domain.NotificationSettingsRepository;
import com.myhomegym.domain.PerformedSetRepository;
import com.myhomegym.domain.PersonalRecordRepository;
import com.myhomegym.domain.ProfileRepository;
import com.myhomegym.domain.RoutineExerciseRepository;
import com.myhomegym.domain.RoutineFolderRepository;
import com.myhomegym.domain.RoutineRepository;
import com.myhomegym.domain.TrainingRepository;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;

@Service
public class BackupService {

    private final ProfileRepository profiles;
    private final CustomExerciseRepository exercises;
    private final RoutineRepository routines;
    private final RoutineFolderRepository folders;
    private final RoutineExerciseRepository routineExercises;
    private final TrainingRepository trainings;
    private final PerformedSetRepository sets;
    private final BodyMeasurementRepository measurements;
    private final PersonalRecordRepository records;
    private final NotificationSettingsRepository settings;
    private final ExerciseNoteRepository notes;
    private final Validator validator;

    public BackupService(ProfileRepository profiles, CustomExerciseRepository exercises, RoutineRepository routines,
            RoutineFolderRepository folders, RoutineExerciseRepository routineExercises, TrainingRepository trainings,
            PerformedSetRepository sets, BodyMeasurementRepository measurements, PersonalRecordRepository records,
            NotificationSettingsRepository settings, ExerciseNoteRepository notes, Validator validator) {
        this.profiles = profiles;
        this.exercises = exercises;
        this.routines = routines;
        this.folders = folders;
        this.routineExercises = routineExercises;
        this.trainings = trainings;
        this.sets = sets;
        this.measurements = measurements;
        this.records = records;
        this.settings = settings;
        this.notes = notes;
        this.validator = validator;
    }

    @Transactional(readOnly = true)
    public BackupData export(Long ownerId) {
        return new BackupData(
                profiles.findAllByOwnerId(ownerId),
                exercises.findAllByOwnerId(ownerId),
                routines.findAllByOwnerId(ownerId),
                folders.findAllByOwnerId(ownerId),
                routineExercises.findAllByOwnerId(ownerId),
                trainings.findAllByOwnerId(ownerId),
                sets.findAllByOwnerId(ownerId),
                measurements.findAllByOwnerId(ownerId),
                records.findAllByOwnerId(ownerId),
                settings.findById(ownerId).map(List::of).orElse(List.of()),
                notes.findAllByOwnerId(ownerId));
    }

    /** Resultado de fusionar una copia: cuántos registros se han añadido y cuántos ya existían. */
    public record MergeResult(int imported, int skipped) {
    }

    /** Sustituye todos los datos del usuario por los de la copia. Si un registro no es válido, no se cambia nada. */
    @Transactional
    public void replaceAll(Long ownerId, BackupData data) {
        clearAll(ownerId);
        addMissing(ownerId, data);
        if (data.notificationSettings() != null && !data.notificationSettings().isEmpty()) {
            var s = data.notificationSettings().get(0);
            s.setOwnerId(ownerId);
            settings.save(s);
        }
    }

    /**
     * Añade a la cuenta lo que falta de la copia, sin borrar nada: los registros cuyo id ya existe se
     * saltan. El perfil es la excepción: se sustituye por el de la copia. Todo ocurre en una transacción:
     * si un registro no es válido, no se añade ninguno.
     */
    @Transactional
    public MergeResult merge(Long ownerId, BackupData data) {
        if (data.userProfile() != null && !data.userProfile().isEmpty()) {
            profiles.deleteAllByOwnerId(ownerId);
            profiles.flush();
        }
        return addMissing(ownerId, data);
    }

    private MergeResult addMissing(Long ownerId, BackupData data) {
        int[] counts = { 0, 0 };
        importInto(profiles, data.userProfile(), ownerId, e -> { }, counts);
        // El catálogo base vive en el servidor: de la copia solo se importan los ejercicios propios.
        List<CustomExercise> all = data.ejerciciosCatalogo() == null ? List.of() : data.ejerciciosCatalogo();
        List<CustomExercise> custom = all.stream().filter(e -> Boolean.TRUE.equals(e.getEsPersonalizado())).toList();
        counts[1] += all.size() - custom.size();
        importInto(exercises, custom, ownerId, e -> e.setEsPersonalizado(true), counts);
        importInto(folders, data.rutinaCarpetas(), ownerId, e -> { }, counts);
        importInto(routines, data.rutinas(), ownerId, e -> { }, counts);
        importInto(routineExercises, data.rutinaEjercicios(), ownerId, e -> { }, counts);
        importInto(trainings, data.entrenamientosRegistrados(), ownerId, e -> { }, counts);
        importInto(sets, data.ejerciciosRealizados(), ownerId, e -> { }, counts);
        importInto(measurements, data.medidasCorporalesHistorico(), ownerId, e -> { }, counts);
        importInto(records, data.prs(), ownerId, e -> { }, counts);
        importInto(notes, data.notasEjercicios(), ownerId, e -> { }, counts);
        return new MergeResult(counts[0], counts[1]);
    }

    @Transactional
    public void clearAll(Long ownerId) {
        profiles.deleteAllByOwnerId(ownerId);
        exercises.deleteAllByOwnerId(ownerId);
        routines.deleteAllByOwnerId(ownerId);
        folders.deleteAllByOwnerId(ownerId);
        routineExercises.deleteAllByOwnerId(ownerId);
        trainings.deleteAllByOwnerId(ownerId);
        sets.deleteAllByOwnerId(ownerId);
        measurements.deleteAllByOwnerId(ownerId);
        records.deleteAllByOwnerId(ownerId);
        settings.deleteById(ownerId);
        notes.deleteAllByOwnerId(ownerId);
    }

    /** Guarda los registros cuyo id no existe todavía. counts[0] = añadidos, counts[1] = saltados. */
    private <E extends OwnedEntity> void importInto(OwnedRepository<E> repo, List<E> items, Long ownerId,
            Consumer<E> fix, int[] counts) {
        if (items == null) {
            return;
        }
        for (E item : items) {
            // Sin id, o con un id que ya existe (propio o de otro usuario), el registro se salta.
            if (item.getId() == null || item.getId().isBlank() || repo.existsById(item.getId())) {
                counts[1]++;
                continue;
            }
            item.setOwnerId(ownerId);
            fix.accept(item);
            Set<ConstraintViolation<E>> violations = validator.validate(item);
            if (!violations.isEmpty()) {
                throw new ConstraintViolationException(violations);
            }
            repo.save(item);
            counts[0]++;
        }
    }
}
