package com.arigavincent.portfolio.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;

/** The one error shape every endpoint returns. */
public record ApiError(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path,
        @JsonInclude(JsonInclude.Include.NON_EMPTY) List<FieldViolation> fieldErrors) {

    public record FieldViolation(String field, String message) {}

    public static ApiError of(HttpStatusCode status, String message, String path) {
        return of(status, message, path, List.of());
    }

    public static ApiError of(HttpStatusCode status, String message, String path, List<FieldViolation> violations) {
        HttpStatus resolved = HttpStatus.resolve(status.value());
        String reason = resolved != null ? resolved.getReasonPhrase() : "Error";
        return new ApiError(Instant.now(), status.value(), reason, message, path, violations);
    }
}
