package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.SkillResponse;
import com.arigavincent.portfolio.entity.Skill;
import com.arigavincent.portfolio.mapper.SkillMapper;
import com.arigavincent.portfolio.repository.SkillRepository;
import org.springframework.stereotype.Service;

@Service
public class SkillService extends OrderedContentService<Skill, SkillResponse> {

    public SkillService(SkillRepository repository, SkillMapper mapper) {
        super(repository, mapper);
    }
}
