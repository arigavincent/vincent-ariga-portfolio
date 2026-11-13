package com.arigavincent.portfolio.service;

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
@Transactional(readOnly = true)
public class SiteSettingsService {

    private final SiteSettingsRepository repository;
    private final SiteSettingsMapper mapper;

    public SiteSettingsResponse get() {
        return repository
                .findById(SiteSettings.SINGLETON_ID)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Site settings", "default"));
    }
}
