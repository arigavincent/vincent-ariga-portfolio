package com.arigavincent.portfolio.controller.admin;

import com.arigavincent.portfolio.dto.ContactMessageResponse;
import com.arigavincent.portfolio.dto.ContactStatusRequest;
import com.arigavincent.portfolio.dto.PageResponse;
import com.arigavincent.portfolio.dto.UnreadCountResponse;
import com.arigavincent.portfolio.entity.ContactStatus;
import com.arigavincent.portfolio.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Admin: Inbox")
@RestController
@RequestMapping("/api/admin/messages")
@RequiredArgsConstructor
public class AdminMessageController {

    private static final int MAX_PAGE_SIZE = 100;

    private final ContactService service;

    @Operation(summary = "List contact messages, newest first, optionally filtered by status")
    @GetMapping
    public PageResponse<ContactMessageResponse> list(
            @RequestParam(required = false) ContactStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PageRequest pageable = PageRequest.of(
                Math.max(page, 0), Math.clamp(size, 1, MAX_PAGE_SIZE), Sort.by(Sort.Direction.DESC, "createdAt", "id"));
        return service.findAll(status, pageable);
    }

    @Operation(summary = "Count messages that have not been read yet")
    @GetMapping("/unread-count")
    public UnreadCountResponse unreadCount() {
        return service.unreadCount();
    }

    @GetMapping("/{id}")
    public ContactMessageResponse get(@PathVariable Long id) {
        return service.get(id);
    }

    @Operation(summary = "Mark a message as new, read or archived")
    @PatchMapping("/{id}")
    public ContactMessageResponse updateStatus(
            @PathVariable Long id, @Valid @RequestBody ContactStatusRequest request) {
        return service.updateStatus(id, request.status());
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
