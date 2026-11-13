package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.exception.ConflictException;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.mapper.CrudMapper;
import com.arigavincent.portfolio.repository.SlugRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.Nullable;
import org.springframework.transaction.annotation.Transactional;

/**
 * List, read, create, update and delete for one content type. Subclasses supply the repository,
 * mapper and ordering, and may hook into {@link #validate} and {@link #beforeSave}.
 *
 * @param <E> entity
 * @param <Q> write request
 * @param <R> response
 */
@RequiredArgsConstructor
public abstract class CrudService<E, Q, R> {

    /** Display order for hand-ordered content. */
    protected static final Sort DISPLAY_ORDER = Sort.by("sortOrder", "id");

    private final JpaRepository<E, Long> repository;
    private final CrudMapper<E, Q, R> mapper;
    private final String resourceName;
    private final Sort sort;

    @Transactional(readOnly = true)
    public List<R> findAll() {
        return repository.findAll(sort).stream().map(mapper::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public R get(Long id) {
        return mapper.toResponse(find(id));
    }

    @Transactional
    public R create(Q request) {
        validate(request, null);
        E entity = mapper.toEntity(request);
        beforeSave(entity);
        return mapper.toResponse(repository.saveAndFlush(entity));
    }

    @Transactional
    public R update(Long id, Q request) {
        E entity = find(id);
        validate(request, id);
        mapper.updateEntity(request, entity);
        beforeSave(entity);
        return mapper.toResponse(repository.saveAndFlush(entity));
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
    }

    /** Checks a request before it touches an entity. {@code existingId} is null when creating. */
    protected void validate(Q request, @Nullable Long existingId) {}

    /** Last chance to adjust the entity before it is written. */
    protected void beforeSave(E entity) {}

    protected final void requireUniqueSlug(SlugRepository slugs, String slug, @Nullable Long existingId) {
        boolean taken = existingId == null ? slugs.existsBySlug(slug) : slugs.existsBySlugAndIdNot(slug, existingId);
        if (taken) {
            throw new ConflictException("The slug '%s' is already in use".formatted(slug));
        }
    }

    private E find(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException(resourceName, id));
    }
}
