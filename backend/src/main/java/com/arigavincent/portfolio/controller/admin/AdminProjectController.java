package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.ProjectRequest;
import com.arigavincent.portfolio.dto.ProjectResponse;
import com.arigavincent.portfolio.service.ProjectService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Projects")
@RestController
@RequestMapping("/api/admin/projects")
public class AdminProjectController extends CrudController<ProjectRequest, ProjectResponse> {

    public AdminProjectController(ProjectService service) {
        super(service);
    }
}
