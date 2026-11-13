package com.arigavincent.portfolio.exception;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resource, Object identifier) {
        super("%s '%s' was not found".formatted(resource, identifier));
    }
}
