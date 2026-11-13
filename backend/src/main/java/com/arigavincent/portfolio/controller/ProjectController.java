package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.ProjectResponse;
import com.arigavincent.portfolio.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Projects")
@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService service;

    @Operation(summary = "List published projects, optionally only the featured ones")
    @GetMapping
    public List<ProjectResponse> list(@RequestParam(defaultValue = "false") boolean featured) {
        return service.findPublished(featured);
    }

    @Operation(summary = "Get one published project by its slug")
    @GetMapping("/{slug}")
    public ProjectResponse get(@PathVariable String slug) {
        return service.getPublishedBySlug(slug);
    }
}
