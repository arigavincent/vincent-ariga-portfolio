package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.BlogPostResponse;
import com.arigavincent.portfolio.dto.BlogPostSummaryResponse;
import com.arigavincent.portfolio.service.BlogPostService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Blog")
@RestController
@RequestMapping("/api/blog")
@RequiredArgsConstructor
public class BlogController {

    private final BlogPostService service;

    @Operation(summary = "List published posts, newest first, without their bodies")
    @GetMapping
    public List<BlogPostSummaryResponse> list() {
        return service.findPublished();
    }

    @Operation(summary = "Get one published post by its slug")
    @GetMapping("/{slug}")
    public BlogPostResponse get(@PathVariable String slug) {
        return service.getPublishedBySlug(slug);
    }
}
