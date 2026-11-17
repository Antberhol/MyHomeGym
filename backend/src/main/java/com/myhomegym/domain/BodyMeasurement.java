package com.myhomegym.domain;

import com.myhomegym.common.OwnedEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** Medidas corporales en una fecha. */
@Entity
@Table(name = "body_measurements")
public class BodyMeasurement extends OwnedEntity {

    @NotNull
    @PositiveOrZero
    private Double pesoCorporal;

    private Double cintura;

    private Double pecho;

    private Double diametroPierna;

    private Double biceps;

    private Double hombros;

    private Double pantorrilla;

    private Double imc;

    @NotBlank
    @Size(max = 40)
    private String fechaRegistro;

    private String updatedAt;

    public Double getPesoCorporal() {
        return pesoCorporal;
    }

    public void setPesoCorporal(Double pesoCorporal) {
        this.pesoCorporal = pesoCorporal;
    }

    public Double getCintura() {
        return cintura;
    }

    public void setCintura(Double cintura) {
        this.cintura = cintura;
    }

    public Double getPecho() {
        return pecho;
    }

    public void setPecho(Double pecho) {
        this.pecho = pecho;
    }

    public Double getDiametroPierna() {
        return diametroPierna;
    }

    public void setDiametroPierna(Double diametroPierna) {
        this.diametroPierna = diametroPierna;
    }

    public Double getBiceps() {
        return biceps;
    }

    public void setBiceps(Double biceps) {
        this.biceps = biceps;
    }

    public Double getHombros() {
        return hombros;
    }

    public void setHombros(Double hombros) {
        this.hombros = hombros;
    }

    public Double getPantorrilla() {
        return pantorrilla;
    }

    public void setPantorrilla(Double pantorrilla) {
        this.pantorrilla = pantorrilla;
    }

    public Double getImc() {
        return imc;
    }

    public void setImc(Double imc) {
        this.imc = imc;
    }

    public String getFechaRegistro() {
        return fechaRegistro;
    }

    public void setFechaRegistro(String fechaRegistro) {
        this.fechaRegistro = fechaRegistro;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
