package com.arigavincent.portfolio.ratelimit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.catchThrowableOfType;

import com.arigavincent.portfolio.config.AppProperties.Limit;
import com.arigavincent.portfolio.exception.RateLimitExceededException;
import com.arigavincent.portfolio.support.TestProperties;
import java.time.Duration;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;

class RateLimiterTest {

    private final RateLimiter limiter = new RateLimiter(TestProperties.withLimit(new Limit(2, Duration.ofMinutes(10))));

    @Test
    void allowsTheConfiguredNumberOfCallsThenRefuses() {
        limiter.check(RateLimitPolicy.CONTACT, "198.51.100.1");
        limiter.check(RateLimitPolicy.CONTACT, "198.51.100.1");

        RateLimitExceededException refused = catchThrowableOfType(
                RateLimitExceededException.class, () -> limiter.check(RateLimitPolicy.CONTACT, "198.51.100.1"));

        assertThat(refused.getStatus()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(refused.getRetryAfter()).isPositive().isLessThanOrEqualTo(Duration.ofMinutes(10));
    }

    @Test
    void tracksClientsAndPoliciesSeparately() {
        limiter.check(RateLimitPolicy.CONTACT, "198.51.100.2");
        limiter.check(RateLimitPolicy.CONTACT, "198.51.100.2");

        assertThatCode(() -> limiter.check(RateLimitPolicy.CONTACT, "198.51.100.3"))
                .doesNotThrowAnyException();
        assertThatCode(() -> limiter.check(RateLimitPolicy.LOGIN, "198.51.100.2"))
                .doesNotThrowAnyException();
    }
}
