package com.arigavincent.portfolio.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import java.time.Instant;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "admin_users")
public class AdminUser extends BaseEntity {

    @Column(nullable = false, unique = true, length = 80)
    private String username;

    @Column(nullable = false, length = 100)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role = Role.ADMIN;

    @Column(nullable = false)
    private boolean enabled = true;

    private Instant lastLoginAt;
}
