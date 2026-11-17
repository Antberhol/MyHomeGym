package com.myhomegym.domain;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.myhomegym.common.ApiException;
import com.myhomegym.common.CurrentUser;
import com.myhomegym.common.NotFoundException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;

/**
 * Corrige una sesión pasada (FR-3.19, RN-4.15): cambia kilos y repeticiones de sus series, su volumen
 * y los récords afectados, todo en una sola transacción. Si algo no es válido, no cambia nada.
 */
@RestController
public class TrainingCorrectionController {

    private final TrainingRepository trainings;
    private final PerformedSetRepository sets;
    private final PersonalRecordRepository records;
    private final Validator validator;

    public TrainingCorrectionController(TrainingRepository trainings, PerformedSetRepository sets,
            PersonalRecordRepository records, Validator validator) {
        this.trainings = trainings;
        this.sets = sets;
        this.records = records;
        this.validator = validator;
    }

    public record SetCorrection(@NotBlank String id, @NotNull @PositiveOrZero Integer repeticionesRealizadas,
            @NotNull @PositiveOrZero Double pesoUtilizado) {
    }

    /** Récords que dejan de valer y récords nuevos, calculados por la app con las series corregidas. */
    public record RecordChanges(@NotNull List<String> remove, @NotNull List<@Valid PersonalRecord> add) {
    }

    public record Correction(@NotNull List<@Valid SetCorrection> sets, @NotNull @PositiveOrZero Double volumenTotal,
            @NotNull @Valid RecordChanges records, String updatedAt) {
    }

    @PostMapping("/api/trainings/{id}/correction")
    @Transactional
    public Training correct(@PathVariable String id, @Valid @RequestBody Correction body,
            @AuthenticationPrincipal Jwt jwt) {
        Long ownerId = CurrentUser.id(jwt);
        Training training = trainings.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new NotFoundException("No existe el recurso " + id));

        for (SetCorrection change : body.sets()) {
            PerformedSet set = sets.findByIdAndOwnerId(change.id(), ownerId)
                    .filter(found -> id.equals(found.getEntrenamientoId()))
                    .orElseThrow(() -> new NotFoundException("No existe la serie " + change.id()));
            set.setRepeticionesRealizadas(change.repeticionesRealizadas());
            set.setPesoUtilizado(change.pesoUtilizado());
            set.setUpdatedAt(body.updatedAt());
            sets.save(set);
        }

        training.setVolumenTotal(body.volumenTotal());
        training.setUpdatedAt(body.updatedAt());
        Training saved = trainings.save(training);

        for (String recordId : body.records().remove()) {
            records.findByIdAndOwnerId(recordId, ownerId).ifPresent(records::delete);
        }
        records.flush();
        for (PersonalRecord record : body.records().add()) {
            if (records.existsById(record.getId())) {
                throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_ID", "Ya existe un récord con ese id");
            }
            record.setOwnerId(ownerId);
            validate(record);
            records.save(record);
        }
        return saved;
    }

    private void validate(PersonalRecord record) {
        Set<ConstraintViolation<PersonalRecord>> violations = validator.validate(record);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
    }
}
