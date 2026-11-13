package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.ProjectRequest;
import com.arigavincent.portfolio.dto.ProjectResponse;
import com.arigavincent.portfolio.entity.Project;
import com.arigavincent.portfolio.entity.PublicationStatus;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.mapper.ProjectMapper;
import com.arigavincent.portfolio.repository.ProjectRepository;
import java.util.List;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService extends CrudService<Project, ProjectRequest, ProjectResponse> {

    private final ProjectRepository repository;
    private final ProjectMapper mapper;

    public ProjectService(ProjectRepository repository, ProjectMapper mapper) {
        super(repository, mapper, "Project", DISPLAY_ORDER);
        this.repository = repository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ProjectResponse> findPublished(boolean featuredOnly) {
        List<Project> projects = featuredOnly
                ? repository.findAllByStatusAndFeaturedTrueOrderBySortOrderAscIdAsc(PublicationStatus.PUBLISHED)
                : repository.findAllByStatusOrderBySortOrderAscIdAsc(PublicationStatus.PUBLISHED);
        return projects.stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProjectResponse getPublishedBySlug(String slug) {
        return repository
                .findBySlugAndStatus(slug, PublicationStatus.PUBLISHED)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Project", slug));
    }

    @Override
    protected void validate(ProjectRequest request, @Nullable Long existingId) {
        requireUniqueSlug(repository, request.slug(), existingId);
    }
}
