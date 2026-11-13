package com.arigavincent.portfolio.security;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.entity.AdminUser;
import com.arigavincent.portfolio.entity.Role;
import com.arigavincent.portfolio.repository.AdminUserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * Creates the first admin account from APP_ADMIN_USERNAME / APP_ADMIN_PASSWORD. Credentials only
 * ever come from the environment, and an existing account is never modified.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class AdminBootstrap implements ApplicationRunner {

    static final int MIN_PASSWORD_LENGTH = 12;

    private final AppProperties properties;
    private final AdminUserRepository repository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        String username = properties.admin().username();
        String password = properties.admin().password();
        if (!StringUtils.hasText(username) || !StringUtils.hasText(password)) {
            if (repository.count() == 0) {
                log.warn("No admin account exists. Set APP_ADMIN_USERNAME and APP_ADMIN_PASSWORD to create one.");
            }
            return;
        }
        if (repository.existsByUsernameIgnoreCase(username.trim())) {
            return;
        }
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw new IllegalStateException(
                    "APP_ADMIN_PASSWORD must be at least %d characters long.".formatted(MIN_PASSWORD_LENGTH));
        }
        AdminUser admin = new AdminUser();
        admin.setUsername(username.trim());
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(Role.ADMIN);
        repository.save(admin);
        log.info("Created admin account '{}'", admin.getUsername());
    }
}
