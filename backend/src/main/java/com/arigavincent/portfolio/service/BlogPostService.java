package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.BlogPostResponse;
import com.arigavincent.portfolio.dto.BlogPostSummaryResponse;
import com.arigavincent.portfolio.entity.PublicationStatus;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.mapper.BlogPostMapper;
import com.arigavincent.portfolio.repository.BlogPostRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BlogPostService {

    private final BlogPostRepository repository;
    private final BlogPostMapper mapper;

    public List<BlogPostSummaryResponse> findPublished() {
        return repository.findAllByStatusOrderByPublishedAtDescIdDesc(PublicationStatus.PUBLISHED).stream()
                .map(mapper::toSummary)
                .toList();
    }

    public BlogPostResponse getPublishedBySlug(String slug) {
        return repository
                .findBySlugAndStatus(slug, PublicationStatus.PUBLISHED)
                .map(mapper::toResponse)
                .orElseThrow(() -> new ResourceNotFoundException("Blog post", slug));
    }
}
