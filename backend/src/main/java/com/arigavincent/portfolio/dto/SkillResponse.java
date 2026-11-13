package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.SkillCategory;

public record SkillResponse(
        Long id, String name, SkillCategory category, String detail, String iconKey, int sortOrder) {}
