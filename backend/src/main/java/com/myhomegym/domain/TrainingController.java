package com.myhomegym.domain;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myhomegym.common.ApiException;
import com.myhomegym.common.CurrentUser;
import com.myhomegym.common.OwnedCrudController;

import jakarta.validation.Valid;
import jakarta.validation.Validator;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/trainings")
public class TrainingController extends OwnedCrudController<Training> {

    private final PerformedSetRepository sets;

    public TrainingController(TrainingRepository repository, PerformedSetRepository sets, ObjectMapper mapper,
            Validator validator) {
        super(repository, mapper, validator);
        this.sets = sets;
    }

    public record CompletedTraining(@NotNull @Valid Training training, @NotNull List<@Valid PerformedSet> sets) {
    }

    /** Guarda un entrenamiento terminado y todas sus series en una sola transacción. */
    @PostMapping("/complete")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Training complete(@Valid @RequestBody CompletedTraining body, @AuthenticationPrincipal Jwt jwt) {
        Long ownerId = CurrentUser.id(jwt);
        Training training = body.training();
        if (repository.existsById(training.getId())) {
            throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_ID", "Ya existe un entrenamiento con ese id");
        }
        training.setOwnerId(ownerId);
        Training saved = repository.save(training);
        for (PerformedSet set : body.sets()) {
            if (sets.existsById(set.getId())) {
                throw new ApiException(HttpStatus.CONFLICT, "DUPLICATE_ID", "Ya existe una serie con ese id");
            }
            set.setOwnerId(ownerId);
            set.setEntrenamientoId(saved.getId());
            sets.save(set);
        }
        return saved;
    }

    /** Borra el entrenamiento y sus series. */
    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        Long ownerId = CurrentUser.id(jwt);
        repository.findByIdAndOwnerId(id, ownerId).ifPresent(training -> {
            sets.deleteAll(sets.findAllByOwnerIdAndEntrenamientoId(ownerId, id));
            repository.delete(training);
        });
    }
}
