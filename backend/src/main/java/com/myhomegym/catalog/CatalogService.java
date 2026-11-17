package com.myhomegym.catalog;

import static com.myhomegym.catalog.CatalogVocabulary.CATEGORY_ES;
import static com.myhomegym.catalog.CatalogVocabulary.EQUIPMENT_ES;
import static com.myhomegym.catalog.CatalogVocabulary.FORCE_ES;
import static com.myhomegym.catalog.CatalogVocabulary.LEVEL;
import static com.myhomegym.catalog.CatalogVocabulary.LEVEL_ES;
import static com.myhomegym.catalog.CatalogVocabulary.MECHANIC_ES;
import static com.myhomegym.catalog.CatalogVocabulary.MUSCLE_ES;
import static com.myhomegym.catalog.CatalogVocabulary.MUSCLE_GROUP;
import static com.myhomegym.catalog.CatalogVocabulary.TYPE;

import java.io.IOException;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.myhomegym.config.AppProperties;
import com.myhomegym.translation.TranslationService;

/**
 * Catálogo de ejercicios de free-exercise-db (dominio público, 876 ejercicios), incluido en el
 * propio backend para funcionar sin depender de una API externa.
 *
 * <ul>
 * <li>Datos y nombres en español: catalog/exercises/&lt;músculo&gt;.json, un ejercicio por línea.</li>
 * <li>Músculos, material, nivel y categoría: vocabulario fijo traducido a mano.</li>
 * <li>Instrucciones: traducción automática bajo demanda, guardada en caché.</li>
 * </ul>
 */
@Service
public class CatalogService {

    static final String CATALOG_FILES = "classpath*:catalog/exercises/*.json";

    private final Map<String, SourceExercise> exercises;
    private final String imageBaseUrl;
    private final TranslationService translations;

    public CatalogService(ObjectMapper mapper, AppProperties props, TranslationService translations) throws IOException {
        this.translations = translations;
        this.imageBaseUrl = props.catalog().imageBaseUrl();
        Map<String, SourceExercise> byId = new LinkedHashMap<>();
        for (SourceExercise e : load(mapper)) {
            if (byId.put(e.id(), e) != null) {
                throw new IllegalStateException("Ejercicio repetido en el catálogo: " + e.id());
            }
        }
        this.exercises = Collections.unmodifiableMap(byId);
    }

    /** Lee todos los ficheros de catalog/exercises/ y los ordena por nombre original. */
    static List<SourceExercise> load(ObjectMapper mapper) throws IOException {
        Resource[] files = new PathMatchingResourcePatternResolver().getResources(CATALOG_FILES);
        if (files.length == 0) {
            throw new IllegalStateException("No hay ficheros de catálogo en " + CATALOG_FILES);
        }
        List<SourceExercise> all = new ArrayList<>();
        for (Resource file : files) {
            try (InputStream in = file.getInputStream()) {
                all.addAll(mapper.readValue(in, new TypeReference<List<SourceExercise>>() {
                }));
            }
        }
        all.sort(Comparator.comparing(SourceExercise::name, String.CASE_INSENSITIVE_ORDER));
        return all;
    }

    public int size() {
        return exercises.size();
    }

    /** Lista completa, sin instrucciones (se piden en el detalle). */
    public List<CatalogExercise> list(String lang) {
        String language = normalize(lang);
        return exercises.values().stream().map(e -> toDto(e, language, false)).toList();
    }

    public Optional<CatalogExercise> detail(String id, String lang) {
        return Optional.ofNullable(exercises.get(id)).map(e -> toDto(e, normalize(lang), true));
    }

    String spanishName(String id) {
        SourceExercise e = exercises.get(id);
        return e == null ? null : e.nameEs();
    }

    private CatalogExercise toDto(SourceExercise e, String lang, boolean withInstructions) {
        boolean es = "es".equals(lang);
        List<String> primary = safe(e.primaryMuscles());
        List<String> secondary = safe(e.secondaryMuscles());
        String group = primary.isEmpty() ? "core" : MUSCLE_GROUP.getOrDefault(primary.get(0), "core");
        String name = es && e.nameEs() != null && !e.nameEs().isBlank() ? e.nameEs() : e.name();
        String equipment = e.equipment() == null ? (es ? "sin material" : "none")
                : es ? EQUIPMENT_ES.getOrDefault(e.equipment(), e.equipment()) : e.equipment();

        List<String> steps = List.of();
        boolean translated = false;
        if (withInstructions) {
            // Los pasos se traducen en paralelo: la primera vez son varias llamadas de red.
            List<TranslationService.Result> results = safe(e.instructions()).parallelStream()
                    .map(step -> es ? translations.translate(step, "es") : new TranslationService.Result(step, false))
                    .toList();
            steps = results.stream().map(TranslationService.Result::text).toList();
            translated = es && !results.isEmpty() && results.stream().allMatch(TranslationService.Result::translated);
        }

        List<String> images = safe(e.images()).stream().map(path -> imageBaseUrl + path).toList();
        return new CatalogExercise(
                e.id(),
                name,
                e.name(),
                describe(e, es),
                group,
                primary.stream().map(m -> label(m, es)).toList(),
                secondary.stream().map(m -> label(m, es)).toList(),
                TYPE.getOrDefault(e.category(), "fuerza"),
                es ? CATEGORY_ES.getOrDefault(e.category(), e.category()) : e.category(),
                LEVEL.getOrDefault(e.level(), "intermedio"),
                equipment,
                e.force() == null ? null : es ? FORCE_ES.getOrDefault(e.force(), e.force()) : e.force(),
                e.mechanic() == null ? null : es ? MECHANIC_ES.getOrDefault(e.mechanic(), e.mechanic()) : e.mechanic(),
                images.isEmpty() ? null : images.get(0),
                images,
                String.join("\n", steps),
                steps,
                translated,
                false,
                "free-exercise-db");
    }

    /** Descripción breve a partir de los datos estructurados, sin inventar nada. */
    private String describe(SourceExercise e, boolean es) {
        List<String> primary = safe(e.primaryMuscles());
        List<String> secondary = safe(e.secondaryMuscles());
        if (!es) {
            StringBuilder sb = new StringBuilder();
            sb.append(capitalize(e.category() == null ? "exercise" : e.category()));
            if (e.mechanic() != null) {
                sb.append(", ").append(e.mechanic());
            }
            sb.append(". Targets ").append(String.join(", ", primary));
            if (!secondary.isEmpty()) {
                sb.append(", with help from ").append(String.join(", ", secondary));
            }
            sb.append(". Level: ").append(e.level()).append('.');
            return sb.toString();
        }
        StringBuilder sb = new StringBuilder("Ejercicio de ");
        sb.append(CATEGORY_ES.getOrDefault(e.category(), "fuerza"));
        if (e.mechanic() != null) {
            sb.append(' ').append(MECHANIC_ES.getOrDefault(e.mechanic(), e.mechanic()));
        }
        if (e.force() != null && !"static".equals(e.force())) {
            sb.append(" de ").append(FORCE_ES.getOrDefault(e.force(), e.force()));
        }
        sb.append(". Trabaja ").append(joinEs(primary.stream().map(m -> label(m, true)).toList()));
        if (!secondary.isEmpty()) {
            sb.append(", con ayuda de ").append(joinEs(secondary.stream().map(m -> label(m, true)).toList()));
        }
        sb.append(". Nivel ").append(LEVEL_ES.getOrDefault(e.level(), "intermedio")).append('.');
        return sb.toString();
    }

    private static String label(String muscle, boolean es) {
        return es ? MUSCLE_ES.getOrDefault(muscle, muscle) : muscle;
    }

    private static String joinEs(List<String> items) {
        if (items.isEmpty()) {
            return "";
        }
        if (items.size() == 1) {
            return items.get(0);
        }
        return items.subList(0, items.size() - 1).stream().collect(Collectors.joining(", ")) + " y "
                + items.get(items.size() - 1);
    }

    private static String capitalize(String value) {
        return value.isEmpty() ? value : Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }

    private static String normalize(String lang) {
        return "en".equalsIgnoreCase(lang) ? "en" : "es";
    }

    private static <T> List<T> safe(List<T> list) {
        return list == null ? List.of() : list;
    }
}
