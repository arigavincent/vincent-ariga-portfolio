package com.arigavincent.portfolio.seed;

import com.arigavincent.portfolio.entity.SiteSettings;
import com.arigavincent.portfolio.repository.EducationRepository;
import com.arigavincent.portfolio.repository.ExperienceRepository;
import com.arigavincent.portfolio.repository.ProjectRepository;
import com.arigavincent.portfolio.repository.ServiceOfferingRepository;
import com.arigavincent.portfolio.repository.SiteSettingsRepository;
import com.arigavincent.portfolio.repository.SkillRepository;
import java.util.List;
import java.util.function.Supplier;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fills empty content tables with the starter content on startup. Each table is seeded only while
 * it is empty, so edits made later in the admin panel are never overwritten.
 */
@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(prefix = "app.seed", name = "enabled", havingValue = "true")
public class DataSeeder implements ApplicationRunner {

    private final SiteSettingsRepository siteSettingsRepository;
    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final ExperienceRepository experienceRepository;
    private final EducationRepository educationRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (!siteSettingsRepository.existsById(SiteSettings.SINGLETON_ID)) {
            siteSettingsRepository.save(SeedContent.siteSettings());
            log.info("Seeded site settings");
        }
        seedIfEmpty("projects", projectRepository, SeedContent::projects);
        seedIfEmpty("skills", skillRepository, SeedContent::skills);
        seedIfEmpty("experience", experienceRepository, SeedContent::experience);
        seedIfEmpty("education", educationRepository, SeedContent::education);
        seedIfEmpty("services", serviceOfferingRepository, SeedContent::services);
    }

    private <E> void seedIfEmpty(String label, JpaRepository<E, Long> repository, Supplier<List<E>> content) {
        if (repository.count() > 0) {
            return;
        }
        List<E> saved = repository.saveAll(content.get());
        log.info("Seeded {} {}", saved.size(), label);
    }
}
