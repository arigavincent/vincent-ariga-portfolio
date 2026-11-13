package com.arigavincent.portfolio.dto;

import java.time.LocalDate;

public record ExperienceResponse(
        Long id,
        String title,
        String organization,
        String location,
        LocalDate startDate,
        LocalDate endDate,
        boolean current,
        String description,
        int sortOrder) {}
