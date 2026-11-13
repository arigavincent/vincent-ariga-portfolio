package com.arigavincent.portfolio.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/** A failure with a known HTTP status and a message that is safe to show to the client. */
@Getter
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String message) {
        super(message);
        this.status = status;
    }
}
