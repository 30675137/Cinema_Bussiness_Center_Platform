/**
 * @spec M001-material-unit-system
 * @spec P002-unit-conversion
 */
package com.cinema.common.conversion;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Common conversion service interface
 *
 * <p>User Story: US3 - 统一换算服务
 *
 * <p>This service provides a unified conversion API that supports both:
 *
 * <ul>
 *   <li>Material-level conversion (priority)
 *   <li>Global conversion rules (fallback)
 * </ul>
 *
 * <p>Implementation will be provided in Phase 5 (User Story 3).
 */
public interface CommonConversionService {

    /**
     * Convert quantity from one unit to another with optional material context
     *
     * <p>Conversion priority:
     *
     * <ol>
     *   <li>If materialId is provided and material.useGlobalConversion = false, use material-level
     *       conversion
     *   <li>Otherwise, use global conversion chain from P002
     * </ol>
     *
     * @param fromUnitCode source unit code (e.g., "瓶", "L")
     * @param toUnitCode target unit code (e.g., "ml")
     * @param quantity quantity to convert
     * @param materialId optional material ID for material-level conversion
     * @return conversion result containing converted quantity and conversion source
     * @throws ConversionException if conversion path not found or invalid parameters
     */
    ConversionResult convert(
            String fromUnitCode, String toUnitCode, BigDecimal quantity, UUID materialId);

    /**
     * Convert quantity using global conversion rules only
     *
     * <p>This method always uses the global unit_conversions table, ignoring material-level
     * conversions.
     *
     * @param fromUnitCode source unit code
     * @param toUnitCode target unit code
     * @param quantity quantity to convert
     * @return conversion result
     * @throws ConversionException if conversion path not found
     */
    ConversionResult convertGlobal(String fromUnitCode, String toUnitCode, BigDecimal quantity);

    /**
     * Check if conversion is possible between two units
     *
     * @param fromUnitCode source unit code
     * @param toUnitCode target unit code
     * @param materialId optional material ID
     * @return true if conversion is possible, false otherwise
     */
    boolean canConvert(String fromUnitCode, String toUnitCode, UUID materialId);

    /**
     * Conversion result data transfer object
     *
     * @param convertedQuantity the converted quantity
     * @param source conversion source (MATERIAL or GLOBAL)
     * @param conversionPath conversion path description (e.g., "瓶 → ml (material-level)")
     */
    record ConversionResult(
            BigDecimal convertedQuantity, ConversionSource source, String conversionPath) {}

    /**
     * Conversion source enumeration
     */
    enum ConversionSource {
        /** Material-level conversion used */
        MATERIAL,

        /** Global conversion chain used */
        GLOBAL
    }

    /**
     * Conversion exception
     */
    class ConversionException extends RuntimeException {
        public ConversionException(String message) {
            super(message);
        }

        public ConversionException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}
