package com.cinema.hallstore.config;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.domain.enums.StoreStatus;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.resource.PathResourceResolver;

/**
 * Web MVC 配置
 * - 注册自定义枚举转换器，支持 URL 参数的大小写不敏感转换
 * - 配置 CORS 允许前端访问
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(@NonNull CorsRegistry registry) {
        // 已禁用此配置，使用 SecurityConfig 的 CORS 配置
        // registry.addMapping("/api/**")
        //         .allowedOriginPatterns("*")
        //         .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
        //         .allowedHeaders("*")
        //         .allowCredentials(true)
        //         .maxAge(3600);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // 配置静态资源处理，避免NoResourceFoundException
        registry.addResourceHandler("/static/**", "/public/**", "/favicon.ico")
                .addResourceLocations("classpath:/static/", "classpath:/public/")
                .setCachePeriod(3600)
                .resourceChain(true)
                .addResolver(new PathResourceResolver());
    }

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 处理根路径请求，避免NoResourceFoundException
        registry.addRedirectViewController("/", "/api");
        registry.addViewController("/skus").setViewName("forward:/api/skus");
    }

    @Override
    public void addFormatters(@NonNull FormatterRegistry registry) {
        registry.addConverter(new StringToStoreStatusConverter());
        registry.addConverter(new StringToHallStatusConverter());
        registry.addConverter(new StringToHallTypeConverter());
    }

    /**
     * StoreStatus 转换器 - 支持大小写不敏感
     */
    private static class StringToStoreStatusConverter implements Converter<String, StoreStatus> {
        @Override
        public StoreStatus convert(@NonNull String source) {
            return StoreStatus.fromValue(source);
        }
    }

    /**
     * HallStatus 转换器 - 支持大小写不敏感
     */
    private static class StringToHallStatusConverter implements Converter<String, HallStatus> {
        @Override
        public HallStatus convert(@NonNull String source) {
            return HallStatus.fromValue(source);
        }
    }

    /**
     * HallType 转换器 - 支持大小写不敏感
     */
    private static class StringToHallTypeConverter implements Converter<String, HallType> {
        @Override
        public HallType convert(@NonNull String source) {
            return HallType.fromValue(source);
        }
    }
}
