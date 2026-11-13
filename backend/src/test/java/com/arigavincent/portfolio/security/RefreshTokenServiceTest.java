package com.arigavincent.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.arigavincent.portfolio.entity.AdminUser;
import com.arigavincent.portfolio.entity.RefreshToken;
import com.arigavincent.portfolio.exception.InvalidRefreshTokenException;
import com.arigavincent.portfolio.repository.RefreshTokenRepository;
import com.arigavincent.portfolio.support.TestProperties;
import java.time.Clock;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class RefreshTokenServiceTest {

    private static final Instant NOW = Instant.parse("2026-11-14T10:00:00Z");

    @Mock
    private RefreshTokenRepository repository;

    private RefreshTokenService service;
    private AdminUser user;

    @BeforeEach
    void setUp() {
        service = new RefreshTokenService(repository, TestProperties.defaults(), Clock.fixed(NOW, ZoneOffset.UTC));
        user = new AdminUser();
        user.setUsername("vincent");
    }

    @Test
    void issuesARandomTokenAndStoresOnlyItsHash() {
        String first = service.issue(user);
        String second = service.issue(user);

        ArgumentCaptor<RefreshToken> saved = ArgumentCaptor.forClass(RefreshToken.class);
        verify(repository, org.mockito.Mockito.times(2)).save(saved.capture());
        RefreshToken stored = saved.getAllValues().getFirst();
        assertThat(first).isNotEqualTo(second).hasSizeGreaterThanOrEqualTo(43);
        assertThat(stored.getTokenHash()).hasSize(64).isNotEqualTo(first);
        assertThat(stored.getExpiresAt()).isEqualTo(NOW.plus(Duration.ofDays(7)));
        assertThat(stored.getAdminUser()).isSameAs(user);
    }

    @Test
    void rotatingAValidTokenRevokesItAndIssuesANewOne() {
        RefreshToken token = token(NOW.plusSeconds(60), null);
        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        RefreshTokenService.Rotation rotation = service.rotate("raw-token");

        assertThat(token.getRevokedAt()).isEqualTo(NOW);
        assertThat(rotation.user()).isSameAs(user);
        assertThat(rotation.refreshToken()).isNotBlank().isNotEqualTo("raw-token");
        verify(repository).save(any(RefreshToken.class));
    }

    @Test
    void reusingARevokedTokenRevokesEverySessionOfThatUser() {
        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(token(NOW.plusSeconds(60), NOW)));

        assertThatThrownBy(() -> service.rotate("stolen")).isInstanceOf(InvalidRefreshTokenException.class);

        verify(repository).revokeAllFor(user, NOW);
        verify(repository, never()).save(any());
    }

    @Test
    void expiredUnknownAndBlankTokensAreRejected() {
        when(repository.findByTokenHash(anyString()))
                .thenReturn(Optional.of(token(NOW, null)))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.rotate("expired")).isInstanceOf(InvalidRefreshTokenException.class);
        assertThatThrownBy(() -> service.rotate("unknown")).isInstanceOf(InvalidRefreshTokenException.class);
        assertThatThrownBy(() -> service.rotate(" ")).isInstanceOf(InvalidRefreshTokenException.class);
        assertThatThrownBy(() -> service.rotate(null)).isInstanceOf(InvalidRefreshTokenException.class);
        verify(repository, never()).save(any());
    }

    @Test
    void aDisabledAccountCannotRefresh() {
        user.setEnabled(false);
        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(token(NOW.plusSeconds(60), null)));

        assertThatThrownBy(() -> service.rotate("raw-token")).isInstanceOf(InvalidRefreshTokenException.class);
    }

    @Test
    void revokingMarksTheTokenAndIgnoresBlankInput() {
        RefreshToken token = token(NOW.plusSeconds(60), null);
        when(repository.findByTokenHash(anyString())).thenReturn(Optional.of(token));

        service.revoke("raw-token");
        assertThat(token.getRevokedAt()).isEqualTo(NOW);

        org.mockito.Mockito.clearInvocations(repository);
        service.revoke(null);
        service.revoke("");
        verifyNoInteractions(repository);
    }

    private RefreshToken token(Instant expiresAt, Instant revokedAt) {
        RefreshToken token = new RefreshToken();
        token.setAdminUser(user);
        token.setTokenHash("hash");
        token.setExpiresAt(expiresAt);
        token.setRevokedAt(revokedAt);
        return token;
    }
}
