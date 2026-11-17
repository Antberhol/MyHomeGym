package com.myhomegym.domain;

import com.myhomegym.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** Ejercicio dentro de una rutina, con su prescripción. */
@Entity
@Table(name = "routine_exercises")
public class RoutineExercise extends OwnedEntity {

    @NotBlank
    @Size(max = 64)
    private String rutinaId;

    @NotBlank
    @Size(max = 120)
    private String ejercicioId;

    private Integer orden;

    @Min(1)
    @Max(20)
    private Integer series;

    @Size(max = 40)
    private String repeticiones;

    private Double pesoSugerido;

    @PositiveOrZero
    @Max(3600)
    private Integer descansoSegundos;

    @DecimalMin("1")
    @DecimalMax("10")
    private Double rpe;

    @Size(max = 1000)
    @Column(length = 1000)
    private String notas;

    private String updatedAt;

    public String getRutinaId() {
        return rutinaId;
    }

    public void setRutinaId(String rutinaId) {
        this.rutinaId = rutinaId;
    }

    public String getEjercicioId() {
        return ejercicioId;
    }

    public void setEjercicioId(String ejercicioId) {
        this.ejercicioId = ejercicioId;
    }

    public Integer getOrden() {
        return orden;
    }

    public void setOrden(Integer orden) {
        this.orden = orden;
    }

    public Integer getSeries() {
        return series;
    }

    public void setSeries(Integer series) {
        this.series = series;
    }

    public String getRepeticiones() {
        return repeticiones;
    }

    public void setRepeticiones(String repeticiones) {
        this.repeticiones = repeticiones;
    }

    public Double getPesoSugerido() {
        return pesoSugerido;
    }

    public void setPesoSugerido(Double pesoSugerido) {
        this.pesoSugerido = pesoSugerido;
    }

    public Integer getDescansoSegundos() {
        return descansoSegundos;
    }

    public void setDescansoSegundos(Integer descansoSegundos) {
        this.descansoSegundos = descansoSegundos;
    }

    public Double getRpe() {
        return rpe;
    }

    public void setRpe(Double rpe) {
        this.rpe = rpe;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
