package com.myhomegym.catalog;

import java.util.List;

/**
 * Ejercicio del catálogo ya adaptado al modelo de la app (mismos nombres de campo que los
 * ejercicios propios del usuario), en el idioma pedido.
 */
public record CatalogExercise(
        String id,
        String nombre,
        String nombreOriginal,
        String descripcion,
        String grupoMuscularPrimario,
        List<String> musculosPrimarios,
        List<String> gruposMuscularesSecundarios,
        String tipoEjercicio,
        String categoria,
        String nivelDificultad,
        String equipoNecesario,
        String fuerza,
        String mecanica,
        String imagenUrl,
        List<String> imagenes,
        String instrucciones,
        List<String> pasos,
        boolean instruccionesTraducidas,
        boolean esPersonalizado,
        String fuente) {
}
