package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.ServiceOfferingRequest;
import com.arigavincent.portfolio.dto.ServiceOfferingResponse;
import com.arigavincent.portfolio.service.ServiceOfferingService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Services")
@RestController
@RequestMapping("/api/admin/services")
public class AdminServiceController extends CrudController<ServiceOfferingRequest, ServiceOfferingResponse> {

    public AdminServiceController(ServiceOfferingService service) {
        super(service);
    }
}
