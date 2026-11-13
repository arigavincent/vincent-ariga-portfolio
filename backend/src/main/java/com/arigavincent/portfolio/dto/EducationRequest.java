package com.arigavincent.portfolio.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record EducationRequest(
        @NotBlank @Size(max = 200) String institution,
        @NotBlank @Size(max = 200) String qualification,
        @Size(max = 120) String grade,
        @Min(1950) @Max(2100) Integer startYear,
        @Min(1950) @Max(2100) Integer endYear,
        @Size(max = 2000) String description,
        int sortOrder) {}
