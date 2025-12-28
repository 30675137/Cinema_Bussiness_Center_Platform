package com.cinema.hallstore.config;

import com.cinema.hallstore.domain.enums.SkuType;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

/**
 * Spring MVC 转换器：将查询参数字符串转换为 SkuType 枚举
 * 支持数据库值格式（如 "raw_material"）
 */
@Component
public class StringToSkuTypeConverter implements Converter<String, SkuType> {

    @Override
    public SkuType convert(String source) {
        try {
            return SkuType.fromValue(source);
        } catch (IllegalArgumentException e) {
            // 如果不是数据库值，尝试枚举常量名（向后兼容）
            return SkuType.valueOf(source.toUpperCase());
        }
    }
}
