package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.SkillRequest;
import com.arigavincent.portfolio.dto.SkillResponse;
import com.arigavincent.portfolio.service.SkillService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Skills")
@RestController
@RequestMapping("/api/admin/skills")
public class AdminSkillController extends CrudController<SkillRequest, SkillResponse> {

    public AdminSkillController(SkillService service) {
        super(service);
    }
}
