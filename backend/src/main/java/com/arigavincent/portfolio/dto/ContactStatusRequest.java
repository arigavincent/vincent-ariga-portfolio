package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.ContactStatus;
import jakarta.validation.constraints.NotNull;

public record ContactStatusRequest(@NotNull ContactStatus status) {}
