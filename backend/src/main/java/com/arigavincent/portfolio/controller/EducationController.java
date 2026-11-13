package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.EducationResponse;
import com.arigavincent.portfolio.service.EducationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Education")
@RestController
@RequestMapping("/api/education")
@RequiredArgsConstructor
public class EducationController {

    private final EducationService service;

    @Operation(summary = "List education in display order")
    @GetMapping
    public List<EducationResponse> list() {
        return service.findAll();
    }
}
