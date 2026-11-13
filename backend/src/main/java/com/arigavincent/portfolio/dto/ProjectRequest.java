package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.PublicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record ProjectRequest(
        @NotBlank @Size(max = 120) @Pattern(regexp = Patterns.SLUG, message = Patterns.SLUG_MESSAGE)
        String slug,

        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 400) String summary,
        @NotBlank @Size(max = 8000) String description,
        @NotBlank @Size(max = 80) String category,
        @NotNull @Size(max = 30) List<@NotBlank @Size(max = 80) String> techStack,
        @NotNull @Size(max = 30) List<@NotBlank @Size(max = 300) String> highlights,
        @Size(max = 500) String coverImageUrl,

        @Size(max = 500) @Pattern(regexp = Patterns.HTTP_URL, message = Patterns.HTTP_URL_MESSAGE)
        String repoUrl,

        @Size(max = 500) @Pattern(regexp = Patterns.HTTP_URL, message = Patterns.HTTP_URL_MESSAGE)
        String liveUrl,

        boolean featured,
        @NotNull PublicationStatus status,
        int sortOrder) {}
