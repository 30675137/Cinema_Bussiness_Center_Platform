package com.cinema.hallstore.config;

import java.time.Duration;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import jakarta.annotation.PostConstruct;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseConfig {

    private static final Logger logger = LoggerFactory.getLogger(SupabaseConfig.class);

    /**
     * Supabase 项目 URL，例如 https://your-project.supabase.co
     */
    private String url;

    /**
     * Supabase Service Role Key，仅在服务端使用，绝不能下发到前端。
     */
    private String serviceRoleKey;

    /**
     * API 超时时间（毫秒）
     */
    private long apiTimeout = 60000;

    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getServiceRoleKey() {
        return serviceRoleKey;
    }

    public void setServiceRoleKey(String serviceRoleKey) {
        this.serviceRoleKey = serviceRoleKey;
    }

    public long getApiTimeout() {
        return apiTimeout;
    }

    public void setApiTimeout(long apiTimeout) {
        this.apiTimeout = apiTimeout;
    }

    @PostConstruct
    public void validateConfiguration() {
        if (!StringUtils.hasText(this.url)) {
            logger.warn("Supabase URL is not configured. Please set 'supabase.url' in application.yml");
        }
        if (!StringUtils.hasText(this.serviceRoleKey)) {
            logger.error("Supabase Service Role Key is not configured! Please set 'supabase.service-role-key' in application.yml or SUPABASE_SERVICE_ROLE_KEY environment variable");
        } else {
            logger.info("Supabase configuration loaded - URL: {}, Service Role Key: {}***", 
                this.url, 
                this.serviceRoleKey.length() > 4 ? this.serviceRoleKey.substring(0, 4) : "****");
        }
    }

    @Bean
    public WebClient supabaseWebClient() {
        // 验证配置
        if (!StringUtils.hasText(this.url)) {
            throw new IllegalStateException("Supabase URL is not configured. Please set 'supabase.url' in application.yml");
        }
        if (!StringUtils.hasText(this.serviceRoleKey)) {
            throw new IllegalStateException("Supabase Service Role Key is not configured. Please set 'supabase.service-role-key' in application.yml or SUPABASE_SERVICE_ROLE_KEY environment variable");
        }

        logger.info("Initializing Supabase WebClient with URL: {}", this.url);
        logger.debug("Supabase Service Role Key configured: {}", 
            this.serviceRoleKey != null && this.serviceRoleKey.length() > 0 ? "***" + this.serviceRoleKey.substring(Math.max(0, this.serviceRoleKey.length() - 4)) : "NOT SET");

        ExchangeStrategies strategies = ExchangeStrategies.builder()
            .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
            .build();

        WebClient.Builder builder = WebClient.builder()
            .baseUrl(this.url + "/rest/v1")
            .defaultHeader("apikey", this.serviceRoleKey)
            .defaultHeader("Authorization", "Bearer " + this.serviceRoleKey)
            .defaultHeader("Content-Type", "application/json")
            .defaultHeader("Prefer", "return=representation")
            .exchangeStrategies(strategies);

        WebClient webClient = builder.build();
        logger.info("Supabase WebClient initialized successfully");
        return webClient;
    }

    /**
     * 提供统一的调用超时时间，供 Repository 层使用。
     */
    public Duration getTimeoutDuration() {
        return Duration.ofMillis(apiTimeout);
    }
}


