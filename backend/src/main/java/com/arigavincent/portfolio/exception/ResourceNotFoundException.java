package com.arigavincent.portfolio.exception;

import org.springframework.http.HttpStatus;

public class ResourceNotFoundException extends ApiException {

    public ResourceNotFoundException(String resource, Object identifier) {
        super(HttpStatus.NOT_FOUND, "%s '%s' was not found".formatted(resource, identifier));
    }
}
