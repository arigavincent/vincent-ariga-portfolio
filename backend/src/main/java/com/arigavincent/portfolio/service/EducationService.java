package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.EducationRequest;
import com.arigavincent.portfolio.dto.EducationResponse;
import com.arigavincent.portfolio.entity.Education;
import com.arigavincent.portfolio.mapper.EducationMapper;
import com.arigavincent.portfolio.repository.EducationRepository;
import org.springframework.stereotype.Service;

@Service
public class EducationService extends CrudService<Education, EducationRequest, EducationResponse> {

    public EducationService(EducationRepository repository, EducationMapper mapper) {
        super(repository, mapper, "Education", DISPLAY_ORDER);
    }
}
