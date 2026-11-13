package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.ExperienceResponse;
import com.arigavincent.portfolio.service.ExperienceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Experience")
@RestController
@RequestMapping("/api/experience")
@RequiredArgsConstructor
public class ExperienceController {

    private final ExperienceService service;

    @Operation(summary = "List work experience in display order")
    @GetMapping
    public List<ExperienceResponse> list() {
        return service.findAll();
    }
}
