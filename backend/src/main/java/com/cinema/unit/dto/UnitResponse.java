/**
 * @spec M001-material-unit-system
 */
package com.cinema.unit.dto;

import com.cinema.unit.entity.Unit;
import java.time.LocalDateTime;
import java.util.UUID;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Unit response DTO
 *
 * <p>User Story: US1 - 单位主数据管理
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitResponse {

    private UUID id;
    private String code;
    private String name;
    private Unit.UnitCategory category;
    private Integer decimalPlaces;
    private Boolean isBaseUnit;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Convert Unit entity to UnitResponse DTO
     *
     * @param unit unit entity
     * @return unit response DTO
     */
    public static UnitResponse fromEntity(Unit unit) {
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
