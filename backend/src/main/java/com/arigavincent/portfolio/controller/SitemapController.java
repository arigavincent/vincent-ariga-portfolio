package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.service.SitemapService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "SEO")
@RestController
@RequiredArgsConstructor
public class SitemapController {

    private final SitemapService service;

    @Operation(summary = "The sitemap, served to crawlers as /sitemap.xml through the site's rewrite")
    @GetMapping(path = "/api/sitemap.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> sitemap() {
        return ResponseEntity.ok()
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePublic())
                .body(service.render());
    }
}
