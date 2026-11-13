package com.arigavincent.portfolio.exception;

import java.time.Duration;
import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class RateLimitExceededException extends ApiException {

    private final Duration retryAfter;

    public RateLimitExceededException(Duration retryAfter) {
        super(HttpStatus.TOO_MANY_REQUESTS, "Too many requests. Please wait a moment and try again.");
        this.retryAfter = retryAfter;
    }
}
