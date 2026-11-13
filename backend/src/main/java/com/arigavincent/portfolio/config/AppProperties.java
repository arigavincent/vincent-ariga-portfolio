package com.arigavincent.portfolio.config;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import java.time.Duration;
import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.util.unit.DataSize;
import org.springframework.validation.annotation.Validated;

/** Everything configurable about the app, bound from {@code app.*} (set through env vars). */
@Validated
@ConfigurationProperties(prefix = "app")
public record AppProperties(
        @Valid @NotNull Security security,
        @Valid @NotNull Cors cors,
        @Valid @NotNull Admin admin,
        @Valid @NotNull Contact contact,
        @Valid @NotNull Storage storage,
        @Valid @NotNull RateLimit rateLimit) {

    public record Security(
            @Valid @NotNull Jwt jwt, @Valid @NotNull RefreshCookie refreshCookie) {}

    public record Jwt(
            String secret,
            @NotBlank String issuer,
            @NotNull Duration accessTtl,
            @NotNull Duration refreshTtl) {}

    public record RefreshCookie(
            boolean secure,
            @NotBlank @Pattern(regexp = "Strict|Lax|None") String sameSite) {}

    public record Cors(@NotNull List<String> allowedOrigins) {}

    /** First admin account, created on startup when it does not exist yet. */
    public record Admin(String username, String password) {}

    /** Where contact form notifications go. Leave blank to keep messages in the inbox only. */
    public record Contact(String notifyTo, String notifyFrom) {}

    public record Storage(
            @NotBlank String localRoot,
            @NotNull DataSize maxImageSize,
            @NotNull DataSize maxDocumentSize) {}

    public record RateLimit(
            @Valid @NotNull Limit contact, @Valid @NotNull Limit login) {}

    public record Limit(@Positive int capacity, @NotNull Duration period) {}
}
