package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.BlogPostRequest;
import com.arigavincent.portfolio.dto.BlogPostResponse;
import com.arigavincent.portfolio.dto.BlogPostSummaryResponse;
import com.arigavincent.portfolio.entity.BlogPost;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper
public interface BlogPostMapper extends CrudMapper<BlogPost, BlogPostRequest, BlogPostResponse> {

    BlogPostSummaryResponse toSummary(BlogPost entity);

    @Override
    @Mapping(target = "publishedAt", ignore = true)
    BlogPost toEntity(BlogPostRequest request);

    @Override
    @Mapping(target = "publishedAt", ignore = true)
    void updateEntity(BlogPostRequest request, @MappingTarget BlogPost entity);
}
