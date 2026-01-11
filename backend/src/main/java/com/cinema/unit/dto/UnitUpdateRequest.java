/**
 * @spec M001-material-unit-system
 */
package com.cinema.unit.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Unit update request DTO
 *
 * <p>User Story: US1 - 单位主数据管理
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitUpdateRequest {

    @Size(max = 50, message = "Unit name must not exceed 50 characters")
    private String name;

    @Min(value = 0, message = "Decimal places must be between 0 and 6")
    @Max(value = 6, message = "Decimal places must be between 0 and 6")
    private Integer decimalPlaces;

    private Boolean isBaseUnit;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}
