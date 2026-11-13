package com.arigavincent.portfolio.support;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.config.AppProperties.Admin;
import com.arigavincent.portfolio.config.AppProperties.Contact;
import com.arigavincent.portfolio.config.AppProperties.Cors;
import com.arigavincent.portfolio.config.AppProperties.Jwt;
import com.arigavincent.portfolio.config.AppProperties.Limit;
import com.arigavincent.portfolio.config.AppProperties.RateLimit;
import com.arigavincent.portfolio.config.AppProperties.RefreshCookie;
import com.arigavincent.portfolio.config.AppProperties.Security;
import com.arigavincent.portfolio.config.AppProperties.Storage;
import java.time.Duration;
import java.util.List;
import org.springframework.util.unit.DataSize;

/** Builds {@link AppProperties} for unit tests, with only the interesting parts varied. */
public final class TestProperties {

    private TestProperties() {}

    public static AppProperties defaults() {
        return with(new Admin("", ""), "./build/test-uploads", "", new Limit(5, Duration.ofMinutes(10)));
    }

    public static AppProperties withAdmin(String username, String password) {
        return with(new Admin(username, password), "./build/test-uploads", "", new Limit(5, Duration.ofMinutes(10)));
    }

    public static AppProperties withStorageRoot(String root) {
        return with(new Admin("", ""), root, "", new Limit(5, Duration.ofMinutes(10)));
    }

    public static AppProperties withJwtSecret(String secret) {
        return with(new Admin("", ""), "./build/test-uploads", secret, new Limit(5, Duration.ofMinutes(10)));
    }

    public static AppProperties withLimit(Limit limit) {
        return with(new Admin("", ""), "./build/test-uploads", "", limit);
    }

    private static AppProperties with(Admin admin, String storageRoot, String jwtSecret, Limit limit) {
        return new AppProperties(
                new Security(
                        new Jwt(jwtSecret, "test-issuer", Duration.ofMinutes(15), Duration.ofDays(7)),
                        new RefreshCookie(true, "Lax")),
                new Cors(List.of("http://localhost:5173")),
                admin,
                new Contact("", ""),
                new Storage(storageRoot, DataSize.ofMegabytes(5), DataSize.ofMegabytes(10)),
                new RateLimit(limit, limit));
    }
}
