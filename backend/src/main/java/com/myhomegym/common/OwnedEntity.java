package com.myhomegym.common;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.Column;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Base de toda entidad que pertenece a un usuario. El id lo genera el cliente (UUID), lo que permite
 * crear registros sin esperar al servidor; el propietario lo fija siempre el servidor a partir del JWT.
 */
@MappedSuperclass
public abstract class OwnedEntity {

    @Id
    @NotBlank
    @Size(max = 64)
    @Column(length = 64)
    private String id;

    @JsonIgnore
    @Column(nullable = false)
    private Long ownerId;

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }
}
