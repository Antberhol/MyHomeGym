package com.myhomegym.domain;

import java.util.ArrayList;
import java.util.List;
import com.myhomegym.common.OwnedEntity;
import com.myhomegym.common.StringListConverter;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Ejercicio creado por el usuario (el catálogo base es de solo lectura). */
@Entity
@Table(name = "custom_exercises")
public class CustomExercise extends OwnedEntity {

    @NotBlank
    @Size(max = 160)
    private String nombre;

    @Size(max = 2000)
    @Column(length = 2000)
    private String descripcion;

    @NotBlank
    @Size(max = 40)
    private String grupoMuscularPrimario;

    @Convert(converter = StringListConverter.class)
    @Column(length = 1000)
    private List<String> gruposMuscularesSecundarios = new ArrayList<>();

    @Size(max = 20)
    private String tipoEjercicio;

    @Size(max = 20)
    private String nivelDificultad;

    @Size(max = 80)
    private String equipoNecesario;

    @Size(max = 1000)
    @Column(length = 1000)
    private String imagenUrl;

    @Size(max = 4000)
    @Column(length = 4000)
    private String instrucciones;

    private Boolean esPersonalizado;

    private String createdAt;

    private String updatedAt;

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public void setDescripcion(String descripcion) {
        this.descripcion = descripcion;
    }

    public String getGrupoMuscularPrimario() {
        return grupoMuscularPrimario;
    }

    public void setGrupoMuscularPrimario(String grupoMuscularPrimario) {
        this.grupoMuscularPrimario = grupoMuscularPrimario;
    }

    public List<String> getGruposMuscularesSecundarios() {
        return gruposMuscularesSecundarios;
    }

    public void setGruposMuscularesSecundarios(List<String> gruposMuscularesSecundarios) {
        this.gruposMuscularesSecundarios = gruposMuscularesSecundarios;
    }

    public String getTipoEjercicio() {
        return tipoEjercicio;
    }

    public void setTipoEjercicio(String tipoEjercicio) {
        this.tipoEjercicio = tipoEjercicio;
    }

    public String getNivelDificultad() {
        return nivelDificultad;
    }

    public void setNivelDificultad(String nivelDificultad) {
        this.nivelDificultad = nivelDificultad;
    }

    public String getEquipoNecesario() {
        return equipoNecesario;
    }

    public void setEquipoNecesario(String equipoNecesario) {
        this.equipoNecesario = equipoNecesario;
    }

    public String getImagenUrl() {
        return imagenUrl;
    }

    public void setImagenUrl(String imagenUrl) {
        this.imagenUrl = imagenUrl;
    }

    public String getInstrucciones() {
        return instrucciones;
    }

    public void setInstrucciones(String instrucciones) {
        this.instrucciones = instrucciones;
    }

    public Boolean getEsPersonalizado() {
        return esPersonalizado;
    }

    public void setEsPersonalizado(Boolean esPersonalizado) {
        this.esPersonalizado = esPersonalizado;
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
