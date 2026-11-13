package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.SiteSettingsRequest;
import com.arigavincent.portfolio.dto.SiteSettingsResponse;
import com.arigavincent.portfolio.entity.SiteSettings;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.mapper.SiteSettingsMapper;
import com.arigavincent.portfolio.repository.SiteSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SiteSettingsService {

    private final SiteSettingsRepository repository;
    private final SiteSettingsMapper mapper;

    @Transactional(readOnly = true)
    public SiteSettingsResponse get() {
        return mapper.toResponse(find());
    }

    @Transactional
    public SiteSettingsResponse update(SiteSettingsRequest request) {
        SiteSettings settings = find();
        mapper.updateEntity(request, settings);
        return mapper.toResponse(repository.saveAndFlush(settings));
    }

    SiteSettings find() {
        return repository
                .findById(SiteSettings.SINGLETON_ID)
                .orElseThrow(() -> new ResourceNotFoundException("Site settings", "default"));
    }
}
