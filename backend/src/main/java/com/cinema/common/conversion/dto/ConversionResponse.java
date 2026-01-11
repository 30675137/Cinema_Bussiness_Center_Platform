/** @spec M001-material-unit-system */
package com.cinema.common.conversion.dto;

import com.cinema.common.conversion.CommonConversionService.ConversionSource;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class ConversionResponse {

    private BigDecimal convertedQuantity;
    private String fromUnitCode;
    private String toUnitCode;
    private BigDecimal originalQuantity;
    private ConversionSource source;
    private String conversionPath;

    public static ConversionResponse from(
            String fromUnitCode,
            String toUnitCode,
            BigDecimal originalQuantity,
            com.cinema.common.conversion.CommonConversionService.ConversionResult result) {
        return ConversionResponse.builder()
                .convertedQuantity(result.convertedQuantity())
                .fromUnitCode(fromUnitCode)
                .toUnitCode(toUnitCode)
                .originalQuantity(originalQuantity)
                .source(result.source())
                .conversionPath(result.conversionPath())
                .build();
    }
}
