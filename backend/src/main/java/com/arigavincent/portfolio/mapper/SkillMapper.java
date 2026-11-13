package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.SkillResponse;
import com.arigavincent.portfolio.entity.Skill;
import org.mapstruct.Mapper;

@Mapper
public interface SkillMapper extends ResponseMapper<Skill, SkillResponse> {}
