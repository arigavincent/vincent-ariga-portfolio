package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.SiteSettingsResponse;
import com.arigavincent.portfolio.entity.SiteSettings;
import org.mapstruct.Mapper;

@Mapper
public interface SiteSettingsMapper extends ResponseMapper<SiteSettings, SiteSettingsResponse> {}
