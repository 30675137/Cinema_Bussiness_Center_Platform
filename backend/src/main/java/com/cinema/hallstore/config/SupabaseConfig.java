package com.cinema.hallstore.config;

import java.time.Duration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.ExchangeStrategies;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@ConfigurationProperties(prefix = "supabase")
public class SupabaseConfig {

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

    @Bean
    public WebClient supabaseWebClient() {
        ExchangeStrategies strategies = ExchangeStrategies.builder()
            .codecs(cfg -> cfg.defaultCodecs().maxInMemorySize(10 * 1024 * 1024))
            .build();

        return WebClient.builder()
            .baseUrl(this.url + "/rest/v1")
            .defaultHeader("apikey", this.serviceRoleKey)
            .defaultHeader("Authorization", "Bearer " + this.serviceRoleKey)
            .defaultHeader("Content-Type", "application/json")
            .defaultHeader("Prefer", "return=representation")
            .exchangeStrategies(strategies)
            .build();
    }

    /**
     * 提供统一的调用超时时间，供 Repository 层使用。
     */
    public Duration getTimeoutDuration() {
        return Duration.ofMillis(apiTimeout);
    }
}


