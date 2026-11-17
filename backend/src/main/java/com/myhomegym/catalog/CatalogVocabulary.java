package com.myhomegym.catalog;

import java.util.Map;

/**
 * Vocabulario cerrado de free-exercise-db traducido a mano. Al ser un conjunto fijo de términos,
 * aquí no se usa traducción automática: así los filtros y las estadísticas son siempre coherentes.
 */
final class CatalogVocabulary {

    private CatalogVocabulary() {
    }

    /** Músculo de origen → grupo muscular que usa la app en filtros, mapa corporal y estadísticas. */
    static final Map<String, String> MUSCLE_GROUP = Map.ofEntries(
            Map.entry("abdominals", "core"),
            Map.entry("chest", "pecho"),
            Map.entry("lats", "espalda"),
            Map.entry("middle back", "espalda"),
            Map.entry("lower back", "espalda"),
            Map.entry("traps", "espalda"),
            Map.entry("quadriceps", "piernas"),
            Map.entry("hamstrings", "piernas"),
            Map.entry("calves", "piernas"),
            Map.entry("glutes", "piernas"),
            Map.entry("adductors", "piernas"),
            Map.entry("abductors", "piernas"),
            Map.entry("shoulders", "hombros"),
            Map.entry("neck", "hombros"),
            Map.entry("biceps", "biceps"),
            Map.entry("triceps", "triceps"),
            Map.entry("forearms", "antebrazos"));

    static final Map<String, String> MUSCLE_ES = Map.ofEntries(
            Map.entry("abdominals", "abdominales"),
            Map.entry("abductors", "abductores"),
            Map.entry("adductors", "aductores"),
            Map.entry("biceps", "bíceps"),
            Map.entry("calves", "gemelos"),
            Map.entry("chest", "pecho"),
            Map.entry("forearms", "antebrazos"),
            Map.entry("glutes", "glúteos"),
            Map.entry("hamstrings", "isquiotibiales"),
            Map.entry("lats", "dorsales"),
            Map.entry("lower back", "zona lumbar"),
            Map.entry("middle back", "espalda media"),
            Map.entry("neck", "cuello"),
            Map.entry("quadriceps", "cuádriceps"),
            Map.entry("shoulders", "hombros"),
            Map.entry("traps", "trapecios"),
            Map.entry("triceps", "tríceps"));

    static final Map<String, String> EQUIPMENT_ES = Map.ofEntries(
            Map.entry("body only", "peso corporal"),
            Map.entry("machine", "máquina"),
            Map.entry("other", "otro"),
            Map.entry("foam roll", "rodillo de espuma"),
            Map.entry("kettlebells", "kettlebell"),
            Map.entry("dumbbell", "mancuernas"),
            Map.entry("cable", "polea"),
            Map.entry("barbell", "barra"),
            Map.entry("bands", "bandas"),
            Map.entry("medicine ball", "balón medicinal"),
            Map.entry("exercise ball", "fitball"),
            Map.entry("e-z curl bar", "barra Z"));

    static final Map<String, String> LEVEL = Map.of(
            "beginner", "basico",
            "intermediate", "intermedio",
            "expert", "avanzado");

    static final Map<String, String> LEVEL_ES = Map.of(
            "beginner", "principiante",
            "intermediate", "intermedio",
            "expert", "avanzado");

    /** Categoría de origen → tipo de ejercicio del modelo de la app. */
    static final Map<String, String> TYPE = Map.of(
            "strength", "fuerza",
            "powerlifting", "fuerza",
            "olympic weightlifting", "fuerza",
            "strongman", "fuerza",
            "plyometrics", "fuerza",
            "cardio", "cardio",
            "stretching", "estiramiento");

    static final Map<String, String> CATEGORY_ES = Map.of(
            "strength", "fuerza",
            "powerlifting", "powerlifting",
            "olympic weightlifting", "halterofilia",
            "strongman", "strongman",
            "plyometrics", "pliometría",
            "cardio", "cardio",
            "stretching", "estiramiento");

    static final Map<String, String> FORCE_ES = Map.of(
            "pull", "tirón",
            "push", "empuje",
            "static", "estático");

    static final Map<String, String> MECHANIC_ES = Map.of(
            "compound", "multiarticular",
            "isolation", "monoarticular");
}
