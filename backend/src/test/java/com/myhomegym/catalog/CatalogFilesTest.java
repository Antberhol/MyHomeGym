package com.myhomegym.catalog;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Reglas de formato del catálogo, para que las contribuciones lo mantengan ordenado:
 * un fichero por músculo principal, un ejercicio por línea, ids únicos y nombre en español.
 */
class CatalogFilesTest {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    void eachFileHoldsOneMuscleAndOneExercisePerLine() throws IOException {
        Resource[] files = new PathMatchingResourcePatternResolver().getResources(CatalogService.CATALOG_FILES);
        assertThat(files).isNotEmpty();
        Set<String> ids = new HashSet<>();
        for (Resource file : files) {
            String muscle = file.getFilename().replace(".json", "").replace('-', ' ');
            String text;
            try (InputStream in = file.getInputStream()) {
                text = new String(in.readAllBytes(), StandardCharsets.UTF_8);
            }
            List<SourceExercise> exercises = mapper.readValue(text, new TypeReference<List<SourceExercise>>() {
            });
            // "[", una línea por ejercicio y "]".
            assertThat(text.strip().split("\n")).as(file.getFilename()).hasSize(exercises.size() + 2);
            for (SourceExercise e : exercises) {
                assertThat(ids.add(e.id())).as("id repetido: " + e.id()).isTrue();
                assertThat(e.primaryMuscles()).as(e.id()).isNotEmpty();
                assertThat(e.primaryMuscles().get(0)).as(e.id() + " está en " + file.getFilename())
                        .isEqualTo(muscle);
                assertThat(e.nameEs()).as(e.id() + " sin nombre en español").isNotBlank();
            }
        }
        assertThat(ids).hasSize(876);
    }
}
