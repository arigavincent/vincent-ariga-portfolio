package com.arigavincent.portfolio.config;

import java.time.Clock;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@Configuration
@EnableAsync
@EnableScheduling
public class TimeConfig {

    @Bean
    Clock clock() {
        return Clock.systemUTC();
    }
}
