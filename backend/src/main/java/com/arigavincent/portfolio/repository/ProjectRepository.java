package com.arigavincent.portfolio.repository;

import com.arigavincent.portfolio.entity.Project;
import com.arigavincent.portfolio.entity.PublicationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long>, SlugRepository {

    List<Project> findAllByStatusOrderBySortOrderAscIdAsc(PublicationStatus status);

    List<Project> findAllByStatusAndFeaturedTrueOrderBySortOrderAscIdAsc(PublicationStatus status);

    Optional<Project> findBySlugAndStatus(String slug, PublicationStatus status);
}
