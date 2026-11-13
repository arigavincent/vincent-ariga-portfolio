package com.arigavincent.portfolio.repository;

import com.arigavincent.portfolio.entity.ContactMessage;
import com.arigavincent.portfolio.entity.ContactStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    Page<ContactMessage> findAllByStatus(ContactStatus status, Pageable pageable);

    long countByStatus(ContactStatus status);
}
