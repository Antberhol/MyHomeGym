package com.myhomegym.domain;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.myhomegym.common.CurrentUser;
import com.myhomegym.common.OwnedCrudController;

import jakarta.validation.Validator;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@RestController
@RequestMapping("/api/routine-exercises")
public class RoutineExerciseController extends OwnedCrudController<RoutineExercise> {

    public RoutineExerciseController(RoutineExerciseRepository repository, ObjectMapper mapper, Validator validator) {
        super(repository, mapper, validator);
    }

    public record OrderItem(@NotBlank String id, @NotNull Integer orden) {
    }

    /** Cambia el orden de varios ejercicios de rutina de forma atómica. */
    @PostMapping("/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void reorder(@RequestBody List<OrderItem> items, @AuthenticationPrincipal Jwt jwt) {
        Long ownerId = CurrentUser.id(jwt);
        for (OrderItem item : items) {
            RoutineExercise entity = findOwned(item.id(), ownerId);
            entity.setOrden(item.orden());
            repository.save(entity);
        }
    }
}
