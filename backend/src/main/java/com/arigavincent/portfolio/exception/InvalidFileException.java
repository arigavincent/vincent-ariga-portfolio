package com.arigavincent.portfolio.exception;

import org.springframework.http.HttpStatus;

public class InvalidFileException extends ApiException {

    public InvalidFileException(HttpStatus status, String message) {
        super(status, message);
    }
}
