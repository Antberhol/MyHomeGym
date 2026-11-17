package com.myhomegym.domain;

import com.myhomegym.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Nota personal de un usuario sobre un ejercicio (del catálogo o propio). Una por ejercicio. */
@Entity
@Table(name = "exercise_notes")
public class ExerciseNote extends OwnedEntity {

    @NotBlank
    @Size(max = 120)
    private String ejercicioId;

    @NotNull
    @Size(max = 4000)
    @Column(length = 4000)
    private String texto;

    private String updatedAt;

    public String getEjercicioId() {
        return ejercicioId;
    }

    public void setEjercicioId(String ejercicioId) {
        this.ejercicioId = ejercicioId;
    }

    public String getTexto() {
        return texto;
    }

    public void setTexto(String texto) {
        this.texto = texto;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
