package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.AuthResponse;
import com.arigavincent.portfolio.dto.LoginRequest;
import com.arigavincent.portfolio.ratelimit.RateLimitPolicy;
import com.arigavincent.portfolio.ratelimit.RateLimited;
import com.arigavincent.portfolio.security.AuthService;
import com.arigavincent.portfolio.security.AuthService.Session;
import com.arigavincent.portfolio.security.RefreshCookie;
import com.arigavincent.portfolio.security.RefreshTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Auth")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokens;
    private final RefreshCookie refreshCookie;

    @Operation(summary = "Sign in as admin: returns an access token and sets the refresh cookie")
    @RateLimited(RateLimitPolicy.LOGIN)
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return respond(authService.login(request));
    }

    @Operation(summary = "Exchange the refresh cookie for a new access token (the cookie is rotated)")
    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(
            @CookieValue(name = RefreshCookie.NAME, required = false) String refreshToken) {
        return respond(authService.refresh(refreshToken));
    }

    @Operation(summary = "Sign out: revokes the refresh token and clears the cookie")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@CookieValue(name = RefreshCookie.NAME, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshCookie.clear().toString())
                .build();
    }

    private ResponseEntity<AuthResponse> respond(Session session) {
        String cookie = refreshCookie
                .create(session.refreshToken(), refreshTokens.timeToLive())
                .toString();
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie)
                .header(HttpHeaders.CACHE_CONTROL, "no-store")
                .body(session.response());
    }
}
