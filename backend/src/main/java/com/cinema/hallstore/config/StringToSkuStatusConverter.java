package com.cinema.hallstore.config;

import com.cinema.hallstore.domain.enums.SkuStatus;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

/**
 * Spring MVC 转换器：将查询参数字符串转换为 SkuStatus 枚举
 * 支持数据库值格式（如 "enabled"）
 */
@Component
public class StringToSkuStatusConverter implements Converter<String, SkuStatus> {

    @Override
    public SkuStatus convert(String source) {
        try {
            return SkuStatus.fromValue(source);
        } catch (IllegalArgumentException e) {
            // 如果不是数据库值，尝试枚举常量名（向后兼容）
            return SkuStatus.valueOf(source.toUpperCase());
        }
    }
}
