package com.myhomegym.translation;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

import com.myhomegym.config.AppProperties;

/**
 * Traducción automática con caché. Si el proveedor falla (sin red, cuota agotada) se devuelve
 * el texto original y no se guarda nada, para reintentarlo más adelante.
 */
@Service
public class TranslationService {

    /** MyMemory admite hasta 500 bytes por petición. */
    static final int MAX_CHUNK = 450;

    public record Result(String text, boolean translated) {
    }

    private final TranslationEntryRepository cache;
    private final TranslationProvider provider;

    @Autowired
    public TranslationService(TranslationEntryRepository cache, AppProperties props) {
        this(cache, createProvider(props));
    }

    TranslationService(TranslationEntryRepository cache, TranslationProvider provider) {
        this.cache = cache;
        this.provider = provider;
    }

    public boolean isEnabled() {
        return provider != null;
    }

    public Result translate(String text, String targetLang) {
        if (text == null || text.isBlank() || "en".equals(targetLang)) {
            return new Result(text, false);
        }
        String key = hash(targetLang + "\u0000" + text);
        Optional<TranslationEntry> cached = cache.findById(key);
        if (cached.isPresent()) {
            // También se aplica a lo ya guardado, que puede venir de una versión anterior.
            return new Result(register(cached.get().getTranslated(), targetLang), true);
        }
        if (provider == null) {
            return new Result(text, false);
        }
        StringBuilder out = new StringBuilder();
        for (String chunk : split(text)) {
            Optional<String> translated = provider.translate(chunk, targetLang);
            if (translated.isEmpty()) {
                return new Result(text, false);
            }
            if (!out.isEmpty()) {
                out.append(' ');
            }
            out.append(translated.get().trim());
        }
        String result = register(out.toString(), targetLang);
        if (result.length() <= 4000) {
            try {
                cache.save(new TranslationEntry(key, targetLang, result, provider.name()));
            } catch (DataIntegrityViolationException alreadyCached) {
                // Otra petición guardó la misma frase a la vez: la caché ya está bien.
            }
        }
        return new Result(result, true);
    }

    /** En español, la app trata de tú: se corrige la mezcla de "tú" y "usted" del traductor (RN-5.13). */
    static String register(String text, String targetLang) {
        return "es".equals(targetLang) ? SpanishRegister.toTu(text) : text;
    }

    /** Parte un texto largo por frases para no superar el límite del proveedor. */
    static List<String> split(String text) {
        List<String> chunks = new ArrayList<>();
        if (text.length() <= MAX_CHUNK) {
            chunks.add(text);
            return chunks;
        }
        StringBuilder current = new StringBuilder();
        for (String sentence : text.split("(?<=[.!?])\\s+")) {
            if (current.length() + sentence.length() + 1 > MAX_CHUNK && !current.isEmpty()) {
                chunks.add(current.toString());
                current.setLength(0);
            }
            if (sentence.length() > MAX_CHUNK) {
                for (int i = 0; i < sentence.length(); i += MAX_CHUNK) {
                    chunks.add(sentence.substring(i, Math.min(sentence.length(), i + MAX_CHUNK)));
                }
                continue;
            }
            if (!current.isEmpty()) {
                current.append(' ');
            }
            current.append(sentence);
        }
        if (!current.isEmpty()) {
            chunks.add(current.toString());
        }
        return chunks;
    }

    private static TranslationProvider createProvider(AppProperties props) {
        AppProperties.Translation t = props.translation();
        if (t == null || t.provider() == null) {
            return null;
        }
        int timeout = t.timeoutSeconds() > 0 ? t.timeoutSeconds() : 8;
        return switch (t.provider().toLowerCase()) {
            case "mymemory" -> new MyMemoryProvider(t.email(), timeout);
            case "libretranslate" -> new LibreTranslateProvider(t.url(), t.apiKey(), timeout);
            default -> null;
        };
    }

    private static String hash(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
