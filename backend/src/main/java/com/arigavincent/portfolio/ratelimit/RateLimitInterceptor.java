package com.arigavincent.portfolio.ratelimit;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;

/** Applies {@link RateLimited} to controller methods, keyed by the caller's IP address. */
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RateLimiter rateLimiter;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        if (handler instanceof HandlerMethod method) {
            RateLimited rateLimited = method.getMethodAnnotation(RateLimited.class);
            if (rateLimited != null) {
                rateLimiter.check(rateLimited.value(), request.getRemoteAddr());
            }
        }
        return true;
    }
}
