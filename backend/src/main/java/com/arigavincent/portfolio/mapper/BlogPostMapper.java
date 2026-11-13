package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.BlogPostResponse;
import com.arigavincent.portfolio.dto.BlogPostSummaryResponse;
import com.arigavincent.portfolio.entity.BlogPost;
import org.mapstruct.Mapper;

@Mapper
public interface BlogPostMapper extends ResponseMapper<BlogPost, BlogPostResponse> {

    BlogPostSummaryResponse toSummary(BlogPost entity);
}
