package com.arigavincent.portfolio.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record SiteSettingsRequest(
        @NotBlank @Size(max = 120) String displayName,
        @NotBlank @Size(max = 40) String brandMark,
        @NotBlank @Size(max = 160) String role,
        @NotBlank @Size(max = 240) String headline,
        @NotBlank @Size(max = 160) String tagline,
        @NotBlank @Size(max = 4000) String bio,
        @Size(max = 400) String heritageNote,
        @NotBlank @Size(max = 160) String location,
        @NotBlank @Size(max = 300) String availability,
        @NotBlank @Email @Size(max = 200) String email,
        @NotBlank @Size(max = 40) String phoneDisplay,

        @NotBlank @Pattern(regexp = "^[0-9]{8,15}$", message = "Digits only, with country code, like 254718569004")
        String whatsappNumber,

        @NotBlank @Size(max = 300) @Pattern(regexp = Patterns.HTTP_URL, message = Patterns.HTTP_URL_MESSAGE)
        String githubUrl,

        @NotBlank @Size(max = 200) String footerLine,
        @NotBlank @Size(max = 200) String seoTitle,
        @NotBlank @Size(max = 400) String seoDescription) {}
