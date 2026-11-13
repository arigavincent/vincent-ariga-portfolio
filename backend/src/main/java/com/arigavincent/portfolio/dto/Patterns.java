package com.arigavincent.portfolio.dto;

/** Validation patterns shared by request DTOs. */
final class Patterns {

    static final String SLUG = "^[a-z0-9]+(?:-[a-z0-9]+)*$";
    static final String SLUG_MESSAGE = "Use lowercase letters, numbers and single hyphens, like my-project";

    static final String HTTP_URL = "^https?://\\S+$";
    static final String HTTP_URL_MESSAGE = "Must be a full URL starting with http:// or https://";

    private Patterns() {}
}
