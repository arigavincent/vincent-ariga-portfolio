package com.arigavincent.portfolio.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.arigavincent.portfolio.entity.ContactMessage;
import com.arigavincent.portfolio.entity.ContactStatus;
import com.arigavincent.portfolio.repository.ContactMessageRepository;
import com.arigavincent.portfolio.service.ContactNotifier;
import com.arigavincent.portfolio.support.IntegrationTest;
import com.arigavincent.portfolio.support.TestAuth;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
class ContactApiTest {

    private static final String VALID_MESSAGE = """
            {"name": "Wanjiru", "email": "wanjiru@example.com", "subject": "Backend role",
             "message": "Hello Vincent, we have a backend role you might like.", "website": ""}""";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ContactMessageRepository repository;

    @MockitoBean
    private ContactNotifier notifier;

    @AfterEach
    void emptyInbox() {
        repository.deleteAll();
    }

    @Test
    void storesAValidMessageAndSendsANotification() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_MESSAGE))
                .andExpect(status().isAccepted())
                .andExpect(jsonPath("$.message").isNotEmpty());

        assertThat(repository.findAll()).singleElement().satisfies(message -> {
            assertThat(message.getName()).isEqualTo("Wanjiru");
            assertThat(message.getEmail()).isEqualTo("wanjiru@example.com");
            assertThat(message.getSubject()).isEqualTo("Backend role");
            assertThat(message.getStatus()).isEqualTo(ContactStatus.NEW);
        });
        verify(notifier).notifyNewMessage(any(ContactMessage.class));
    }

    @Test
    void rejectsInvalidInputWithFieldErrors() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "", "email": "not-an-email", "message": "short"}"""))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Some fields need another look."))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("name")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("email")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("message")));

        assertThat(repository.count()).isZero();
        verify(notifier, never()).notifyNewMessage(any());
    }

    @Test
    void rejectsMalformedJsonWithTheStandardErrorShape() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{not json"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.path").value("/api/contact"));
    }

    @Test
    void silentlyDropsSubmissionsThatFillTheHoneypot() throws Exception {
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_MESSAGE.replace("\"website\": \"\"", "\"website\": \"https://spam.example\"")))
                .andExpect(status().isAccepted());

        assertThat(repository.count()).isZero();
        verify(notifier, never()).notifyNewMessage(any());
    }

    @Test
    void theAdminInboxListsReadsAndDeletesMessages() throws Exception {
        String bearer = TestAuth.bearer(mockMvc);
        mockMvc.perform(post("/api/contact")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(VALID_MESSAGE))
                .andExpect(status().isAccepted());
        Long id = repository.findAll().getFirst().getId();

        mockMvc.perform(get("/api/admin/messages").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.content[0].email").value("wanjiru@example.com"))
                .andExpect(jsonPath("$.content[0].status").value("NEW"));
        mockMvc.perform(get("/api/admin/messages/unread-count").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(jsonPath("$.unread").value(1));

        mockMvc.perform(patch("/api/admin/messages/" + id)
                        .header(HttpHeaders.AUTHORIZATION, bearer)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"status": "READ"}"""))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));
        mockMvc.perform(get("/api/admin/messages/unread-count").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(jsonPath("$.unread").value(0));
        mockMvc.perform(get("/api/admin/messages").param("status", "NEW").header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(jsonPath("$.totalElements").value(0));

        mockMvc.perform(delete("/api/admin/messages/" + id).header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/messages/" + id).header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isNotFound());
    }

    @Test
    void theInboxIsNotPublic() throws Exception {
        mockMvc.perform(get("/api/admin/messages")).andExpect(status().isUnauthorized());
    }
}
