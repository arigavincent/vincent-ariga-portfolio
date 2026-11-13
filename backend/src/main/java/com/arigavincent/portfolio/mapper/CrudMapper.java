package com.arigavincent.portfolio.mapper;

import org.mapstruct.MappingTarget;

/** Maps a write request onto a new or existing entity, and the entity back to its response. */
public interface CrudMapper<E, Q, R> extends ResponseMapper<E, R> {

    E toEntity(Q request);

    void updateEntity(Q request, @MappingTarget E entity);
}
