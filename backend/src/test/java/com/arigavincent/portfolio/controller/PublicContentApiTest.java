package com.arigavincent.portfolio.controller;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.arigavincent.portfolio.entity.Project;
import com.arigavincent.portfolio.entity.PublicationStatus;
import com.arigavincent.portfolio.repository.ProjectRepository;
import com.arigavincent.portfolio.support.IntegrationTest;
import java.util.List;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

@IntegrationTest
class PublicContentApiTest {

    private static final String DRAFT_SLUG = "unreleased-draft";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    @AfterEach
    void removeDraft() {
        projectRepository.findAll().stream()
                .filter(project -> DRAFT_SLUG.equals(project.getSlug()))
                .forEach(projectRepository::delete);
    }

    @Test
    void listsTheSeededProjectsInDisplayOrder() throws Exception {
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(6)))
                .andExpect(jsonPath(
                        "$[*].slug",
                        contains(
                                "aj-stream",
                                "shekinah-sons-global",
                                "mpesa-tms",
                                "e-learning-lk-school",
                                "berea-bible",
                                "arian-church-app-packages")))
                .andExpect(jsonPath("$[*].status", everyItem(is("PUBLISHED"))));
    }

    @Test
    void returnsAProjectWithItsOrderedTechStackAndHighlights() throws Exception {
        mockMvc.perform(get("/api/projects/shekinah-sons-global"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Shekinah Sons Global"))
                .andExpect(jsonPath("$.techStack", contains("React Native", "Go", "PostgreSQL", "React")))
                .andExpect(jsonPath("$.highlights", hasSize(6)))
                .andExpect(jsonPath("$.highlights[0]").value("M-Pesa giving"));
    }

    @Test
    void hidesDraftProjectsFromThePublicApi() throws Exception {
        Project draft = new Project();
        draft.setSlug(DRAFT_SLUG);
        draft.setTitle("Unreleased");
        draft.setSummary("Not ready yet.");
        draft.setDescription("Not ready yet.");
        draft.setCategory("Draft");
        draft.setFeatured(true);
        draft.setStatus(PublicationStatus.DRAFT);
        draft.setTechStack(List.of("Java"));
        projectRepository.save(draft);

        mockMvc.perform(get("/api/projects")).andExpect(jsonPath("$[*].slug", not(hasItem(DRAFT_SLUG))));
        mockMvc.perform(get("/api/projects").param("featured", "true"))
                .andExpect(jsonPath("$[*].slug", not(hasItem(DRAFT_SLUG))));
        mockMvc.perform(get("/api/projects/" + DRAFT_SLUG)).andExpect(status().isNotFound());
    }

    @Test
    void answersUnknownProjectWithTheStandardErrorShape() throws Exception {
        mockMvc.perform(get("/api/projects/does-not-exist"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.error").value("Not Found"))
                .andExpect(jsonPath("$.message").value("Project 'does-not-exist' was not found"))
                .andExpect(jsonPath("$.path").value("/api/projects/does-not-exist"))
                .andExpect(jsonPath("$.timestamp").isNotEmpty())
                .andExpect(jsonPath("$.fieldErrors").doesNotExist());
    }

    @Test
    void answersUnknownRouteWithTheStandardErrorShape() throws Exception {
        mockMvc.perform(get("/api/nothing-here"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.status").value(404))
                .andExpect(jsonPath("$.path").value("/api/nothing-here"));
    }

    @Test
    void listsSkillsGroupedByTheThreeCategories() throws Exception {
        mockMvc.perform(get("/api/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(19)))
                .andExpect(jsonPath("$[0].name").value("Java"))
                .andExpect(jsonPath("$[?(@.name == 'Spring Boot')].detail")
                        .value(hasItem("Security · Data JPA · Cloud Gateway")))
                .andExpect(jsonPath("$[?(@.category == 'BACKEND')]", hasSize(10)))
                .andExpect(jsonPath("$[?(@.category == 'FRONTEND')]", hasSize(3)))
                .andExpect(jsonPath("$[?(@.category == 'TOOLING')]", hasSize(6)));
    }

    @Test
    void listsExperienceEducationAndServices() throws Exception {
        mockMvc.perform(get("/api/experience"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].current").value(true));
        mockMvc.perform(get("/api/education"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].institution").value("Kirinyaga University"))
                .andExpect(jsonPath("$[0].qualification").value("BSc Information Technology"))
                .andExpect(jsonPath("$[0].grade").value("Second Class Upper"))
                .andExpect(jsonPath("$[0].endYear").value(2026));
        mockMvc.perform(get("/api/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath(
                        "$[*].title",
                        contains("Backend Development", "API Design", "Full-Stack Apps", "Church & Business Systems")));
    }

    @Test
    void returnsSiteSettingsWithoutAnyLinkedInReference() throws Exception {
        mockMvc.perform(get("/api/settings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.displayName").value("Vincent Ariga"))
                .andExpect(jsonPath("$.brandMark").value("A&J"))
                .andExpect(jsonPath("$.footerLine").value("Vincent Ariga · A&J"))
                .andExpect(jsonPath("$.tagline").value("SOFTWARE · STREAMING · APPS"))
                .andExpect(jsonPath("$.phoneDisplay").value("+254 718 569 004"))
                .andExpect(jsonPath("$.githubUrl").value("https://github.com/arigavincent"))
                .andExpect(content().string(not(containsString("linkedin"))))
                .andExpect(content().string(not(containsString("LinkedIn"))));
    }

    @Test
    void returnsAnEmptyBlogUntilPostsArePublished() throws Exception {
        mockMvc.perform(get("/api/blog")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(0)));
        mockMvc.perform(get("/api/blog/missing")).andExpect(status().isNotFound());
    }
}
