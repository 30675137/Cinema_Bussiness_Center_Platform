/** @spec M001-material-unit-system */
package com.cinema.common.conversion.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class ConversionRequest {

    @NotBlank(message = "Source unit code is required")
    private String fromUnitCode;

    @NotBlank(message = "Target unit code is required")
    private String toUnitCode;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Quantity must be greater than 0")
    private BigDecimal quantity;

    private UUID materialId; // Optional, for material-level conversion
}
