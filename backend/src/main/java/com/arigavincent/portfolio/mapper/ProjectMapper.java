package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.ProjectRequest;
import com.arigavincent.portfolio.dto.ProjectResponse;
import com.arigavincent.portfolio.entity.Project;
import org.mapstruct.Mapper;

@Mapper
public interface ProjectMapper extends CrudMapper<Project, ProjectRequest, ProjectResponse> {}
