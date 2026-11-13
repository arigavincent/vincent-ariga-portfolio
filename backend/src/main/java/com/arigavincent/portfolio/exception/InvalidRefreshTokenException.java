package com.arigavincent.portfolio.exception;

import org.springframework.http.HttpStatus;

public class InvalidRefreshTokenException extends ApiException {

    public InvalidRefreshTokenException() {
        super(HttpStatus.UNAUTHORIZED, "Your session has expired. Please sign in again.");
    }
}
