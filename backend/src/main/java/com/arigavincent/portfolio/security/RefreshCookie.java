package com.arigavincent.portfolio.security;

import com.arigavincent.portfolio.config.AppProperties;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

/** Builds the HttpOnly cookie that carries the refresh token. It is only ever sent to /api/auth. */
@Component
@RequiredArgsConstructor
public class RefreshCookie {

    public static final String NAME = "aj_refresh";
    private static final String PATH = "/api/auth";

    private final AppProperties properties;

    public ResponseCookie create(String refreshToken, Duration timeToLive) {
        return build(refreshToken, timeToLive);
    }

    public ResponseCookie clear() {
        return build("", Duration.ZERO);
    }

    private ResponseCookie build(String value, Duration maxAge) {
        AppProperties.RefreshCookie settings = properties.security().refreshCookie();
        return ResponseCookie.from(NAME, value)
                .httpOnly(true)
                .secure(settings.secure())
                .sameSite(settings.sameSite())
                .path(PATH)
                .maxAge(maxAge)
                .build();
    }
}
