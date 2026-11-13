package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.SkillResponse;
import com.arigavincent.portfolio.service.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Skills")
@RestController
@RequestMapping("/api/skills")
@RequiredArgsConstructor
public class SkillController {

    private final SkillService service;

    @Operation(summary = "List skills in display order")
    @GetMapping
    public List<SkillResponse> list() {
        return service.findAll();
    }
}
