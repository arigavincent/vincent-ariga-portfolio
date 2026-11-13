package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.ServiceOfferingResponse;
import com.arigavincent.portfolio.entity.ServiceOffering;
import com.arigavincent.portfolio.mapper.ServiceOfferingMapper;
import com.arigavincent.portfolio.repository.ServiceOfferingRepository;
import org.springframework.stereotype.Service;

@Service
public class ServiceOfferingService extends OrderedContentService<ServiceOffering, ServiceOfferingResponse> {

    public ServiceOfferingService(ServiceOfferingRepository repository, ServiceOfferingMapper mapper) {
        super(repository, mapper);
    }
}
