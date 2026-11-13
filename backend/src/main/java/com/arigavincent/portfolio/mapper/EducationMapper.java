package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.EducationResponse;
import com.arigavincent.portfolio.entity.Education;
import org.mapstruct.Mapper;

@Mapper
public interface EducationMapper extends ResponseMapper<Education, EducationResponse> {}
