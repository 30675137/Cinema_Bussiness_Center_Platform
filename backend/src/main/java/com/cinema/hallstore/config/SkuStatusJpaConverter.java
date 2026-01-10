package com.cinema.hallstore.config;

import com.cinema.hallstore.domain.enums.SkuStatus;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA AttributeConverter: 将数据库字符串值转换为 SkuStatus 枚举
 * 支持数据库值格式（如 "enabled"）映射到枚举常量（如 ENABLED）
 *
 * @spec B001-fix-brand-creation
 */
@Converter(autoApply = true)
public class SkuStatusJpaConverter implements AttributeConverter<SkuStatus, String> {

    @Override
    public String convertToDatabaseColumn(SkuStatus attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public SkuStatus convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        return SkuStatus.fromValue(dbData);
    }
}
