package com.myhomegym.domain;

import com.myhomegym.common.OwnedEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** Sesión de entrenamiento registrada. */
@Entity
@Table(name = "trainings")
public class Training extends OwnedEntity {

    @Size(max = 64)
    private String rutinaId;

    @NotBlank
    @Size(max = 40)
    private String fecha;

    @PositiveOrZero
    private Double duracionMinutos;

    @Size(max = 2000)
    @Column(length = 2000)
    private String notas;

    private Boolean completado;

    @PositiveOrZero
    private Double volumenTotal;

    private String updatedAt;

    public String getRutinaId() {
        return rutinaId;
    }

    public void setRutinaId(String rutinaId) {
        this.rutinaId = rutinaId;
    }

    public String getFecha() {
        return fecha;
    }

    public void setFecha(String fecha) {
        this.fecha = fecha;
    }

    public Double getDuracionMinutos() {
        return duracionMinutos;
    }

    public void setDuracionMinutos(Double duracionMinutos) {
        this.duracionMinutos = duracionMinutos;
    }

    public String getNotas() {
        return notas;
    }

    public void setNotas(String notas) {
        this.notas = notas;
    }

    public Boolean getCompletado() {
        return completado;
    }

    public void setCompletado(Boolean completado) {
        this.completado = completado;
    }

    public Double getVolumenTotal() {
        return volumenTotal;
    }

    public void setVolumenTotal(Double volumenTotal) {
        this.volumenTotal = volumenTotal;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
