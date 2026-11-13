package com.arigavincent.portfolio.service;

import com.arigavincent.portfolio.dto.ContactMessageResponse;
import com.arigavincent.portfolio.dto.ContactRequest;
import com.arigavincent.portfolio.dto.PageResponse;
import com.arigavincent.portfolio.dto.UnreadCountResponse;
import com.arigavincent.portfolio.entity.ContactMessage;
import com.arigavincent.portfolio.entity.ContactStatus;
import com.arigavincent.portfolio.exception.ResourceNotFoundException;
import com.arigavincent.portfolio.mapper.ContactMessageMapper;
import com.arigavincent.portfolio.repository.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.lang.Nullable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class ContactService {

    private final ContactMessageRepository repository;
    private final ContactMessageMapper mapper;
    private final ContactNotifier notifier;

    /**
     * Stores a contact form submission. A filled honeypot is silently dropped: the bot gets the
     * same answer as a person, so it learns nothing.
     */
    @Transactional
    public void submit(ContactRequest request) {
        if (StringUtils.hasText(request.website())) {
            log.info("Dropped a contact submission that filled the honeypot field");
            return;
        }
        ContactMessage saved = repository.save(mapper.toEntity(request));
        notifier.notifyNewMessage(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactMessageResponse> findAll(@Nullable ContactStatus status, Pageable pageable) {
        Page<ContactMessage> page =
                status == null ? repository.findAll(pageable) : repository.findAllByStatus(status, pageable);
        return PageResponse.of(page.map(mapper::toResponse));
    }

    @Transactional(readOnly = true)
    public ContactMessageResponse get(Long id) {
        return mapper.toResponse(find(id));
    }

    @Transactional(readOnly = true)
    public UnreadCountResponse unreadCount() {
        return new UnreadCountResponse(repository.countByStatus(ContactStatus.NEW));
    }

    @Transactional
    public ContactMessageResponse updateStatus(Long id, ContactStatus status) {
        ContactMessage message = find(id);
        message.setStatus(status);
        return mapper.toResponse(message);
    }

    @Transactional
    public void delete(Long id) {
        repository.delete(find(id));
    }

    private ContactMessage find(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Message", id));
    }
}
