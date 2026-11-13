package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.BlogPostRequest;
import com.arigavincent.portfolio.dto.BlogPostResponse;
import com.arigavincent.portfolio.dto.BlogPostSummaryResponse;
import com.arigavincent.portfolio.entity.BlogPost;
import com.arigavincent.portfolio.entity.PublicationStatus;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.mapper.BlogPostMapper;
import com.arigavincent.portfolio.repository.BlogPostRepository;
import java.time.Clock;
import java.util.List;
import org.springframework.data.domain.Sort;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BlogPostService extends CrudService<BlogPost, BlogPostRequest, BlogPostResponse> {

    private final BlogPostRepository repository;
    private final BlogPostMapper mapper;
    private final Clock clock;

    public BlogPostService(BlogPostRepository repository, BlogPostMapper mapper, Clock clock) {
        super(repository, mapper, "Blog post", Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        this.repository = repository;
        this.mapper = mapper;
        this.clock = clock;
    }

    @Transactional(readOnly = true)
    public List<BlogPostSummaryResponse> findPublished() {
        return repository.findAllByStatusOrderByPublishedAtDescIdDesc(PublicationStatus.PUBLISHED).stream()
                .map(mapper::toSummary)
                .toList();
    }

    @Transactional(readOnly = true)
    public BlogPostResponse getPublishedBySlug(String slug) {
        return repository
                .findBySlugAndStatus(slug, PublicationStatus.PUBLISHED)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post", slug));
    }

    @Override
    protected void validate(BlogPostRequest request, @Nullable Long existingId) {
        requireUniqueSlug(repository, request.slug(), existingId);
    }

    /** Stamps the first publication time; later edits and unpublishing keep it. */
    @Override
    protected void beforeSave(BlogPost post) {
        if (post.getStatus() == PublicationStatus.PUBLISHED && post.getPublishedAt() == null) {
            post.setPublishedAt(clock.instant());
        }
    }
}
