package com.arigavincent.portfolio.security;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.cookie;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.arigavincent.portfolio.support.IntegrationTest;
import com.arigavincent.portfolio.support.TestAuth;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@IntegrationTest
class AuthApiTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void loginReturnsAnAccessTokenAndAnHttpOnlyRefreshCookie() throws Exception {
        MvcResult result = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestAuth.credentials(TestAuth.USERNAME, TestAuth.PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.expiresIn").value(900))
                .andExpect(jsonPath("$.user.username").value(TestAuth.USERNAME))
                .andExpect(jsonPath("$.user.role").value("ADMIN"))
                .andExpect(header().string(HttpHeaders.CACHE_CONTROL, "no-store"))
                .andExpect(cookie().httpOnly(TestAuth.REFRESH_COOKIE, true))
                .andExpect(cookie().secure(TestAuth.REFRESH_COOKIE, true))
                .andExpect(cookie().path(TestAuth.REFRESH_COOKIE, "/api/auth"))
                .andExpect(cookie().attribute(TestAuth.REFRESH_COOKIE, "SameSite", "Lax"))
                .andReturn();

        assertThat(result.getResponse().getContentAsString())
                .doesNotContain(TestAuth.refreshCookie(result).getValue());
    }

    @Test
    void loginGivesTheSameAnswerForAWrongPasswordAndAnUnknownUser() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestAuth.credentials(TestAuth.USERNAME, "not-the-password")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"))
                .andExpect(cookie().doesNotExist(TestAuth.REFRESH_COOKIE));
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestAuth.credentials("nobody", TestAuth.PASSWORD)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Invalid username or password"));
    }

    @Test
    void loginValidatesTheRequestBody() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(TestAuth.credentials("", "")))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("username")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("password")));
    }

    @Test
    void adminEndpointsRequireAToken() throws Exception {
        mockMvc.perform(get("/api/admin/projects"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Sign in to continue."))
                .andExpect(jsonPath("$.path").value("/api/admin/projects"));
    }

    @Test
    void adminEndpointsRejectATamperedToken() throws Exception {
        String token = TestAuth.accessToken(TestAuth.login(mockMvc));
        String tampered = token.substring(0, token.length() - 4) + "AAAA";

        mockMvc.perform(get("/api/admin/me").header(HttpHeaders.AUTHORIZATION, "Bearer " + tampered))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void adminEndpointsAcceptAValidToken() throws Exception {
        mockMvc.perform(get("/api/admin/me").header(HttpHeaders.AUTHORIZATION, TestAuth.bearer(mockMvc)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value(TestAuth.USERNAME))
                .andExpect(jsonPath("$.role").value("ADMIN"));
    }

    @Test
    void refreshRotatesTheCookieAndIssuesANewAccessToken() throws Exception {
        Cookie first = TestAuth.refreshCookie(TestAuth.login(mockMvc));

        MvcResult refreshed = mockMvc.perform(post("/api/auth/refresh").cookie(first))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(cookie().httpOnly(TestAuth.REFRESH_COOKIE, true))
                .andReturn();

        assertThat(TestAuth.refreshCookie(refreshed).getValue()).isNotEqualTo(first.getValue());
        mockMvc.perform(get("/api/admin/me")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + TestAuth.accessToken(refreshed)))
                .andExpect(status().isOk());
    }

    @Test
    void reusingARotatedRefreshTokenRevokesTheWholeSession() throws Exception {
        Cookie first = TestAuth.refreshCookie(TestAuth.login(mockMvc));
        Cookie second = TestAuth.refreshCookie(
                mockMvc.perform(post("/api/auth/refresh").cookie(first)).andReturn());

        mockMvc.perform(post("/api/auth/refresh").cookie(first))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Your session has expired. Please sign in again."));
        mockMvc.perform(post("/api/auth/refresh").cookie(second)).andExpect(status().isUnauthorized());
    }

    @Test
    void refreshWithoutACookieIsRejected() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/refresh").cookie(new Cookie(TestAuth.REFRESH_COOKIE, "made-up")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logoutRevokesTheRefreshTokenAndClearsTheCookie() throws Exception {
        Cookie refresh = TestAuth.refreshCookie(TestAuth.login(mockMvc));

        mockMvc.perform(post("/api/auth/logout").cookie(refresh))
                .andExpect(status().isNoContent())
                .andExpect(cookie().maxAge(TestAuth.REFRESH_COOKIE, 0));
        mockMvc.perform(post("/api/auth/refresh").cookie(refresh)).andExpect(status().isUnauthorized());
    }

    @Test
    void responsesCarryTheSecurityHeaders() throws Exception {
        mockMvc.perform(get("/api/skills").secure(true))
                .andExpect(header().string("X-Content-Type-Options", "nosniff"))
                .andExpect(header().string("X-Frame-Options", "DENY"))
                .andExpect(header().string("Referrer-Policy", "strict-origin-when-cross-origin"))
                .andExpect(header().string("Content-Security-Policy", containsString("frame-ancestors 'none'")))
                .andExpect(header().string("Permissions-Policy", containsString("camera=()")))
                .andExpect(header().string("Strict-Transport-Security", containsString("max-age=31536000")));
    }

    @Test
    void corsAllowsTheConfiguredOriginOnly() throws Exception {
        mockMvc.perform(options("/api/projects")
                        .header(HttpHeaders.ORIGIN, "http://localhost:5173")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:5173"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));
        mockMvc.perform(options("/api/projects")
                        .header(HttpHeaders.ORIGIN, "https://evil.example")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }
}
