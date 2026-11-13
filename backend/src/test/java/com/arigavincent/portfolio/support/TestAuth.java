package com.arigavincent.portfolio.support;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

/** Signs in as the fixture admin from application-test.yml. */
public final class TestAuth {

    public static final String USERNAME = "test-admin";
    public static final String PASSWORD = "test-only-password-123";
    public static final String REFRESH_COOKIE = "aj_refresh";

    private TestAuth() {}

    public static MvcResult login(MockMvc mockMvc) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(credentials(USERNAME, PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();
    }

    /** An Authorization header value for a freshly signed-in admin. */
    public static String bearer(MockMvc mockMvc) throws Exception {
        return "Bearer " + accessToken(login(mockMvc));
    }

    public static String accessToken(MvcResult result) throws Exception {
        return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }

    public static Cookie refreshCookie(MvcResult result) {
        return result.getResponse().getCookie(REFRESH_COOKIE);
    }

    public static String credentials(String username, String password) {
        return """
                {"username": "%s", "password": "%s"}""".formatted(username, password);
    }
}
