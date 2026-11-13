package com.arigavincent.portfolio.seed;

import static org.assertj.core.api.Assertions.assertThat;

import com.arigavincent.portfolio.entity.SiteSettings;
import com.arigavincent.portfolio.repository.EducationRepository;
import com.arigavincent.portfolio.repository.ExperienceRepository;
import com.arigavincent.portfolio.repository.ProjectRepository;
import com.arigavincent.portfolio.repository.ServiceOfferingRepository;
import com.arigavincent.portfolio.repository.SiteSettingsRepository;
import com.arigavincent.portfolio.repository.SkillRepository;
import com.arigavincent.portfolio.support.IntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.DefaultApplicationArguments;

@IntegrationTest
class DataSeederTest {

    @Autowired
    private DataSeeder seeder;

    @Autowired
    private SiteSettingsRepository siteSettingsRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private ExperienceRepository experienceRepository;

    @Autowired
    private EducationRepository educationRepository;

    @Autowired
    private ServiceOfferingRepository serviceOfferingRepository;

    @Test
    void seedsEveryContentTableOnStartup() {
        assertThat(siteSettingsRepository.existsById(SiteSettings.SINGLETON_ID)).isTrue();
        assertThat(projectRepository.count()).isEqualTo(6);
        assertThat(skillRepository.count()).isEqualTo(19);
        assertThat(experienceRepository.count()).isEqualTo(1);
        assertThat(educationRepository.count()).isEqualTo(1);
        assertThat(serviceOfferingRepository.count()).isEqualTo(4);
    }

    @Test
    void runningAgainDoesNotDuplicateOrOverwriteContent() {
        SiteSettings settings =
                siteSettingsRepository.findById(SiteSettings.SINGLETON_ID).orElseThrow();
        settings.setHeadline("Edited in the admin panel");
        siteSettingsRepository.save(settings);

        seeder.run(new DefaultApplicationArguments());

        assertThat(projectRepository.count()).isEqualTo(6);
        assertThat(skillRepository.count()).isEqualTo(19);
        assertThat(siteSettingsRepository
                        .findById(SiteSettings.SINGLETON_ID)
                        .orElseThrow()
                        .getHeadline())
                .isEqualTo("Edited in the admin panel");
    }
}
