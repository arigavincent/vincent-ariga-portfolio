package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.ExperienceResponse;
import com.arigavincent.portfolio.entity.Experience;
import org.mapstruct.Mapper;

@Mapper
public interface ExperienceMapper extends ResponseMapper<Experience, ExperienceResponse> {}
