package com.cinema.unit.dto;

import com.cinema.unit.domain.UnitCategory;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * M001: 单位响应 DTO
 * 
 * @author Cinema System
 * @since 2026-01-14
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitResponse {
    
    private UUID id;
    private String code;
    private String name;
    private UnitCategory category;
    private Integer decimalPlaces;
    private Boolean isBaseUnit;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * 从实体转换为响应DTO
     */
    public static UnitResponse fromEntity(com.cinema.unit.domain.Unit unit) {
        if (unit == null) {
            return null;
        }
        return UnitResponse.builder()
                .id(unit.getId())
                .code(unit.getCode())
                .name(unit.getName())
                .category(unit.getCategory())
                .decimalPlaces(unit.getDecimalPlaces())
                .isBaseUnit(unit.getIsBaseUnit())
                .description(unit.getDescription())
                .createdAt(unit.getCreatedAt())
                .updatedAt(unit.getUpdatedAt())
                .build();
    }
}
