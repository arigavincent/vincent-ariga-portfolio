package com.arigavincent.portfolio.security;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.entity.AdminUser;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.util.List;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/** Issues the short-lived JWT that authorises admin API calls. */
@Service
@RequiredArgsConstructor
public class AccessTokenService {

    private final JwtEncoder encoder;
    private final AppProperties properties;
    private final Clock clock;

    public String issue(AdminUser user) {
        Instant now = clock.instant();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .id(UUID.randomUUID().toString())
                .issuer(properties.security().jwt().issuer())
                .subject(user.getUsername())
                .issuedAt(now)
                .expiresAt(now.plus(timeToLive()))
                .claim(SecurityConfig.ROLES_CLAIM, List.of(user.getRole().name()))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }

    public Duration timeToLive() {
        return properties.security().jwt().accessTtl();
    }
}
