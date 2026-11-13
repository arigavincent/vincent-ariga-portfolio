package com.arigavincent.portfolio.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.info.BuildProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    private static final String BEARER_SCHEME = "bearerAuth";
    private static final String ADMIN_PREFIX = "/api/admin";

    @Bean
    public OpenAPI portfolioOpenApi(ObjectProvider<BuildProperties> buildProperties) {
        String version = buildProperties.stream()
                .map(BuildProperties::getVersion)
                .findFirst()
                .orElse("dev");
        return new OpenAPI()
                .info(new Info()
                        .title("Vincent Ariga · A&J Portfolio API")
                        .description("Content API behind the portfolio. Public endpoints are read-only; "
                                + "everything under /api/admin needs an access token from POST /api/auth/login.")
                        .version(version)
                        .license(new License().name("MIT").url("https://opensource.org/license/mit")))
                .components(new Components()
                        .addSecuritySchemes(
                                BEARER_SCHEME,
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")));
    }

    /** Marks every admin operation as needing the bearer token, without annotating each controller. */
    @Bean
    public OpenApiCustomizer adminSecurityCustomizer() {
        SecurityRequirement requirement = new SecurityRequirement().addList(BEARER_SCHEME);
        return openApi -> openApi.getPaths().forEach((path, item) -> {
            if (path.startsWith(ADMIN_PREFIX)) {
                item.readOperations().forEach(operation -> operation.addSecurityItem(requirement));
            }
        });
    }
}
