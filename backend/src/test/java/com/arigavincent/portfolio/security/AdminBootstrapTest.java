package com.arigavincent.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.arigavincent.portfolio.entity.AdminUser;
import com.arigavincent.portfolio.entity.Role;
import com.arigavincent.portfolio.repository.AdminUserRepository;
import com.arigavincent.portfolio.support.TestProperties;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.DefaultApplicationArguments;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
class AdminBootstrapTest {

    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder(4);

    @Mock
    private AdminUserRepository repository;

    @Test
    void createsTheAdminWithAHashedPassword() {
        when(repository.existsByUsernameIgnoreCase("vincent")).thenReturn(false);

        bootstrap(" vincent ", "a-long-enough-password").run(new DefaultApplicationArguments());

        ArgumentCaptor<AdminUser> saved = ArgumentCaptor.forClass(AdminUser.class);
        verify(repository).save(saved.capture());
        AdminUser admin = saved.getValue();
        assertThat(admin.getUsername()).isEqualTo("vincent");
        assertThat(admin.getRole()).isEqualTo(Role.ADMIN);
        assertThat(admin.getPasswordHash()).startsWith("$2").doesNotContain("a-long-enough-password");
        assertThat(passwordEncoder.matches("a-long-enough-password", admin.getPasswordHash()))
                .isTrue();
    }

    @Test
    void leavesAnExistingAccountUntouched() {
        when(repository.existsByUsernameIgnoreCase("vincent")).thenReturn(true);

        bootstrap("vincent", "a-different-password").run(new DefaultApplicationArguments());

        verify(repository, never()).save(any());
    }

    @Test
    void doesNothingWhenCredentialsAreNotConfigured() {
        bootstrap("", "").run(new DefaultApplicationArguments());
        bootstrap("vincent", " ").run(new DefaultApplicationArguments());

        verify(repository, never()).save(any());
    }

    @Test
    void refusesToStartWithAShortPassword() {
        when(repository.existsByUsernameIgnoreCase("vincent")).thenReturn(false);
        AdminBootstrap bootstrap = bootstrap("vincent", "short");

        assertThatThrownBy(() -> bootstrap.run(new DefaultApplicationArguments()))
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("at least 12 characters");
        verify(repository, never()).save(any());
    }

    private AdminBootstrap bootstrap(String username, String password) {
        return new AdminBootstrap(TestProperties.withAdmin(username, password), repository, passwordEncoder);
    }
}
