package com.myhomegym.common;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Validator;

/**
 * CRUD genérico por usuario. Cada recurso concreto solo declara su ruta y su repositorio.
 * Ningún usuario puede leer ni sobrescribir registros de otro: el propietario sale del JWT y
 * un id que pertenece a otro usuario se trata como inexistente.
 */
public abstract class OwnedCrudController<E extends OwnedEntity> {

    protected final OwnedRepository<E> repository;
    private final ObjectMapper mapper;
    private final Validator validator;

    protected OwnedCrudController(OwnedRepository<E> repository, ObjectMapper mapper, Validator validator) {
        this.repository = repository;
        this.mapper = mapper;
        this.validator = validator;
    }

    @GetMapping
    public List<E> list(@AuthenticationPrincipal Jwt jwt) {
        return repository.findAllByOwnerId(CurrentUser.id(jwt));
    }

    @GetMapping("/{id}")
    public E get(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        return findOwned(id, CurrentUser.id(jwt));
    }

    @PutMapping("/{id}")
    @Transactional
    public E upsert(@PathVariable String id, @RequestBody E body, @AuthenticationPrincipal Jwt jwt) {
        Long ownerId = CurrentUser.id(jwt);
        assertNotOwnedByOther(id, ownerId);
        body.setId(id);
        body.setOwnerId(ownerId);
        validate(body);
        return repository.save(body);
    }

    @PatchMapping("/{id}")
    @Transactional
    public E patch(@PathVariable String id, @RequestBody JsonNode changes, @AuthenticationPrincipal Jwt jwt)
            throws IOException {
        Long ownerId = CurrentUser.id(jwt);
        E entity = findOwned(id, ownerId);
        mapper.readerForUpdating(entity).readValue(changes);
        entity.setId(id);
        entity.setOwnerId(ownerId);
        validate(entity);
        return repository.save(entity);
    }

    @PostMapping("/bulk")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public List<E> bulk(@RequestBody List<E> items, @AuthenticationPrincipal Jwt jwt) {
        Long ownerId = CurrentUser.id(jwt);
        List<E> saved = new ArrayList<>();
        for (E item : items) {
            validate(item);
            assertNotOwnedByOther(item.getId(), ownerId);
            item.setOwnerId(ownerId);
            saved.add(repository.save(item));
        }
        return saved;
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void delete(@PathVariable String id, @AuthenticationPrincipal Jwt jwt) {
        repository.findByIdAndOwnerId(id, CurrentUser.id(jwt)).ifPresent(repository::delete);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Transactional
    public void clear(@AuthenticationPrincipal Jwt jwt) {
        repository.deleteAllByOwnerId(CurrentUser.id(jwt));
    }

    protected E findOwned(String id, Long ownerId) {
        return repository.findByIdAndOwnerId(id, ownerId)
                .orElseThrow(() -> new NotFoundException("No existe el recurso " + id));
    }

    private void assertNotOwnedByOther(String id, Long ownerId) {
        repository.findById(id).ifPresent(existing -> {
            if (!existing.getOwnerId().equals(ownerId)) {
                throw new NotFoundException("No existe el recurso " + id);
            }
        });
    }

    private void validate(E entity) {
        Set<ConstraintViolation<E>> violations = validator.validate(entity);
        if (!violations.isEmpty()) {
            throw new ConstraintViolationException(violations);
        }
    }
}
