package com.arigavincent.portfolio.controller.admin;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.arigavincent.portfolio.repository.BlogPostRepository;
import com.arigavincent.portfolio.repository.ProjectRepository;
import com.arigavincent.portfolio.repository.SkillRepository;
import com.arigavincent.portfolio.support.IntegrationTest;
import com.arigavincent.portfolio.support.TestAuth;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

@IntegrationTest
class AdminCrudApiTest {

    private static final String TEST_SLUG = "crud-test-project";
    private static final String TEST_SKILL = "Crud Test Skill";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private BlogPostRepository blogPostRepository;

    private String bearer;

    @BeforeEach
    void signIn() throws Exception {
        bearer = TestAuth.bearer(mockMvc);
    }

    @AfterEach
    void removeTestContent() {
        projectRepository.findAll().stream()
                .filter(project -> project.getSlug().startsWith(TEST_SLUG))
                .forEach(projectRepository::delete);
        skillRepository.findAll().stream()
                .filter(skill -> skill.getName().startsWith(TEST_SKILL))
                .forEach(skillRepository::delete);
        blogPostRepository.deleteAll();
    }

    @Test
    void aProjectGoesFromDraftToPublishedToDeleted() throws Exception {
        String created = mockMvc.perform(authorized(post("/api/admin/projects")).content(project(TEST_SLUG, "DRAFT")))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andExpect(jsonPath("$.techStack", contains("Java", "Spring Boot")))
                .andExpect(jsonPath("$.updatedAt").isNotEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Integer id = JsonPath.read(created, "$.id");

        mockMvc.perform(get("/api/projects/" + TEST_SLUG)).andExpect(status().isNotFound());
        mockMvc.perform(authorized(get("/api/admin/projects")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].slug", hasItem(TEST_SLUG)));
        mockMvc.perform(authorized(get("/api/admin/projects/" + id)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value(TEST_SLUG));

        ObjectNode published = (ObjectNode) objectMapper.readTree(project(TEST_SLUG, "PUBLISHED"));
        published.put("title", "Renamed project");
        published.putArray("techStack").add("Kotlin");
        mockMvc.perform(authorized(put("/api/admin/projects/" + id)).content(published.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Renamed project"))
                .andExpect(jsonPath("$.techStack", contains("Kotlin")));
        mockMvc.perform(get("/api/projects/" + TEST_SLUG))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Renamed project"));

        mockMvc.perform(authorized(delete("/api/admin/projects/" + id))).andExpect(status().isNoContent());
        mockMvc.perform(authorized(get("/api/admin/projects/" + id))).andExpect(status().isNotFound());
        mockMvc.perform(get("/api/projects")).andExpect(jsonPath("$[*].slug", not(hasItem(TEST_SLUG))));
    }

    @Test
    void aSlugCanOnlyBeUsedOnce() throws Exception {
        mockMvc.perform(authorized(post("/api/admin/projects")).content(project(TEST_SLUG, "DRAFT")))
                .andExpect(status().isCreated());

        mockMvc.perform(authorized(post("/api/admin/projects")).content(project(TEST_SLUG, "DRAFT")))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("The slug '" + TEST_SLUG + "' is already in use"));
        mockMvc.perform(authorized(post("/api/admin/projects")).content(project("aj-stream", "DRAFT")))
                .andExpect(status().isConflict());
    }

    @Test
    void aProjectCanKeepItsOwnSlugWhenUpdated() throws Exception {
        String created = mockMvc.perform(authorized(post("/api/admin/projects")).content(project(TEST_SLUG, "DRAFT")))
                .andReturn()
                .getResponse()
                .getContentAsString();
        Integer id = JsonPath.read(created, "$.id");

        mockMvc.perform(authorized(put("/api/admin/projects/" + id)).content(project(TEST_SLUG, "DRAFT")))
                .andExpect(status().isOk());
        mockMvc.perform(authorized(put("/api/admin/projects/" + id)).content(project("aj-stream", "DRAFT")))
                .andExpect(status().isConflict());
    }

    @Test
    void invalidProjectsAreRejectedFieldByField() throws Exception {
        ObjectNode invalid = (ObjectNode) objectMapper.readTree(project("Not A Slug!", "DRAFT"));
        invalid.put("title", "");
        invalid.put("repoUrl", "github.com/no-scheme");
        invalid.putNull("status");

        mockMvc.perform(authorized(post("/api/admin/projects")).content(invalid.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("slug")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("title")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("repoUrl")))
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("status")));
    }

    @Test
    void skillsUseTheSharedCrudEndpoints() throws Exception {
        String skill = """
                {"name": "%s", "category": "BACKEND", "detail": "Testing", "iconKey": "test", "sortOrder": 99}""".formatted(TEST_SKILL);
        String created = mockMvc.perform(authorized(post("/api/admin/skills")).content(skill))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value(TEST_SKILL))
                .andReturn()
                .getResponse()
                .getContentAsString();
        Integer id = JsonPath.read(created, "$.id");

        mockMvc.perform(get("/api/skills")).andExpect(jsonPath("$[-1].name").value(TEST_SKILL));
        mockMvc.perform(authorized(post("/api/admin/skills")).content(skill)).andExpect(status().isConflict());
        mockMvc.perform(authorized(put("/api/admin/skills/" + id)).content(skill.replace("Testing", "Updated")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.detail").value("Updated"));
        mockMvc.perform(authorized(delete("/api/admin/skills/" + id))).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/skills")).andExpect(jsonPath("$", hasSize(19)));
    }

    @ParameterizedTest
    @CsvSource(delimiter = '|', textBlock = """
                    experience | {"title": "Crud test", "organization": "Test Org", "current": true, "description": "Testing the endpoint.", "sortOrder": 50}
                    education  | {"institution": "Crud Test School", "qualification": "Certificate", "endYear": 2020, "sortOrder": 50}
                    services   | {"title": "Crud test service", "description": "Testing the endpoint.", "sortOrder": 50}
                    """)
    void theOtherContentTypesCanBeCreatedAndDeleted(String resource, String body) throws Exception {
        String created = mockMvc.perform(
                        authorized(post("/api/admin/" + resource)).content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Integer id = JsonPath.read(created, "$.id");

        mockMvc.perform(get("/api/" + resource)).andExpect(jsonPath("$[*].id", hasItem(id)));
        mockMvc.perform(authorized(delete("/api/admin/" + resource + "/" + id))).andExpect(status().isNoContent());
        mockMvc.perform(get("/api/" + resource)).andExpect(jsonPath("$[*].id", not(hasItem(id))));
        mockMvc.perform(authorized(delete("/api/admin/" + resource + "/" + id))).andExpect(status().isNotFound());
    }

    @Test
    void publishingABlogPostStampsItAndMakesItPublic() throws Exception {
        String draft = """
                {"slug": "hello-world", "title": "Hello", "excerpt": "First post.", "content": "# Hello",
                 "tags": ["java"], "status": "DRAFT"}""";
        String created = mockMvc.perform(authorized(post("/api/admin/blog")).content(draft))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.publishedAt").isEmpty())
                .andReturn()
                .getResponse()
                .getContentAsString();
        Integer id = JsonPath.read(created, "$.id");
        mockMvc.perform(get("/api/blog")).andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(authorized(put("/api/admin/blog/" + id)).content(draft.replace("DRAFT", "PUBLISHED")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publishedAt").isNotEmpty());
        mockMvc.perform(get("/api/blog"))
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].slug").value("hello-world"))
                .andExpect(jsonPath("$[0].content").doesNotExist());
        mockMvc.perform(get("/api/blog/hello-world"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("# Hello"))
                .andExpect(jsonPath("$.tags", contains("java")));
    }

    @Test
    void siteSettingsCanBeEdited() throws Exception {
        String original = mockMvc.perform(authorized(get("/api/admin/settings")))
                .andExpect(status().isOk())
                .andReturn()
                .getResponse()
                .getContentAsString();
        ObjectNode edited = (ObjectNode) objectMapper.readTree(original);
        edited.remove("updatedAt");
        ObjectNode restore = edited.deepCopy();
        edited.put("availability", "Booked until further notice.");

        mockMvc.perform(authorized(put("/api/admin/settings")).content(edited.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.availability").value("Booked until further notice."));
        mockMvc.perform(get("/api/settings"))
                .andExpect(jsonPath("$.availability").value("Booked until further notice."));

        edited.put("email", "not-an-email");
        mockMvc.perform(authorized(put("/api/admin/settings")).content(edited.toString()))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.fieldErrors[*].field", hasItem("email")));

        mockMvc.perform(authorized(put("/api/admin/settings")).content(restore.toString()))
                .andExpect(status().isOk());
    }

    @Test
    void writesAreRefusedWithoutAToken() throws Exception {
        mockMvc.perform(post("/api/admin/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(project(TEST_SLUG, "DRAFT")))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(delete("/api/admin/skills/1")).andExpect(status().isUnauthorized());
        mockMvc.perform(put("/api/admin/settings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    private MockHttpServletRequestBuilder authorized(MockHttpServletRequestBuilder request) {
        return request.header(HttpHeaders.AUTHORIZATION, bearer).contentType(MediaType.APPLICATION_JSON);
    }

    private static String project(String slug, String status) {
        return """
                {"slug": "%s", "title": "Crud test project", "summary": "A project used by a test.",
                 "description": "Longer description.", "category": "Testing",
                 "techStack": ["Java", "Spring Boot"], "highlights": ["One", "Two"],
                 "coverImageUrl": null, "repoUrl": "https://github.com/arigavincent/example", "liveUrl": null,
                 "featured": false, "status": "%s", "sortOrder": 90}""".formatted(slug, status);
    }
}
