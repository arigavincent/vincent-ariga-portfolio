package com.arigavincent.portfolio.dto;

import com.arigavincent.portfolio.entity.PublicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.util.List;

public record BlogPostRequest(
        @NotBlank @Size(max = 160) @Pattern(regexp = Patterns.SLUG, message = Patterns.SLUG_MESSAGE)
        String slug,

        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 600) String excerpt,
        @NotBlank @Size(max = 200000) String content,
        @Size(max = 500) String coverImageUrl,
        @NotNull @Size(max = 12) List<@NotBlank @Size(max = 60) String> tags,
        @NotNull PublicationStatus status) {}
