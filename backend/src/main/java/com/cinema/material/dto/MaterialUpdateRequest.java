/** @spec M001-material-unit-system */
package com.cinema.material.dto;

import jakarta.validation.constraints.*;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class MaterialUpdateRequest {

    @Size(max = 100, message = "Material name must not exceed 100 characters")
    private String name;

    private UUID inventoryUnitId;

    private UUID purchaseUnitId;

    @DecimalMin(value = "0.000001", message = "Conversion rate must be greater than 0")
    @Digits(integer = 6, fraction = 6, message = "Conversion rate must have at most 6 integer digits and 6 decimal places")
    private BigDecimal conversionRate;

    private Boolean useGlobalConversion;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @Size(max = 200, message = "Specifications must not exceed 200 characters")
    private String specification;
}
