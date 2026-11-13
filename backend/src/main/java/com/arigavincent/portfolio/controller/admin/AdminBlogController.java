package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.BlogPostRequest;
import com.arigavincent.portfolio.dto.BlogPostResponse;
import com.arigavincent.portfolio.service.BlogPostService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Blog")
@RestController
@RequestMapping("/api/admin/blog")
public class AdminBlogController extends CrudController<BlogPostRequest, BlogPostResponse> {

    public AdminBlogController(BlogPostService service) {
        super(service);
    }
}
