package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.UploadResponse;
import com.arigavincent.portfolio.service.CvService;
import com.arigavincent.portfolio.service.UploadService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@Tag(name = "Admin: Uploads")
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminUploadController {

    private final UploadService uploadService;
    private final CvService cvService;

    @Operation(summary = "Upload an image (JPEG, PNG, WebP, GIF or AVIF) and get its URL")
    @PostMapping(path = "/uploads", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public UploadResponse uploadImage(@RequestPart("file") MultipartFile file) {
        return uploadService.storeImage(file);
    }

    @Operation(summary = "Replace the downloadable CV with a new PDF")
    @PostMapping(path = "/cv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UploadResponse replaceCv(@RequestPart("file") MultipartFile file) {
        return cvService.replace(file);
    }
}
