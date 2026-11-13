package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.EducationRequest;
import com.arigavincent.portfolio.dto.EducationResponse;
import com.arigavincent.portfolio.service.EducationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Education")
@RestController
@RequestMapping("/api/admin/education")
public class AdminEducationController extends CrudController<EducationRequest, EducationResponse> {

    public AdminEducationController(EducationService service) {
        super(service);
    }
}
