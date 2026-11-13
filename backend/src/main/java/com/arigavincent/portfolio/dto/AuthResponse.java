package com.arigavincent.portfolio.dto;

/** Access token for the admin API. The refresh token travels separately in an HttpOnly cookie. */
public record AuthResponse(String accessToken, String tokenType, long expiresIn, AdminUserResponse user) {

    public static AuthResponse bearer(String accessToken, long expiresInSeconds, AdminUserResponse user) {
        return new AuthResponse(accessToken, "Bearer", expiresInSeconds, user);
    }
}
