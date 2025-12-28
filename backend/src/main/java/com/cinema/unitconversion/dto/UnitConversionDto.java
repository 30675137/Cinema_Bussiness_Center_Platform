package com.cinema.unitconversion.dto;

import com.cinema.unitconversion.domain.UnitConversion;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * 单位换算规则响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitConversionDto {
    private UUID id;
    private String fromUnit;
    private String toUnit;
    private BigDecimal conversionRate;
    private String category;        // 数据库值: volume/weight/quantity
    private String categoryDisplay; // 前端显示: VOLUME/WEIGHT/COUNT

    /**
     * 从实体转换为 DTO
     */
    public static UnitConversionDto from(UnitConversion entity) {
        return UnitConversionDto.builder()
                .id(entity.getId())
                .fromUnit(entity.getFromUnit())
                .toUnit(entity.getToUnit())
                .conversionRate(entity.getConversionRate())
                .category(entity.getCategory().name())
                .categoryDisplay(entity.getCategory().getDisplayName())
                .build();
    }
}
