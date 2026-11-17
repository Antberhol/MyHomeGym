package com.myhomegym.translation;

import java.util.List;

/** Acceso de test a los constructores y utilidades de paquete de TranslationService. */
public final class TranslationServiceTestAccess {

    private TranslationServiceTestAccess() {
    }

    public static TranslationService create(TranslationEntryRepository cache, TranslationProvider provider) {
        return new TranslationService(cache, provider);
    }

    public static List<String> split(String text) {
        return TranslationService.split(text);
    }
}
