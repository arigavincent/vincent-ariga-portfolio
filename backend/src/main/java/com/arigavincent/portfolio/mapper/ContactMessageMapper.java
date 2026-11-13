package com.arigavincent.portfolio.mapper;

import com.arigavincent.portfolio.dto.ContactMessageResponse;
import com.arigavincent.portfolio.dto.ContactRequest;
import com.arigavincent.portfolio.entity.ContactMessage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper
public interface ContactMessageMapper extends ResponseMapper<ContactMessage, ContactMessageResponse> {

    @Mapping(target = "status", ignore = true)
    ContactMessage toEntity(ContactRequest request);
}
