package com.arigavincent.portfolio.security;

import com.arigavincent.portfolio.dto.AdminUserResponse;
import com.arigavincent.portfolio.dto.AuthResponse;
import com.arigavincent.portfolio.dto.LoginRequest;
import com.arigavincent.portfolio.entity.AdminUser;
import com.arigavincent.portfolio.exception.InvalidCredentialsException;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.repository.AdminUserRepository;
import java.time.Clock;
import java.util.UUID;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;
    private final AccessTokenService accessTokens;
    private final RefreshTokenService refreshTokens;
    private final Clock clock;

    /** Compared against when the username is unknown, so both cases take the same time. */
    private final String decoyHash;

    public AuthService(
            AdminUserRepository repository,
            PasswordEncoder passwordEncoder,
            AccessTokenService accessTokens,
            RefreshTokenService refreshTokens,
            Clock clock) {
        this.repository = repository;
        this.passwordEncoder = passwordEncoder;
        this.accessTokens = accessTokens;
        this.refreshTokens = refreshTokens;
        this.clock = clock;
        this.decoyHash = passwordEncoder.encode(UUID.randomUUID().toString());
    }

    /** An access token for the API response plus the refresh token destined for the cookie. */
    public record Session(AuthResponse response, String refreshToken) {}

    @Transactional
    public Session login(LoginRequest request) {
        AdminUser user = repository
                .findByUsernameIgnoreCase(request.username().trim())
                .filter(AdminUser::isEnabled)
                .orElse(null);
        String hash = user != null ? user.getPasswordHash() : decoyHash;
        boolean passwordMatches = passwordEncoder.matches(request.password(), hash);
        if (user == null || !passwordMatches) {
            throw new InvalidCredentialsException();
        }
        user.setLastLoginAt(clock.instant());
        return new Session(respond(user), refreshTokens.issue(user));
    }

    public Session refresh(String refreshToken) {
        RefreshTokenService.Rotation rotation = refreshTokens.rotate(refreshToken);
        return new Session(respond(rotation.user()), rotation.refreshToken());
    }

    public void logout(String refreshToken) {
        refreshTokens.revoke(refreshToken);
    }

    @Transactional(readOnly = true)
    public AdminUserResponse currentUser(String username) {
        return repository
                .findByUsernameIgnoreCase(username)
                .map(AuthService::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user", username));
    }

    private AuthResponse respond(AdminUser user) {
        return AuthResponse.bearer(
                accessTokens.issue(user), accessTokens.timeToLive().toSeconds(), toResponse(user));
    }

    private static AdminUserResponse toResponse(AdminUser user) {
        return new AdminUserResponse(user.getUsername(), user.getRole());
    }
}
