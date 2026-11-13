package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.ContactStatus;
import java.time.Instant;

public record ContactMessageResponse(
        Long id, String name, String email, String subject, String message, ContactStatus status, Instant createdAt) {}
