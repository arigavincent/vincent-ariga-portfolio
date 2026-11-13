package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.service.CvService;
import com.arigavincent.portfolio.service.CvService.CvDownload;
import com.arigavincent.portfolio.storage.FileType;
import com.arigavincent.portfolio.storage.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Files")
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class FileController {

    private final StorageService storage;
    private final CvService cvService;

    @Operation(summary = "Serve an uploaded file by its storage key")
    @GetMapping("/files/{key}")
    public ResponseEntity<Resource> file(@PathVariable String key) {
        FileType type = FileType.fromExtension(StringUtils.getFilenameExtension(key))
                .orElseThrow(() -> new ResourceNotFoundException("File", key));
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(type.getContentType()))
                .cacheControl(
                        CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
                .body(storage.load(key));
    }

    @Operation(summary = "Download the CV as a PDF")
    @GetMapping("/cv")
    public ResponseEntity<Resource> cv() {
        CvDownload download = cvService.current();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .cacheControl(CacheControl.noCache())
                .header(
                        HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment()
                                .filename(download.fileName())
                                .build()
                                .toString())
                .body(download.resource());
    }
}
