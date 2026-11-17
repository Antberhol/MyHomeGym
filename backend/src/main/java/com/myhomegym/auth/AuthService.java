package com.myhomegym.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.myhomegym.common.ApiException;
import com.myhomegym.auth.AuthDtos.AuthResponse;
import com.myhomegym.auth.AuthDtos.LoginRequest;
import com.myhomegym.auth.AuthDtos.RegisterRequest;
import com.myhomegym.auth.AuthDtos.UserDto;
import com.myhomegym.config.AppProperties;

@Service
public class AuthService {

    /** Resultado de autenticar: respuesta para el cliente y token de refresco para la cookie. */
    public record Session(AuthResponse response, String refreshToken) {
    }

    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserAccountRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtEncoder jwtEncoder;
    private final LoginAttemptLimiter limiter;
    private final AppProperties props;
    private final String dummyHash;

    public AuthService(UserAccountRepository users, RefreshTokenRepository refreshTokens,
            PasswordEncoder passwordEncoder, JwtEncoder jwtEncoder, LoginAttemptLimiter limiter, AppProperties props) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwordEncoder = passwordEncoder;
        this.jwtEncoder = jwtEncoder;
        this.limiter = limiter;
        this.props = props;
        // Se compara contra este hash cuando el usuario no existe, para que la respuesta tarde lo mismo.
        this.dummyHash = passwordEncoder.encode("myhomegym-dummy-password");
    }

    @Transactional
    public Session register(RegisterRequest request) {
        String username = request.username().trim();
        if (users.existsByUsernameIgnoreCase(username)) {
            throw new ApiException(HttpStatus.CONFLICT, "USERNAME_TAKEN", "Ese nombre de usuario ya existe");
        }
        UserAccount user = new UserAccount();
        user.setUsername(username);
        user.setDisplayName(request.displayName() == null || request.displayName().isBlank()
                ? username
                : request.displayName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        users.save(user);
        return startSession(user);
    }

    @Transactional
    public Session login(LoginRequest request) {
        String username = request.username().trim();
        if (limiter.isLocked(username)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "TOO_MANY_ATTEMPTS",
                    "Demasiados intentos fallidos. Espera 15 minutos y vuelve a intentarlo");
        }
        UserAccount user = users.findByUsernameIgnoreCase(username).orElse(null);
        String hash = user == null ? dummyHash : user.getPasswordHash();
        boolean matches = passwordEncoder.matches(request.password(), hash);
        if (user == null || !matches) {
            limiter.recordFailure(username);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "BAD_CREDENTIALS", "Usuario o contraseña incorrectos");
        }
        limiter.recordSuccess(username);
        return startSession(user);
    }

    /**
     * Rota el token de refresco: el usado queda revocado y se emite otro. Si llega un token ya
     * revocado (posible robo), se revocan todas las sesiones del usuario.
     */
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public Session refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw unauthorized();
        }
        RefreshToken stored = refreshTokens.findByTokenHash(sha256(rawRefreshToken)).orElseThrow(this::unauthorized);
        if (stored.isRevoked()) {
            refreshTokens.findAllByUserIdAndRevokedFalse(stored.getUserId()).forEach(RefreshToken::revoke);
            throw unauthorized();
        }
        if (stored.getExpiresAt().isBefore(Instant.now())) {
            stored.revoke();
            throw unauthorized();
        }
        stored.revoke();
        UserAccount user = users.findById(stored.getUserId()).orElseThrow(this::unauthorized);
        return startSession(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            return;
        }
        refreshTokens.findByTokenHash(sha256(rawRefreshToken)).ifPresent(RefreshToken::revoke);
    }

    @Transactional(readOnly = true)
    public UserDto me(Long userId) {
        return users.findById(userId).map(UserDto::from).orElseThrow(this::unauthorized);
    }

    public Duration refreshTtl() {
        return Duration.ofDays(props.jwt().refreshTtlDays());
    }

    private Session startSession(UserAccount user) {
        Instant now = Instant.now();
        long ttlSeconds = Duration.ofMinutes(props.jwt().accessTtlMinutes()).toSeconds();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(props.jwt().issuer())
                .issuedAt(now)
                .expiresAt(now.plusSeconds(ttlSeconds))
                .subject(String.valueOf(user.getId()))
                .claim("username", user.getUsername())
                .build();
        String accessToken = jwtEncoder
                .encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims))
                .getTokenValue();

        byte[] raw = new byte[32];
        RANDOM.nextBytes(raw);
        String refreshToken = Base64.getUrlEncoder().withoutPadding().encodeToString(raw);
        refreshTokens.save(new RefreshToken(user.getId(), sha256(refreshToken), now.plus(refreshTtl())));

        return new Session(new AuthResponse(accessToken, ttlSeconds, UserDto.from(user)), refreshToken);
    }

    private ResponseStatusException unauthorized() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "SESSION_EXPIRED", "La sesión ha caducado. Inicia sesión de nuevo");
    }

    static String sha256(String value) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
