package com.cinema.hallstore.config;

import com.cinema.hallstore.domain.enums.HallStatus;
import com.cinema.hallstore.domain.enums.HallType;
import com.cinema.hallstore.domain.enums.StoreStatus;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC 配置
 * - 注册自定义枚举转换器，支持 URL 参数的大小写不敏感转换
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

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
