package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.SkillRequest;
import com.arigavincent.portfolio.dto.SkillResponse;
import com.arigavincent.portfolio.entity.Skill;
import org.mapstruct.Mapper;

@Mapper
public interface SkillMapper extends CrudMapper<Skill, SkillRequest, SkillResponse> {}
