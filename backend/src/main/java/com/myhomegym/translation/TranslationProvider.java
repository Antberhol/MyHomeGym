package com.myhomegym.translation;

import java.util.Optional;

/** Traduce un texto corto del inglés a otro idioma. Devuelve vacío si no puede. */
public interface TranslationProvider {

    Optional<String> translate(String text, String targetLang);

    String name();
}
