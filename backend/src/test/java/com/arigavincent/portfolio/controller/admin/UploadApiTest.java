package com.arigavincent.portfolio.controller.admin;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.arigavincent.portfolio.entity.SiteSettings;
import com.arigavincent.portfolio.repository.SiteSettingsRepository;
import com.arigavincent.portfolio.support.IntegrationTest;
import com.arigavincent.portfolio.support.TestAuth;
import com.jayway.jsonpath.JsonPath;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
class UploadApiTest {

    private static final byte[] PNG = Base64.getDecoder()
            .decode("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==");
    private static final byte[] PDF = "%PDF-1.4\nreal cv\n%%EOF\n".getBytes(StandardCharsets.US_ASCII);

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SiteSettingsRepository siteSettingsRepository;

    private String bearer;

    @BeforeEach
    void signIn() throws Exception {
        bearer = TestAuth.bearer(mockMvc);
    }

    @AfterEach
    void restorePlaceholderCv() {
        SiteSettings settings =
                siteSettingsRepository.findById(SiteSettings.SINGLETON_ID).orElseThrow();
        settings.setCvFileKey(null);
        siteSettingsRepository.save(settings);
    }

    @Test
    void anUploadedImageIsStoredAndServedBack() throws Exception {
        String response = mockMvc.perform(multipart("/api/admin/uploads")
                        .file(new MockMultipartFile("file", "cover.png", "image/png", PNG))
                        .header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.url", startsWith("/api/files/")))
                .andExpect(jsonPath("$.contentType").value("image/png"))
                .andExpect(jsonPath("$.size").value(PNG.length))
                .andReturn()
                .getResponse()
                .getContentAsString();
        String url = JsonPath.read(response, "$.url");

        mockMvc.perform(get(url))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.IMAGE_PNG))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, containsString("immutable")))
                .andExpect(content().bytes(PNG));
    }

    @Test
    void theRealContentDecidesTheTypeNotTheFileNameOrHeader() throws Exception {
        MockMultipartFile disguised = new MockMultipartFile(
                "file", "cover.png", "image/png", "<script>alert(1)</script>".getBytes(StandardCharsets.UTF_8));

        mockMvc.perform(multipart("/api/admin/uploads").file(disguised).header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.message").value("Only JPEG, PNG, WebP, GIF or AVIF images are accepted"));
        mockMvc.perform(multipart("/api/admin/uploads")
                        .file(new MockMultipartFile("file", "cv.pdf", "application/pdf", PDF))
                        .header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isUnsupportedMediaType());
    }

    @Test
    void emptyAndOversizedFilesAreRejected() throws Exception {
        mockMvc.perform(multipart("/api/admin/uploads")
                        .file(new MockMultipartFile("file", "empty.png", "image/png", new byte[0]))
                        .header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isBadRequest());

        byte[] oversized = new byte[5 * 1024 * 1024 + 1];
        System.arraycopy(PNG, 0, oversized, 0, PNG.length);
        mockMvc.perform(multipart("/api/admin/uploads")
                        .file(new MockMultipartFile("file", "huge.png", "image/png", oversized))
                        .header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.message").value("That file is too large. The limit is 5 MB"));
    }

    @Test
    void uploadingRequiresAToken() throws Exception {
        mockMvc.perform(multipart("/api/admin/uploads")
                        .file(new MockMultipartFile("file", "cover.png", "image/png", PNG)))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(multipart("/api/admin/cv")
                        .file(new MockMultipartFile("file", "cv.pdf", "application/pdf", PDF)))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void unknownOrCraftedFileKeysAre404() throws Exception {
        mockMvc.perform(get("/api/files/00000000-0000-0000-0000-000000000000.png"))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/files/application.yml")).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/files/..%2F..%2Fbuild.gradle.kts")).andExpect(status().is4xxClientError());
    }

    @Test
    void theCvStartsAsThePlaceholderAndCanBeReplaced() throws Exception {
        mockMvc.perform(get("/api/cv"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(
                                HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"Vincent-Ariga-CV.pdf\""))
                .andExpect(content().string(containsString("placeholder CV")));

        mockMvc.perform(multipart("/api/admin/cv")
                        .file(new MockMultipartFile("file", "cover.png", "image/png", PNG))
                        .header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isUnsupportedMediaType())
                .andExpect(jsonPath("$.message").value("Only PDF files are accepted"));

        mockMvc.perform(multipart("/api/admin/cv")
                        .file(new MockMultipartFile("file", "cv.pdf", "application/pdf", PDF))
                        .header(HttpHeaders.AUTHORIZATION, bearer))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contentType").value("application/pdf"));
        mockMvc.perform(get("/api/cv"))
                .andExpect(status().isOk())
                .andExpect(content().bytes(PDF));
    }
}
