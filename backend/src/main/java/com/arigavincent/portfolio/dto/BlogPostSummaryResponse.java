package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.PublicationStatus;
import java.time.Instant;
import java.util.List;

/** A blog post without its body, for list views. */
public record BlogPostSummaryResponse(
        Long id,
        String slug,
        String title,
        String excerpt,
        String coverImageUrl,
        List<String> tags,
        PublicationStatus status,
        Instant publishedAt,
        Instant updatedAt) {}
