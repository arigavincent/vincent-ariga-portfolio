package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.ProjectResponse;
import com.arigavincent.portfolio.entity.Project;
import com.arigavincent.portfolio.entity.PublicationStatus;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.mapper.ProjectMapper;
import com.arigavincent.portfolio.repository.ProjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProjectService {

    private final ProjectRepository repository;
    private final ProjectMapper mapper;

    public List<ProjectResponse> findPublished(boolean featuredOnly) {
        List<Project> projects = featuredOnly
                ? repository.findAllByStatusAndFeaturedTrueOrderBySortOrderAscIdAsc(PublicationStatus.PUBLISHED)
                : repository.findAllByStatusOrderBySortOrderAscIdAsc(PublicationStatus.PUBLISHED);
        return projects.stream().map(mapper::toResponse).toList();
    }

    public ProjectResponse getPublishedBySlug(String slug) {
        return repository
                .findBySlugAndStatus(slug, PublicationStatus.PUBLISHED)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Project", slug));
    }
}
