package com.arigavincent.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.arigavincent.portfolio.support.TestProperties;
import javax.crypto.SecretKey;
import org.junit.jupiter.api.Test;
import org.springframework.mock.env.MockEnvironment;

class JwtConfigTest {

    private final JwtConfig config = new JwtConfig();

    @Test
    void usesTheConfiguredSecret() {
        SecretKey key =
                config.jwtSecretKey(TestProperties.withJwtSecret("0123456789abcdef0123456789abcdef"), production());

        assertThat(key.getEncoded()).hasSize(32);
        assertThat(key.getAlgorithm()).isEqualTo("HmacSHA256");
    }

    @Test
    void refusesASecretThatIsTooShort() {
        assertThatThrownBy(() -> config.jwtSecretKey(TestProperties.withJwtSecret("too-short"), production()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 32 bytes");
    }

    @Test
    void refusesToStartInProductionWithoutASecret() {
        assertThatThrownBy(() -> config.jwtSecretKey(TestProperties.withJwtSecret(""), production()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("APP_JWT_SECRET is not set");
    }

    @Test
    void generatesAThrowawayKeyForLocalDevelopment() {
        MockEnvironment local = new MockEnvironment();
        local.setActiveProfiles("local");

        SecretKey first = config.jwtSecretKey(TestProperties.withJwtSecret(""), local);
        SecretKey second = config.jwtSecretKey(TestProperties.withJwtSecret(""), local);

        assertThat(first.getEncoded()).hasSize(32).isNotEqualTo(second.getEncoded());
    }

    private static MockEnvironment production() {
        return new MockEnvironment();
    }
}
