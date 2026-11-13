package com.arigavincent.portfolio.dto;

public record EducationResponse(
        Long id,
        String institution,
        String qualification,
        String grade,
        Integer startYear,
        Integer endYear,
        String description,
        int sortOrder) {}
