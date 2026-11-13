package com.arigavincent.portfolio.repository;

import com.arigavincent.portfolio.entity.BlogPost;
import com.arigavincent.portfolio.entity.PublicationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BlogPostRepository extends JpaRepository<BlogPost, Long>, SlugRepository {

    List<BlogPost> findAllByStatusOrderByPublishedAtDescIdDesc(PublicationStatus status);

    Optional<BlogPost> findBySlugAndStatus(String slug, PublicationStatus status);
}
