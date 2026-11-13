package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.SkillCategory;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SkillRequest(
        @NotBlank @Size(max = 80) String name,
        @NotNull SkillCategory category,
        @Size(max = 200) String detail,
        @Size(max = 60) String iconKey,
        int sortOrder) {}
