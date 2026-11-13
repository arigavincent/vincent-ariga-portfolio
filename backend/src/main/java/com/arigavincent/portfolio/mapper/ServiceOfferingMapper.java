package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.ServiceOfferingRequest;
import com.arigavincent.portfolio.dto.ServiceOfferingResponse;
import com.arigavincent.portfolio.entity.ServiceOffering;
import org.mapstruct.Mapper;

@Mapper
public interface ServiceOfferingMapper
        extends CrudMapper<ServiceOffering, ServiceOfferingRequest, ServiceOfferingResponse> {}
