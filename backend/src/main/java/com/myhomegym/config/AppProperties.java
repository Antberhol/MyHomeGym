package com.myhomegym.config;

import java.util.List;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuración propia de la aplicación (prefijo {@code app} en application.yml).
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        String dataDir,
        Jwt jwt,
        Cookies cookies,
        Cors cors,
        Translation translation,
        Catalog catalog) {

    public record Jwt(String secret, long accessTtlMinutes, long refreshTtlDays, String issuer) {
    }

    public record Cookies(boolean secure) {
    }

    public record Cors(List<String> allowedOrigins) {
    }

    /**
     * @param provider  mymemory, libretranslate o none
     * @param email     correo opcional para MyMemory (amplía la cuota diaria gratuita)
     * @param url       URL de una instancia de LibreTranslate
     * @param apiKey    clave opcional de LibreTranslate
     */
    public record Translation(String provider, String email, String url, String apiKey, int timeoutSeconds) {
    }

    public record Catalog(String imageBaseUrl) {
    }
}
