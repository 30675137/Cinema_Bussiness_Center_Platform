/**
 * @spec M001-material-unit-system
 */
package com.cinema.unit.dto;

import com.cinema.unit.entity.Unit;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Unit creation request DTO
 *
 * <p>User Story: US1 - 单位主数据管理
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UnitCreateRequest {

    @NotBlank(message = "Unit code is required")
    @Size(max = 20, message = "Unit code must not exceed 20 characters")
    @Pattern(regexp = "^[a-zA-Z\u4e00-\u9fa5]+$", message = "Unit code must contain only letters or Chinese characters")
    private String code;

    @NotBlank(message = "Unit name is required")
    @Size(max = 50, message = "Unit name must not exceed 50 characters")
    private String name;

    @NotNull(message = "Unit category is required")
    private Unit.UnitCategory category;

    @Min(value = 0, message = "Decimal places must be between 0 and 6")
    @Max(value = 6, message = "Decimal places must be between 0 and 6")
    private Integer decimalPlaces = 2;

    private Boolean isBaseUnit = false;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
}
