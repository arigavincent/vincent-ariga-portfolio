package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.PublicationStatus;
import java.time.Instant;
import java.util.List;

public record BlogPostResponse(
        Long id,
        String slug,
        String title,
        String excerpt,
        String content,
        String coverImageUrl,
        List<String> tags,
        PublicationStatus status,
        Instant publishedAt,
        Instant updatedAt) {}
