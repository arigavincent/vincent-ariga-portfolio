package com.arigavincent.portfolio.mapper;

/** Maps an entity to the DTO returned by the API. */
public interface ResponseMapper<E, R> {

    R toResponse(E entity);
}
