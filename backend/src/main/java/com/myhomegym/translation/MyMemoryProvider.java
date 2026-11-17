package com.myhomegym.translation;

import java.net.URI;
import java.time.Duration;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import com.fasterxml.jackson.databind.JsonNode;

/**
 * Traductor gratuito de MyMemory (https://mymemory.translated.net). No necesita clave; con un
 * correo de contacto en {@code app.translation.email} la cuota diaria es mayor.
 */
public class MyMemoryProvider implements TranslationProvider {

    private static final Logger log = LoggerFactory.getLogger(MyMemoryProvider.class);

    private final RestClient client;
    private final String email;

    public MyMemoryProvider(String email, int timeoutSeconds) {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(timeoutSeconds));
        factory.setReadTimeout(Duration.ofSeconds(timeoutSeconds));
        this.client = RestClient.builder().requestFactory(factory).build();
        this.email = email;
    }

    @Override
    public Optional<String> translate(String text, String targetLang) {
        try {
            UriComponentsBuilder builder = UriComponentsBuilder.fromUriString("https://api.mymemory.translated.net/get")
                    .queryParam("q", text)
                    .queryParam("langpair", "en|" + targetLang);
            if (email != null && !email.isBlank()) {
                builder.queryParam("de", email);
            }
            URI uri = builder.encode().build().toUri();
            JsonNode body = client.get().uri(uri).retrieve().body(JsonNode.class);
            if (body == null || body.path("responseStatus").asInt(0) != 200) {
                log.warn("MyMemory no tradujo el texto (estado {})", body == null ? "vacío" : body.path("responseStatus"));
                return Optional.empty();
            }
            String translated = body.path("responseData").path("translatedText").asText("");
            if (translated.isBlank() || translated.toUpperCase().contains("MYMEMORY WARNING")) {
                return Optional.empty();
            }
            return Optional.of(HtmlEntities.decode(translated));
        } catch (RuntimeException e) {
            log.warn("Error llamando a MyMemory: {}", e.getMessage());
            return Optional.empty();
        }
    }

    @Override
    public String name() {
        return "mymemory";
    }
}
