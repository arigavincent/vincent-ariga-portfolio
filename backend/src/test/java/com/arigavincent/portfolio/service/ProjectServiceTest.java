package com.arigavincent.portfolio.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoMoreInteractions;
import static org.mockito.Mockito.when;

import com.arigavincent.portfolio.dto.ProjectResponse;
import com.arigavincent.portfolio.entity.Project;
import com.arigavincent.portfolio.entity.PublicationStatus;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.mapper.ProjectMapper;
import com.arigavincent.portfolio.repository.ProjectRepository;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository repository;

    @Mock
    private ProjectMapper mapper;

    @InjectMocks
    private ProjectService service;

    @Test
    void listsAllPublishedProjectsWhenNotFiltering() {
        Project project = new Project();
        ProjectResponse response = response("aj-stream");
        when(repository.findAllByStatusOrderBySortOrderAscIdAsc(PublicationStatus.PUBLISHED))
                .thenReturn(List.of(project));
        when(mapper.toResponse(project)).thenReturn(response);

        assertThat(service.findPublished(false)).containsExactly(response);
        verifyNoMoreInteractions(repository);
    }

    @Test
    void listsOnlyFeaturedPublishedProjectsWhenFiltering() {
        when(repository.findAllByStatusAndFeaturedTrueOrderBySortOrderAscIdAsc(PublicationStatus.PUBLISHED))
                .thenReturn(List.of());

        assertThat(service.findPublished(true)).isEmpty();
        verify(repository).findAllByStatusAndFeaturedTrueOrderBySortOrderAscIdAsc(PublicationStatus.PUBLISHED);
        verifyNoMoreInteractions(repository);
    }

    @Test
    void returnsAPublishedProjectBySlug() {
        Project project = new Project();
        ProjectResponse response = response("mpesa-tms");
        when(repository.findBySlugAndStatus("mpesa-tms", PublicationStatus.PUBLISHED))
                .thenReturn(Optional.of(project));
        when(mapper.toResponse(project)).thenReturn(response);

        assertThat(service.getPublishedBySlug("mpesa-tms")).isEqualTo(response);
    }

    @Test
    void rejectsAnUnknownOrUnpublishedSlug() {
        when(repository.findBySlugAndStatus("ghost", PublicationStatus.PUBLISHED))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.getPublishedBySlug("ghost"))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessage("Project 'ghost' was not found");
    }

    private static ProjectResponse response(String slug) {
        return new ProjectResponse(
                1L,
                slug,
                "Title",
                "Summary",
                "Description",
                "Category",
                List.of(),
                List.of(),
                null,
                null,
                null,
                true,
                PublicationStatus.PUBLISHED,
                1,
                null);
    }
}
