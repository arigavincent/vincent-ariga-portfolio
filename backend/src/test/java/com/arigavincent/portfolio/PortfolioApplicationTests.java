package com.arigavincent.portfolio;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.arigavincent.portfolio.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
class PortfolioApplicationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void healthEndpointReportsUp() throws Exception {
        mockMvc.perform(get("/actuator/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }

    @Test
    void infoEndpointExposesBuildVersion() throws Exception {
        mockMvc.perform(get("/actuator/info"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.build.version").isNotEmpty());
    }

    @Test
    void openApiDocumentListsThePublicEndpoints() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Vincent Ariga · A&J Portfolio API"))
                .andExpect(jsonPath("$.paths['/api/projects']").exists())
                .andExpect(jsonPath("$.paths['/api/projects/{slug}']").exists())
                .andExpect(jsonPath("$.paths['/api/skills']").exists())
                .andExpect(jsonPath("$.paths['/api/experience']").exists())
                .andExpect(jsonPath("$.paths['/api/education']").exists())
                .andExpect(jsonPath("$.paths['/api/services']").exists())
                .andExpect(jsonPath("$.paths['/api/blog']").exists())
                .andExpect(jsonPath("$.paths['/api/settings']").exists());
    }
}
