package com.myhomegym.domain;

import com.myhomegym.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** Serie realizada dentro de un entrenamiento. */
@Entity
@Table(name = "performed_sets")
public class PerformedSet extends OwnedEntity {

    @NotBlank
    @Size(max = 64)
    private String entrenamientoId;

    @NotBlank
    @Size(max = 120)
    private String ejercicioId;

    private Integer serieNumero;

    @PositiveOrZero
    private Integer repeticionesRealizadas;

    @PositiveOrZero
    private Double pesoUtilizado;

    @DecimalMin("1")
    @DecimalMax("10")
    private Double rpe;

    @Pattern(regexp = "normal|warmup|dropset|failure")
    @Size(max = 16)
    @Column(name = "set_type", length = 16)
    private String type;

    @NotBlank
    @Size(max = 40)
    private String fecha;

    private String updatedAt;

    public String getEntrenamientoId() {
        return entrenamientoId;
    }

    public void setEntrenamientoId(String entrenamientoId) {
        this.entrenamientoId = entrenamientoId;
    }

    public String getEjercicioId() {
        return ejercicioId;
    }

    public void setEjercicioId(String ejercicioId) {
        this.ejercicioId = ejercicioId;
    }

    public Integer getSerieNumero() {
        return serieNumero;
    }

    public void setSerieNumero(Integer serieNumero) {
        this.serieNumero = serieNumero;
    }

    public Integer getRepeticionesRealizadas() {
        return repeticionesRealizadas;
    }

    public void setRepeticionesRealizadas(Integer repeticionesRealizadas) {
        this.repeticionesRealizadas = repeticionesRealizadas;
    }

    public Double getPesoUtilizado() {
        return pesoUtilizado;
    }

    public void setPesoUtilizado(Double pesoUtilizado) {
        this.pesoUtilizado = pesoUtilizado;
    }

    public Double getRpe() {
        return rpe;
    }

    public void setRpe(Double rpe) {
        this.rpe = rpe;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
