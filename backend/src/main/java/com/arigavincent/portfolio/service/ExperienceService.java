package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.ExperienceRequest;
import com.arigavincent.portfolio.dto.ExperienceResponse;
import com.arigavincent.portfolio.entity.Experience;
import com.arigavincent.portfolio.mapper.ExperienceMapper;
import com.arigavincent.portfolio.repository.ExperienceRepository;
import org.springframework.stereotype.Service;

@Service
public class ExperienceService extends CrudService<Experience, ExperienceRequest, ExperienceResponse> {

    public ExperienceService(ExperienceRepository repository, ExperienceMapper mapper) {
        super(repository, mapper, "Experience", DISPLAY_ORDER);
    }
}
