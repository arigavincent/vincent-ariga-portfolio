package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.SiteSettingsRequest;
import com.arigavincent.portfolio.dto.SiteSettingsResponse;
import com.arigavincent.portfolio.entity.SiteSettings;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper
public interface SiteSettingsMapper extends ResponseMapper<SiteSettings, SiteSettingsResponse> {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "cvFileKey", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(SiteSettingsRequest request, @MappingTarget SiteSettings entity);
}
