package com.arigavincent.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ServiceOfferingRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 2000) String description,
        @Size(max = 60) String iconKey,
        int sortOrder) {}
