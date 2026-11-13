package com.arigavincent.portfolio.dto;

import java.time.Instant;

public record SiteSettingsResponse(
        String displayName,
        String brandMark,
        String role,
        String headline,
        String tagline,
        String bio,
        String heritageNote,
        String location,
        String availability,
        String email,
        String phoneDisplay,
        String whatsappNumber,
        String githubUrl,
        String footerLine,
        String seoTitle,
        String seoDescription,
        Instant updatedAt) {}
