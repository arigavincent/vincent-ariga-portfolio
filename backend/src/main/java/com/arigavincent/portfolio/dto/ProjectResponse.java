package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.PublicationStatus;
import java.time.Instant;
import java.util.List;

public record ProjectResponse(
        Long id,
        String slug,
        String title,
        String summary,
        String description,
        String category,
        List<String> techStack,
        List<String> highlights,
        String coverImageUrl,
        String repoUrl,
        String liveUrl,
        boolean featured,
        PublicationStatus status,
        int sortOrder,
        Instant updatedAt) {}
