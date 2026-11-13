package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.entity.OrderedEntity;
import com.arigavincent.portfolio.mapper.ResponseMapper;
import com.arigavincent.portfolio.repository.OrderedRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;

/** Shared read logic for hand-ordered content (skills, experience, education, services). */
@RequiredArgsConstructor
public abstract class OrderedContentService<E extends OrderedEntity, R> {

    private final OrderedRepository<E> repository;
    private final ResponseMapper<E, R> mapper;

    @Transactional(readOnly = true)
    public List<R> findAll() {
        return repository.findAllByOrderBySortOrderAscIdAsc().stream()
                .map(mapper::toResponse)
                .toList();
    }
}
