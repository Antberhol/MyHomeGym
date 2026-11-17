package com.myhomegym.translation;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

import com.fasterxml.jackson.databind.JsonNode;

/** Traductor LibreTranslate (de código abierto, se puede alojar en local con Docker). */
public class LibreTranslateProvider implements TranslationProvider {

    private static final Logger log = LoggerFactory.getLogger(LibreTranslateProvider.class);

    private final RestClient client;
    private final String apiKey;

    public LibreTranslateProvider(String url, String apiKey, int timeoutSeconds) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(timeoutSeconds));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.client = RestClient.builder().baseUrl(url).requestFactory(factory).build();
        this.apiKey = apiKey;
    }

    @Override
    public Optional<String> translate(String text, String targetLang) {
        try {
            Map<String, String> payload = new HashMap<>();
            payload.put("q", text);
            payload.put("source", "en");
            payload.put("target", targetLang);
            payload.put("format", "text");
            if (apiKey != null && !apiKey.isBlank()) {
                payload.put("api_key", apiKey);
            }
            JsonNode body = client.post().uri("/translate").contentType(MediaType.APPLICATION_JSON).body(payload)
                    .retrieve().body(JsonNode.class);
            String translated = body == null ? "" : body.path("translatedText").asText("");
            return translated.isBlank() ? Optional.empty() : Optional.of(translated);
        } catch (RuntimeException e) {
            log.warn("Error llamando a LibreTranslate: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public String name() {
        return "libretranslate";
    }
}
