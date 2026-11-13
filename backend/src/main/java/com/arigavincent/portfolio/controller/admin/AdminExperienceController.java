package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.ExperienceRequest;
import com.arigavincent.portfolio.dto.ExperienceResponse;
import com.arigavincent.portfolio.service.ExperienceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Experience")
@RestController
@RequestMapping("/api/admin/experience")
public class AdminExperienceController extends CrudController<ExperienceRequest, ExperienceResponse> {

    public AdminExperienceController(ExperienceService service) {
        super(service);
    }
}
