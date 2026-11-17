package com.myhomegym;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.Optional;
import java.util.Set;
import java.util.concurrent.atomic.AtomicInteger;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import com.myhomegym.catalog.CatalogExercise;
import com.myhomegym.catalog.CatalogService;
import com.myhomegym.translation.TranslationEntryRepository;
import com.myhomegym.translation.TranslationProvider;
import com.myhomegym.translation.TranslationServiceTestAccess;

@SpringBootTest
@ActiveProfiles("test")
class CatalogAndTranslationTest {

    private static final Set<String> APP_GROUPS = Set.of("pecho", "espalda", "piernas", "hombros", "biceps",
            "triceps", "core", "antebrazos");

    @Autowired
    CatalogService catalog;

    @Autowired
    TranslationEntryRepository cache;

    @Test
    void everyExerciseHasASpanishNameAndAKnownGroup() {
        assertThat(catalog.size()).isEqualTo(876);
        long untranslated = 0;
        for (CatalogExercise e : catalog.list("es")) {
            assertThat(e.nombre()).as(e.id()).isNotBlank();
            if (e.nombre().equals(e.nombreOriginal())) {
                untranslated++;
            }
            assertThat(APP_GROUPS).as(e.id()).contains(e.grupoMuscularPrimario());
            assertThat(e.descripcion()).startsWith("Ejercicio de");
            assertThat(e.instrucciones()).isEmpty();
        }
        // Solo nombres propios que se dicen igual en español (Superman, Muscle Up...).
        assertThat(untranslated).isLessThan(15);
    }

    @Test
    void translationsAreCachedAndFailuresFallBackToOriginal() {
        AtomicInteger calls = new AtomicInteger();
        TranslationProvider fake = new TranslationProvider() {
            @Override
            public Optional<String> translate(String text, String targetLang) {
                calls.incrementAndGet();
                return text.contains("fail") ? Optional.empty() : Optional.of("ES:" + text);
            }

            @Override
            public String name() {
                return "fake";
            }
        };
        var service = TranslationServiceTestAccess.create(cache, fake);

        assertThat(service.translate("Keep your back straight.", "es").text()).isEqualTo("ES:Keep your back straight.");
        assertThat(service.translate("Keep your back straight.", "es").translated()).isTrue();
        assertThat(calls.get()).isEqualTo(1);

        var failed = service.translate("this will fail", "es");
        assertThat(failed.translated()).isFalse();
        assertThat(failed.text()).isEqualTo("this will fail");

        String longText = "A sentence that is long enough. ".repeat(40);
        assertThat(TranslationServiceTestAccess.split(longText)).allSatisfy(chunk -> assertThat(chunk.length()).isLessThanOrEqualTo(450));
    }
}
