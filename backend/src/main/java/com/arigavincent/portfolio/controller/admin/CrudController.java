package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.service.CrudService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;

/**
 * The five admin endpoints every content type shares. Subclasses only declare their path and
 * service.
 *
 * @param <Q> write request
 * @param <R> response
 */
@RequiredArgsConstructor
public abstract class CrudController<Q, R> {

    private final CrudService<?, Q, R> service;

    @GetMapping
    public List<R> list() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public R get(@PathVariable Long id) {
        return service.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public R create(@Valid @RequestBody Q request) {
        return service.create(request);
    }

    @PutMapping("/{id}")
    public R update(@PathVariable Long id, @Valid @RequestBody Q request) {
        return service.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
