package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.ExperienceRequest;
import com.arigavincent.portfolio.dto.ExperienceResponse;
import com.arigavincent.portfolio.entity.Experience;
import org.mapstruct.Mapper;

@Mapper
public interface ExperienceMapper extends CrudMapper<Experience, ExperienceRequest, ExperienceResponse> {}
