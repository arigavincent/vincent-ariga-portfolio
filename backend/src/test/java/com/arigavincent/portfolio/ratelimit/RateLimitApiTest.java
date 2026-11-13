package com.arigavincent.portfolio.ratelimit;

import static org.hamcrest.Matchers.matchesPattern;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.arigavincent.portfolio.repository.ContactMessageRepository;
import com.arigavincent.portfolio.support.IntegrationTest;
import com.arigavincent.portfolio.support.TestAuth;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@IntegrationTest
@TestPropertySource(properties = {"app.rate-limit.contact.capacity=2", "app.rate-limit.login.capacity=3"})
class RateLimitApiTest {

    private static final String MESSAGE = """
            {"name": "Otieno", "email": "otieno@example.com", "message": "Checking that the limiter works."}""";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContactMessageRepository contactMessages;

    @AfterEach
    void emptyInbox() {
        contactMessages.deleteAll();
    }

    @Test
    void contactFormAllowsTheConfiguredBurstThenAnswers429() throws Exception {
        mockMvc.perform(contact("203.0.113.10")).andExpect(status().isAccepted());
        mockMvc.perform(contact("203.0.113.10")).andExpect(status().isAccepted());

        mockMvc.perform(contact("203.0.113.10"))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists(HttpHeaders.RETRY_AFTER))
                .andExpect(header().string(HttpHeaders.RETRY_AFTER, matchesPattern("[1-9][0-9]*")))
                .andExpect(jsonPath("$.status").value(429))
                .andExpect(jsonPath("$.message").value("Too many requests. Please wait a moment and try again."));
    }

    @Test
    void limitsAreTrackedPerClientAddress() throws Exception {
        mockMvc.perform(contact("203.0.113.20")).andExpect(status().isAccepted());
        mockMvc.perform(contact("203.0.113.20")).andExpect(status().isAccepted());
        mockMvc.perform(contact("203.0.113.20")).andExpect(status().isTooManyRequests());

        mockMvc.perform(contact("203.0.113.21")).andExpect(status().isAccepted());
    }

    @Test
    void loginAttemptsAreLimitedToSlowDownGuessing() throws Exception {
        for (int attempt = 0; attempt < 3; attempt++) {
            mockMvc.perform(login("203.0.113.30")).andExpect(status().isUnauthorized());
        }
        mockMvc.perform(login("203.0.113.30")).andExpect(status().isTooManyRequests());
    }

    private static MockHttpServletRequestBuilder contact(String address) {
        return post("/api/contact")
                .contentType(MediaType.APPLICATION_JSON)
                .content(MESSAGE)
                .with(request -> {
                    request.setRemoteAddr(address);
                    return request;
                });
    }

    private static MockHttpServletRequestBuilder login(String address) {
        return post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(TestAuth.credentials(TestAuth.USERNAME, "wrong-password"))
                .with(request -> {
                    request.setRemoteAddr(address);
                    return request;
                });
    }
}
