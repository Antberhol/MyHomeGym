package com.myhomegym.config;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermissions;
import java.security.SecureRandom;
import java.util.Base64;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

import com.nimbusds.jose.jwk.source.ImmutableSecret;

/**
 * Claves JWT (HMAC SHA-256). Si no se configura {@code app.jwt.secret}, se genera una clave
 * aleatoria la primera vez y se guarda en {@code <dataDir>/jwt-secret.key}, de modo que los
 * tokens sobreviven a los reinicios y no hay ningún secreto en el repositorio.
 */
@Configuration
public class JwtConfig {

    private static final Logger log = LoggerFactory.getLogger(JwtConfig.class);
    private static final int KEY_BYTES = 64;

    @Bean
    SecretKey jwtSecretKey(AppProperties props) throws IOException {
        String configured = props.jwt().secret();
        byte[] keyBytes;
        if (configured != null && !configured.isBlank()) {
            keyBytes = Base64.getDecoder().decode(configured.trim());
            if (keyBytes.length < 32) {
                throw new IllegalStateException("app.jwt.secret debe tener al menos 32 bytes en Base64");
            }
        } else {
            keyBytes = loadOrCreateKeyFile(Path.of(props.dataDir(), "jwt-secret.key"));
        }
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSecretKey) {
        return NimbusJwtDecoder.withSecretKey(jwtSecretKey).macAlgorithm(MacAlgorithm.HS256).build();
    }

    private static byte[] loadOrCreateKeyFile(Path file) throws IOException {
        if (Files.exists(file)) {
            return Base64.getDecoder().decode(Files.readString(file, StandardCharsets.UTF_8).trim());
        }
        Files.createDirectories(file.getParent());
        byte[] key = new byte[KEY_BYTES];
        new SecureRandom().nextBytes(key);
        Files.writeString(file, Base64.getEncoder().encodeToString(key), StandardCharsets.UTF_8);
        try {
            Files.setPosixFilePermissions(file, PosixFilePermissions.fromString("rw-------"));
        } catch (UnsupportedOperationException ignored) {
            // Windows: sin permisos POSIX
        }
        log.info("Generada una nueva clave JWT en {}", file.toAbsolutePath());
        return key;
    }
}
