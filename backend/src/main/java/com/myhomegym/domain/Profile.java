package com.myhomegym.domain;

import com.myhomegym.common.OwnedEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

/** Perfil físico del usuario (peso, altura, IMC...). */
@Entity
@Table(name = "profiles")
public class Profile extends OwnedEntity {

    @Size(max = 120)
    private String nombre;

    @Size(max = 16)
    private String unitSystem;

    @NotNull
    @PositiveOrZero
    private Double pesoCorporal;

    @NotNull
    @PositiveOrZero
    private Double altura;

    private Double cintura;

    private Double pecho;

    private Double diametroPierna;

    private Double imc;

    private String createdAt;

    private String updatedAt;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getUnitSystem() {
        return unitSystem;
    }

    public void setUnitSystem(String unitSystem) {
        this.unitSystem = unitSystem;
    }

    public Double getPesoCorporal() {
        return pesoCorporal;
    }

    public void setPesoCorporal(Double pesoCorporal) {
        this.pesoCorporal = pesoCorporal;
    }

    public Double getAltura() {
        return altura;
    }

    public void setAltura(Double altura) {
        this.altura = altura;
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

    public Double getImc() {
        return imc;
    }

    public void setImc(Double imc) {
        this.imc = imc;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
