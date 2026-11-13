package com.arigavincent.portfolio.security;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.entity.AdminUser;
import com.arigavincent.portfolio.entity.RefreshToken;
import com.arigavincent.portfolio.exception.InvalidRefreshTokenException;
import com.arigavincent.portfolio.repository.RefreshTokenRepository;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Opaque refresh tokens: random, stored only as a SHA-256 hash, single use. Every refresh rotates
 * the token; presenting one that was already used revokes the whole session family.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 32;

    private final RefreshTokenRepository repository;
    private final AppProperties properties;
    private final Clock clock;
    private final SecureRandom random = new SecureRandom();

    public record Rotation(AdminUser user, String refreshToken) {}

    @Transactional
    public String issue(AdminUser user) {
        byte[] bytes = new byte[TOKEN_BYTES];
        random.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken token = new RefreshToken();
        token.setAdminUser(user);
        token.setTokenHash(hash(rawToken));
        token.setExpiresAt(clock.instant().plus(timeToLive()));
        repository.save(token);
        return rawToken;
    }

    @Transactional(noRollbackFor = InvalidRefreshTokenException.class)
    public Rotation rotate(String rawToken) {
        Instant now = clock.instant();
        RefreshToken token = find(rawToken);
        AdminUser user = token.getAdminUser();
        if (token.isRevoked()) {
            int revoked = repository.revokeAllFor(user, now);
            log.warn("Refresh token reuse detected for '{}': revoked {} active sessions", user.getUsername(), revoked);
            throw new InvalidRefreshTokenException();
        }
        if (token.isExpiredAt(now) || !user.isEnabled()) {
            throw new InvalidRefreshTokenException();
        }
        token.setRevokedAt(now);
        return new Rotation(user, issue(user));
    }

    @Transactional
    public void revoke(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            return;
        }
        repository
                .findByTokenHash(hash(rawToken))
                .filter(token -> !token.isRevoked())
                .ifPresent(token -> token.setRevokedAt(clock.instant()));
    }

    public Duration timeToLive() {
        return properties.security().jwt().refreshTtl();
    }

    @Scheduled(cron = "0 30 3 * * *")
    @Transactional
    public void purgeExpired() {
        int removed = repository.deleteExpiredBefore(clock.instant());
        if (removed > 0) {
            log.info("Purged {} expired refresh tokens", removed);
        }
    }

    private RefreshToken find(String rawToken) {
        if (rawToken == null || rawToken.isBlank()) {
            throw new InvalidRefreshTokenException();
        }
        return repository.findByTokenHash(hash(rawToken)).orElseThrow(InvalidRefreshTokenException::new);
    }

    private static String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is required by the Java platform", exception);
        }
    }
}
