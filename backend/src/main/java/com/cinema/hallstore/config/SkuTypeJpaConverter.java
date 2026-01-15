package com.cinema.hallstore.config;

import com.cinema.hallstore.domain.enums.SkuType;
import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

/**
 * JPA AttributeConverter: 将数据库字符串值转换为 SkuType 枚举
 * 支持数据库值格式（如 "finished_product"）映射到枚举常量（如 FINISHED_PRODUCT）
 *
 * @spec B001-fix-brand-creation
 */
@Converter(autoApply = true)
public class SkuTypeJpaConverter implements AttributeConverter<SkuType, String> {

    @Override
    public String convertToDatabaseColumn(SkuType attribute) {
        if (attribute == null) {
            return null;
        }
        return attribute.getValue();
    }

    @Override
    public SkuType convertToEntityAttribute(String dbData) {
        if (dbData == null || dbData.isEmpty()) {
            return null;
        }
        return SkuType.fromValue(dbData);
    }
}
