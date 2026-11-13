package com.arigavincent.portfolio.controller;

import com.arigavincent.portfolio.dto.ContactReceipt;
import com.arigavincent.portfolio.dto.ContactRequest;
import com.arigavincent.portfolio.ratelimit.RateLimitPolicy;
import com.arigavincent.portfolio.ratelimit.RateLimited;
import com.arigavincent.portfolio.service.ContactService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Contact")
@RestController
@RequestMapping("/api/contact")
@RequiredArgsConstructor
public class ContactController {

    private final ContactService service;

    @Operation(summary = "Send a message through the contact form (rate limited per IP)")
    @RateLimited(RateLimitPolicy.CONTACT)
    @PostMapping
    @ResponseStatus(HttpStatus.ACCEPTED)
    public ContactReceipt submit(@Valid @RequestBody ContactRequest request) {
        service.submit(request);
        return new ContactReceipt("Thanks, your message is in. I will get back to you soon.");
    }
}
