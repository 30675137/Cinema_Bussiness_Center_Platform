/**
 * @spec O003-beverage-order
 * JWT认证与授权配置 (T026)
 */
package com.cinema.config;

import com.cinema.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Spring Security 配置类
 *
 * 功能:
 * 1. 配置HTTP安全规则 (公共端点 vs 需要认证的端点)
 * 2. 集成 JWT 认证过滤器
 * 3. 禁用 CSRF (API-only 后端)
 * 4. 配置 CORS 跨域策略
 * 5. 使用无状态会话策略
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * 配置安全过滤链
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // 禁用 CSRF (API-only 后端使用 JWT 认证)
            .csrf(csrf -> csrf.disable())

            // 配置 CORS
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))

            // 配置请求授权规则
            .authorizeHttpRequests(auth -> auth
                // 公共端点 (不需要认证)
                .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/auth/refresh").permitAll()

                // C端公共端点 (饮品浏览、下单)
                .requestMatchers(HttpMethod.GET, "/api/client/beverages/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/client/beverage-specs/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/client/beverage-orders").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/client/beverage-orders/*/pay").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/client/beverage-orders/*").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/client/beverage-orders/my").permitAll()

                // B端管理端点 (需要认证)
                .requestMatchers("/api/admin/**").authenticated()

                // 其他所有请求需要认证
                .anyRequest().authenticated()
            )

            // 无状态会话策略 (不使用 HttpSession)
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // 添加 JWT 认证过滤器 (在 UsernamePasswordAuthenticationFilter 之前)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS 配置
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // 允许的来源 (开发环境允许所有来源，生产环境应限制)
        configuration.setAllowedOriginPatterns(List.of("*"));

        // 允许的 HTTP 方法
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));

        // 允许的请求头
        configuration.setAllowedHeaders(List.of("*"));

        // 允许携带凭证 (Cookies)
        configuration.setAllowCredentials(true);

        // 暴露的响应头
        configuration.setExposedHeaders(List.of("Authorization"));

        // 预检请求缓存时间 (3600秒 = 1小时)
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    /**
     * 密码加密器 (BCrypt)
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
