package com.arigavincent.portfolio.seed;

import com.arigavincent.portfolio.entity.Education;
import com.arigavincent.portfolio.entity.Experience;
import com.arigavincent.portfolio.entity.Project;
import com.arigavincent.portfolio.entity.PublicationStatus;
import com.arigavincent.portfolio.entity.ServiceOffering;
import com.arigavincent.portfolio.entity.SiteSettings;
import com.arigavincent.portfolio.entity.Skill;
import com.arigavincent.portfolio.entity.SkillCategory;
import java.util.ArrayList;
import java.util.List;

/**
 * Starter content. Everything here comes from facts Vincent supplied; anything he still needs to
 * confirm or fill in carries a visible "[verify]" marker so it is easy to find in the admin panel.
 */
final class SeedContent {

    private SeedContent() {}

    static SiteSettings siteSettings() {
        SiteSettings settings = new SiteSettings();
        settings.setDisplayName("Vincent Ariga");
        settings.setBrandMark("A&J");
        settings.setRole("Backend Engineer");
        settings.setHeadline("Backend engineer building dependable systems and full-stack products.");
        settings.setTagline("SOFTWARE · STREAMING · APPS");
        settings.setBio("""
                I'm Vincent, a backend engineer based in Kenya. Java and Spring Boot are home, Kotlin and Go \
                are close behind, and when a product needs it I build the whole stack.

                I hold a BSc in Information Technology from Kirinyaga University (Second Class Upper, 2026). \
                Most of what I know comes from shipping my own products: a streaming platform, a church \
                management app and a desktop transaction manager for M-Pesa.""");
        settings.setHeritageNote("Proudly Gusii. My Ekegusii roots keep me grounded.");
        settings.setLocation("Kenya");
        settings.setAvailability("Open to full-time on-site work in Nyeri, and to remote contract work.");
        settings.setEmail("lameckvin@gmail.com");
        settings.setPhoneDisplay("+254 718 569 004");
        settings.setWhatsappNumber("254718569004");
        settings.setGithubUrl("https://github.com/arigavincent");
        settings.setFooterLine("Vincent Ariga · A&J");
        settings.setSeoTitle("Vincent Ariga · A&J | Backend Engineer");
        settings.setSeoDescription("Vincent Ariga is a backend engineer in Kenya working in Java / Spring Boot, "
                + "Kotlin and Go, and building full-stack products.");
        return settings;
    }

    static List<Project> projects() {
        return List.of(
                project(
                        1,
                        "aj-stream",
                        "AJ Stream",
                        "Streaming",
                        "A streaming platform in the style of Netflix and Prime Video, with HLS playback.",
                        """
                        AJ Stream is my take on a Netflix/Prime-style streaming platform. The backend is \
                        written in Rust on top of SQLite, the frontend is React, and video is delivered over HLS.

                        [verify] Add the current status, the repository link and a live demo link.""",
                        List.of("Rust", "SQLite", "React", "HLS"),
                        List.of("Rust backend backed by SQLite", "React frontend", "HLS video playback")),
                project(
                        2,
                        "shekinah-sons-global",
                        "Shekinah Sons Global",
                        "Church management",
                        "A church management app: an Android app, a Go API and an admin dashboard.",
                        """
                        A church management platform for Shekinah Sons Global. Members use a React Native \
                        Android app, the church team works from a React admin dashboard, and both talk to a Go \
                        backend on PostgreSQL.

                        It covers M-Pesa giving, live streaming, chat, an offline Bible, QR check-in and push \
                        notifications.

                        [verify] Add the rollout status and links.""",
                        List.of("React Native", "Go", "PostgreSQL", "React"),
                        List.of(
                                "M-Pesa giving",
                                "Live streaming",
                                "Chat",
                                "Offline Bible",
                                "QR check-in",
                                "Push notifications")),
                project(
                        3,
                        "mpesa-tms",
                        "M-Pesa TMS",
                        "Desktop · Payments",
                        "A desktop transaction management app for M-Pesa that runs over a local network.",
                        """
                        M-Pesa TMS is a transaction management system that runs on a LAN as a desktop app. It \
                        is built with Rust and Axum on PostgreSQL, with Tauri for the desktop shell.

                        [verify] Add who it is for and what it tracks.""",
                        List.of("Rust", "Axum", "PostgreSQL", "Tauri"),
                        List.of(
                                "Runs on a local network (LAN)",
                                "Desktop app built with Tauri",
                                "Rust and Axum backend on PostgreSQL")),
                project(
                        4,
                        "e-learning-lk-school",
                        "E-Learning LK School",
                        "Education",
                        "An e-learning platform with a Django backend and a React frontend.",
                        """
                        An e-learning platform for LK School. The Django backend runs on Railway with Postgres, \
                        Redis and Docker, and the React frontend is deployed on Vercel.

                        [verify] Add the main features and links.""",
                        List.of("Django", "PostgreSQL", "Redis", "Docker", "React", "Railway", "Vercel"),
                        List.of(
                                "Django backend on Railway",
                                "Postgres and Redis, containerised with Docker",
                                "React frontend on Vercel")),
                project(
                        5,
                        "berea-bible",
                        "Berea Bible",
                        "Bible learning",
                        "A Bible learning platform built with React and TypeScript.",
                        """
                        Berea Bible is a platform for learning the Bible, built with React and TypeScript.

                        [verify] Add the main features, the backend (if any) and links.""",
                        List.of("React", "TypeScript"),
                        List.of("Built with React and TypeScript")),
                project(
                        6,
                        "arian-church-app-packages",
                        "Arian Church App Packages",
                        "Product packages",
                        "Church app packages in three tiers (Starter, Growth and Premium) under my brand Arian.",
                        """
                        Under my brand Arian, I offer church apps as packages in three tiers: Starter, Growth \
                        and Premium.

                        [verify] Add what each tier includes and the tech behind it.""",
                        List.of(),
                        List.of("Starter", "Growth", "Premium")));
    }

    static List<Skill> skills() {
        return List.of(
                skill(1, SkillCategory.BACKEND, "Java", null, "java"),
                skill(2, SkillCategory.BACKEND, "Spring Boot", "Security · Data JPA · Cloud Gateway", "spring"),
                skill(3, SkillCategory.BACKEND, "Kotlin", "Ktor · Spring", "kotlin"),
                skill(4, SkillCategory.BACKEND, "Go", "Gin · Fiber", "go"),
                skill(5, SkillCategory.BACKEND, "Django", null, "django"),
                skill(6, SkillCategory.BACKEND, "NestJS", null, "nestjs"),
                skill(7, SkillCategory.BACKEND, "Rust", "Axum", "rust"),
                skill(8, SkillCategory.BACKEND, "PostgreSQL", null, "postgresql"),
                skill(9, SkillCategory.BACKEND, "Redis", null, "redis"),
                skill(10, SkillCategory.BACKEND, "Docker", null, "docker"),
                skill(11, SkillCategory.FRONTEND, "React", null, "react"),
                skill(12, SkillCategory.FRONTEND, "TypeScript", null, "typescript"),
                skill(13, SkillCategory.FRONTEND, "Tailwind CSS", null, "tailwind"),
                skill(14, SkillCategory.TOOLING, "Git & GitHub", null, "git"),
                skill(15, SkillCategory.TOOLING, "Linux", "Pop!_OS", "linux"),
                skill(16, SkillCategory.TOOLING, "Railway", null, "railway"),
                skill(17, SkillCategory.TOOLING, "Render", null, "render"),
                skill(18, SkillCategory.TOOLING, "Vercel", null, "vercel"),
                skill(19, SkillCategory.TOOLING, "Cloudflare R2", null, "cloudflare"));
    }

    static List<Experience> experience() {
        Experience independent = new Experience();
        independent.setSortOrder(1);
        independent.setTitle("Backend Engineer and Product Builder [verify]");
        independent.setOrganization("A&J");
        independent.setLocation("Kenya");
        independent.setCurrent(true);
        independent.setDescription("""
                Building my own products end to end under the A&J brand, including AJ Stream, Shekinah Sons \
                Global and M-Pesa TMS.

                [verify] Confirm this title, add a start date, and add any roles that are missing.""");
        return List.of(independent);
    }

    static List<Education> education() {
        Education degree = new Education();
        degree.setSortOrder(1);
        degree.setInstitution("Kirinyaga University");
        degree.setQualification("BSc Information Technology");
        degree.setGrade("Second Class Upper");
        degree.setEndYear(2026);
        degree.setDescription("[verify] Add the start year.");
        return List.of(degree);
    }

    static List<ServiceOffering> services() {
        return List.of(
                service(
                        1,
                        "Backend Development",
                        "Dependable services in Java / Spring Boot, Kotlin or Go, backed by PostgreSQL and Redis.",
                        "server"),
                service(
                        2,
                        "API Design",
                        "Clear, documented REST APIs that are easy to consume and easy to change.",
                        "api"),
                service(
                        3,
                        "Full-Stack Apps",
                        "Complete products, from the database through to a React and TypeScript frontend.",
                        "layers"),
                service(
                        4,
                        "Church & Business Systems",
                        "Management systems for churches and businesses: giving, check-in, streaming and "
                                + "transaction tracking.",
                        "building"));
    }

    private static Project project(
            int sortOrder,
            String slug,
            String title,
            String category,
            String summary,
            String description,
            List<String> techStack,
            List<String> highlights) {
        Project project = new Project();
        project.setSortOrder(sortOrder);
        project.setSlug(slug);
        project.setTitle(title);
        project.setCategory(category);
        project.setSummary(summary);
        project.setDescription(description);
        project.setTechStack(new ArrayList<>(techStack));
        project.setHighlights(new ArrayList<>(highlights));
        project.setFeatured(true);
        project.setStatus(PublicationStatus.PUBLISHED);
        return project;
    }

    private static Skill skill(int sortOrder, SkillCategory category, String name, String detail, String iconKey) {
        Skill skill = new Skill();
        skill.setSortOrder(sortOrder);
        skill.setCategory(category);
        skill.setName(name);
        skill.setDetail(detail);
        skill.setIconKey(iconKey);
        return skill;
    }

    private static ServiceOffering service(int sortOrder, String title, String description, String iconKey) {
        ServiceOffering service = new ServiceOffering();
        service.setSortOrder(sortOrder);
        service.setTitle(title);
        service.setDescription(description);
        service.setIconKey(iconKey);
        return service;
    }
}
