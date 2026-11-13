package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.SiteSettingsRequest;
import com.arigavincent.portfolio.dto.SiteSettingsResponse;
import com.arigavincent.portfolio.service.SiteSettingsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Settings")
@RestController
@RequestMapping("/api/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SiteSettingsService service;

    @GetMapping
    public SiteSettingsResponse get() {
        return service.get();
    }

    @PutMapping
    public SiteSettingsResponse update(@Valid @RequestBody SiteSettingsRequest request) {
        return service.update(request);
    }
}
