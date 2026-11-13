package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.UploadResponse;
import com.arigavincent.portfolio.entity.SiteSettings;
import com.arigavincent.portfolio.storage.StorageService;
import com.arigavincent.portfolio.storage.StoredFile;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

/** The downloadable CV: the uploaded PDF when there is one, otherwise the bundled placeholder. */
@Service
@RequiredArgsConstructor
public class CvService {

    private static final String PLACEHOLDER = "cv/cv-placeholder.pdf";

    private final SiteSettingsService settingsService;
    private final UploadService uploadService;
    private final StorageService storage;

    public record CvDownload(Resource resource, String fileName) {}

    @Transactional(readOnly = true)
    public CvDownload current() {
        SiteSettings settings = settingsService.find();
        Resource resource = StringUtils.hasText(settings.getCvFileKey())
                ? storage.load(settings.getCvFileKey())
                : new ClassPathResource(PLACEHOLDER);
        String fileName = settings.getDisplayName().trim().replaceAll("[^A-Za-z0-9]+", "-") + "-CV.pdf";
        return new CvDownload(resource, fileName);
    }

    @Transactional
    public UploadResponse replace(MultipartFile file) {
        StoredFile stored = uploadService.storePdf(file);
        SiteSettings settings = settingsService.find();
        String previousKey = settings.getCvFileKey();
        settings.setCvFileKey(stored.key());
        if (StringUtils.hasText(previousKey)) {
            storage.delete(previousKey);
        }
        return UploadService.toResponse(stored);
    }
}
