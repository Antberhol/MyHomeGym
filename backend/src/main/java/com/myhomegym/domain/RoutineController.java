package com.myhomegym.domain;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myhomegym.common.CurrentUser;
import com.myhomegym.common.OwnedCrudController;

import jakarta.validation.Validator;

@RestController
@RequestMapping("/api/routines")
public class RoutineController extends OwnedCrudController<Routine> {

    private final RoutineExerciseRepository routineExercises;

    public RoutineController(RoutineRepository repository, RoutineExerciseRepository routineExercises,
            ObjectMapper mapper, Validator validator) {
        super(repository, mapper, validator);
        this.routineExercises = routineExercises;
    }

    /** Borra la rutina y, en la misma transacción, todos sus ejercicios. */
    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        Long ownerId = CurrentUser.id(jwt);
        repository.findByIdAndOwnerId(id, ownerId).ifPresent(routine -> {
            routineExercises.deleteAll(routineExercises.findAllByOwnerIdAndRutinaId(ownerId, id));
            repository.delete(routine);
        });
    }
}
