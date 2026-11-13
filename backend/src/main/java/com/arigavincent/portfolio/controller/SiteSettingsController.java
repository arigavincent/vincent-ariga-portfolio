package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.SiteSettingsResponse;
import com.arigavincent.portfolio.service.SiteSettingsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Settings")
@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SiteSettingsController {

    private final SiteSettingsService service;

    @Operation(summary = "Get the profile and site-wide copy")
    @GetMapping
    public SiteSettingsResponse get() {
        return service.get();
    }
}
