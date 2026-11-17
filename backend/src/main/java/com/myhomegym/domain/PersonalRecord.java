package com.myhomegym.domain;

import com.myhomegym.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** Récord personal conseguido en un ejercicio. */
@Entity
@Table(name = "personal_records")
public class PersonalRecord extends OwnedEntity {

    @NotBlank
    @Size(max = 120)
    private String ejercicioId;

    @NotBlank
    @Pattern(regexp = "peso_maximo|reps_mismo_peso|volumen_serie|volumen_total")
    @Size(max = 30)
    private String tipo;

    @NotNull
    private Double valor;

    @NotBlank
    @Size(max = 40)
    private String fecha;

    @Size(max = 300)
    @Column(length = 300)
    private String detalle;

    private String updatedAt;

    public String getEjercicioId() {
        return ejercicioId;
    }

    public void setEjercicioId(String ejercicioId) {
        this.ejercicioId = ejercicioId;
    }

    public String getTipo() {
        return tipo;
    }

    public void setTipo(String tipo) {
        this.tipo = tipo;
    }

    public Double getValor() {
        return valor;
    }

    public void setValor(Double valor) {
        this.valor = valor;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public String getDetalle() {
        return detalle;
    }

    public void setDetalle(String detalle) {
        this.detalle = detalle;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
