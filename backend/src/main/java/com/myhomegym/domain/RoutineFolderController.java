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
@RequestMapping("/api/routine-folders")
public class RoutineFolderController extends OwnedCrudController<RoutineFolder> {

    private final RoutineRepository routines;

    public RoutineFolderController(RoutineFolderRepository repository, RoutineRepository routines,
            ObjectMapper mapper, Validator validator) {
        super(repository, mapper, validator);
        this.routines = routines;
    }

    /** Borra la carpeta y, en la misma transacción, deja sus rutinas sin carpeta. Las rutinas no se borran. */
    @Override
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        Long ownerId = CurrentUser.id(jwt);
        repository.findByIdAndOwnerId(id, ownerId).ifPresent(folder -> {
            for (Routine routine : routines.findAllByOwnerIdAndFolderId(ownerId, id)) {
                routine.setFolderId(null);
                routines.save(routine);
            }
            repository.delete(folder);
        });
    }
}
