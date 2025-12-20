package com.cinema.config;

import com.cinema.hallstore.config.SupabaseConfig;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

/**
 * RestTemplate 配置类
 * <p>
 * 配置用于调用 Supabase API 的 RestTemplate Bean
 * </p>
 *
 * @author Cinema Platform
 * @since 2025-12-19
 */
@Configuration
public class RestTemplateConfig {

    private final SupabaseConfig supabaseConfig;

    public RestTemplateConfig(SupabaseConfig supabaseConfig) {
        this.supabaseConfig = supabaseConfig;
    }

    /**
     * 创建 RestTemplate Bean
     * <p>
     * 用于调用 Supabase Storage API 等外部服务
     * </p>
     *
     * @param builder RestTemplateBuilder
     * @return RestTemplate 实例
     */
    @Bean
    public RestTemplate restTemplate(RestTemplateBuilder builder) {
        return builder
                .setConnectTimeout(Duration.ofMillis(supabaseConfig.getApiTimeout()))
                .setReadTimeout(Duration.ofMillis(supabaseConfig.getApiTimeout()))
                .build();
    }
}
