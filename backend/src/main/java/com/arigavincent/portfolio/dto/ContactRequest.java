package com.arigavincent.portfolio.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactRequest(
        @NotBlank(message = "Please tell me your name") @Size(max = 120)
        String name,

        @NotBlank(message = "Please add an email so I can reply")
        @Email(message = "That email address does not look right")
        @Size(max = 200)
        String email,

        @Size(max = 200) String subject,

        @NotBlank(message = "Please write a message")
        @Size(min = 10, max = 5000, message = "Messages need to be between 10 and 5000 characters")
        String message,

        @Schema(description = "Honeypot. Real people leave this empty; bots fill it in.")
        String website) {}
