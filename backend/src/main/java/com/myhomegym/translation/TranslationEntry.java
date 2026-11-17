package com.myhomegym.translation;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Caché de traducciones: cada frase se traduce una sola vez y se guarda en la base de datos local. */
@Entity
@Table(name = "translation_cache")
public class TranslationEntry {

    @Id
    @Column(length = 64)
    private String hash;

    @Column(nullable = false, length = 8)
    private String lang;

    @Column(nullable = false, length = 4000)
    private String translated;

    @Column(nullable = false, length = 20)
    private String provider;

    private Instant createdAt = Instant.now();

    protected TranslationEntry() {
    }

    public TranslationEntry(String hash, String lang, String translated, String provider) {
        this.hash = hash;
        this.lang = lang;
        this.translated = translated;
        this.provider = provider;
    }

    public String getTranslated() {
        return translated;
    }
}
