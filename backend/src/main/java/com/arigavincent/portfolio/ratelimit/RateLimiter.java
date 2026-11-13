package com.arigavincent.portfolio.ratelimit;

import com.arigavincent.portfolio.config.AppProperties;
import com.arigavincent.portfolio.config.AppProperties.Limit;
import com.arigavincent.portfolio.exception.RateLimitExceededException;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import java.time.Duration;
import java.util.Map;
import org.springframework.stereotype.Component;

/**
 * In-memory token buckets, one per policy and client. Idle buckets are evicted, so memory stays
 * bounded. This is per instance, which is the right size for a single-node portfolio API.
 */
@Component
public class RateLimiter {

    private static final long MAX_TRACKED_CLIENTS = 50_000;

    private final Map<RateLimitPolicy, Limit> limits;
    private final Cache<String, Bucket> buckets;

    public RateLimiter(AppProperties properties) {
        AppProperties.RateLimit rateLimit = properties.rateLimit();
        this.limits = Map.of(RateLimitPolicy.CONTACT, rateLimit.contact(), RateLimitPolicy.LOGIN, rateLimit.login());
        Duration longestPeriod = limits.values().stream()
                .map(Limit::period)
                .max(Duration::compareTo)
                .orElseThrow();
        this.buckets = Caffeine.newBuilder()
                .expireAfterAccess(longestPeriod.multipliedBy(2))
                .maximumSize(MAX_TRACKED_CLIENTS)
                .build();
    }

    /** Takes one token for this client, or throws when the client has none left. */
    public void check(RateLimitPolicy policy, String clientKey) {
        Limit limit = limits.get(policy);
        Bucket bucket = buckets.get(policy + ":" + clientKey, key -> newBucket(limit));
        ConsumptionProbe probe = bucket.tryConsumeAndReturnRemaining(1);
        if (!probe.isConsumed()) {
            throw new RateLimitExceededException(Duration.ofNanos(probe.getNanosToWaitForRefill()));
        }
    }

    private static Bucket newBucket(Limit limit) {
        return Bucket.builder()
                .addLimit(bandwidth ->
                        bandwidth.capacity(limit.capacity()).refillGreedy(limit.capacity(), limit.period()))
                .build();
    }
}
