package com.arigavincent.portfolio.dto;

import java.util.List;
import org.springframework.data.domain.Page;

/** A stable, minimal page envelope (Spring's own Page JSON is not a supported contract). */
public record PageResponse<T>(List<T> content, int page, int size, long totalElements, int totalPages) {

    public static <T> PageResponse<T> of(Page<T> page) {
        return new PageResponse<>(
                page.getContent(), page.getNumber(), page.getSize(), page.getTotalElements(), page.getTotalPages());
    }
}
