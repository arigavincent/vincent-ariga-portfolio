package com.arigavincent.portfolio.security;

import com.arigavincent.portfolio.config.AppProperties;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.util.StringUtils;

/** HS256 signing and verification for the short-lived admin access tokens. */
@Slf4j
@Configuration
public class JwtConfig {

    private static final int MIN_SECRET_BYTES = 32;
    private static final String ALGORITHM = "HmacSHA256";

    @Bean
    SecretKey jwtSecretKey(AppProperties properties, Environment environment) {
        String secret = properties.security().jwt().secret();
        if (StringUtils.hasText(secret)) {
            byte[] bytes = secret.getBytes(StandardCharsets.UTF_8);
            if (bytes.length < MIN_SECRET_BYTES) {
                throw new IllegalStateException(
                        "APP_JWT_SECRET must be at least %d bytes long.".formatted(MIN_SECRET_BYTES));
            }
            return new SecretKeySpec(bytes, ALGORITHM);
        }
        if (environment.acceptsProfiles(Profiles.of("local", "test"))) {
            log.warn("APP_JWT_SECRET is not set: using a random key, so admin sessions end when the app restarts.");
            byte[] bytes = new byte[MIN_SECRET_BYTES];
            new SecureRandom().nextBytes(bytes);
            return new SecretKeySpec(bytes, ALGORITHM);
        }
        throw new IllegalStateException(
                "APP_JWT_SECRET is not set. Generate one with `openssl rand -base64 48` and set it as an env var.");
    }

    @Bean
    JwtEncoder jwtEncoder(SecretKey jwtSecretKey) {
        return new NimbusJwtEncoder(new ImmutableSecret<>(jwtSecretKey));
    }

    @Bean
    JwtDecoder jwtDecoder(SecretKey jwtSecretKey, AppProperties properties) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(jwtSecretKey)
                .macAlgorithm(MacAlgorithm.HS256)
                .build();
        decoder.setJwtValidator(JwtValidators.createDefaultWithIssuer(
                properties.security().jwt().issuer()));
        return decoder;
    }
}
