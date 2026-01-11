/** @spec M001-material-unit-system */
package com.cinema.material.dto;

import com.cinema.material.entity.Material;
import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class MaterialCreateRequest {

    @Pattern(regexp = "^$|^MAT-(RAW|PKG)-\\d{3}$",
            message = "Material code must follow format MAT-{RAW|PKG}-{001-999} or be empty for auto-generation")
    private String code; // Optional, auto-generated if null or empty

    @NotBlank(message = "Material name is required")
    @Size(max = 100, message = "Material name must not exceed 100 characters")
    private String name;

    @NotNull(message = "Material category is required")
    private Material.MaterialCategory category;

    @NotNull(message = "Inventory unit ID is required")
    private UUID inventoryUnitId;

    @NotNull(message = "Purchase unit ID is required")
    private UUID purchaseUnitId;

    @DecimalMin(value = "0.000001", message = "Conversion rate must be greater than 0")
    @Digits(integer = 4, fraction = 6, message = "Conversion rate must have at most 4 integer digits and 6 decimal places")
    private BigDecimal conversionRate;

    @NotNull(message = "Use global conversion flag is required")
    private Boolean useGlobalConversion = true;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Size(max = 200, message = "Specifications must not exceed 200 characters")
    private String specification;
}
