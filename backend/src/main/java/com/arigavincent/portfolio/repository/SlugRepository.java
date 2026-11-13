package com.arigavincent.portfolio.repository;

/** Slug uniqueness lookups shared by slug-addressed content. */
public interface SlugRepository {

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
