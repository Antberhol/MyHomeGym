package com.myhomegym.catalog;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

/**
 * Un ejercicio de free-exercise-db más su nombre en español ({@code nameEs}).
 * Se guarda en catalog/exercises/&lt;músculo principal&gt;.json, un ejercicio por línea.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record SourceExercise(
        String id,
        String name,
        String nameEs,
        String force,
        String level,
        String mechanic,
        String equipment,
        List<String> primaryMuscles,
        List<String> secondaryMuscles,
        List<String> instructions,
        String category,
        List<String> images) {
}
