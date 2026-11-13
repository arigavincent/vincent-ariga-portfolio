package com.arigavincent.portfolio.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI portfolioOpenApi(ObjectProvider<BuildProperties> buildProperties) {
        String version = buildProperties.stream()
                .map(BuildProperties::getVersion)
                .findFirst()
                .orElse("dev");
        return new OpenAPI()
                .info(new Info()
                        .title("Vincent Ariga · A&J Portfolio API")
                        .description("Content API behind the portfolio: projects, skills, experience, "
                                + "education, services, blog posts and site settings.")
                        .version(version)
                        .license(new License().name("MIT").url("https://opensource.org/license/mit")));
    }
}
