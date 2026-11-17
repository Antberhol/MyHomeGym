package com.myhomegym.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

/**
 * Bloquea temporalmente un nombre de usuario tras varios intentos fallidos seguidos,
 * para frenar ataques de fuerza bruta contra la contraseña.
 */
@Component
public class LoginAttemptLimiter {

    static final int MAX_FAILURES = 5;
    static final Duration LOCK_TIME = Duration.ofMinutes(15);

    private record Attempts(int failures, Instant lockedUntil) {
    }

    private final Map<String, Attempts> attempts = new ConcurrentHashMap<>();

    public boolean isLocked(String username) {
        Attempts a = attempts.get(key(username));
        return a != null && a.lockedUntil() != null && Instant.now().isBefore(a.lockedUntil());
    }

    public void recordFailure(String username) {
        attempts.compute(key(username), (k, current) -> {
            int failures = (current == null ? 0 : current.failures()) + 1;
            Instant lock = failures >= MAX_FAILURES ? Instant.now().plus(LOCK_TIME) : null;
            return new Attempts(lock != null ? 0 : failures, lock);
        });
    }

    public void recordSuccess(String username) {
        attempts.remove(key(username));
    }

    private static String key(String username) {
        return username == null ? "" : username.trim().toLowerCase(Locale.ROOT);
    }
}
