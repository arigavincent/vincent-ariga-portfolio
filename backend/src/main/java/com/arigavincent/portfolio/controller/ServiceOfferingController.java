package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.ServiceOfferingResponse;
import com.arigavincent.portfolio.service.ServiceOfferingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Services")
@RestController
@RequestMapping("/api/services")
@RequiredArgsConstructor
public class ServiceOfferingController {

    private final ServiceOfferingService service;

    @Operation(summary = "List the services on offer in display order")
    @GetMapping
    public List<ServiceOfferingResponse> list() {
        return service.findAll();
    }
}
