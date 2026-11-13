package com.arigavincent.portfolio.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ExperienceRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 160) String organization,
        @Size(max = 160) String location,
        LocalDate startDate,
        LocalDate endDate,
        boolean current,
        @NotBlank @Size(max = 4000) String description,
        int sortOrder) {}
