/** @spec M001-material-unit-system */
package com.cinema.common.conversion.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Unit conversion module business exception.
 *
 * Error Code Format: CNV_{CATEGORY}_{SEQUENCE}
 *
 * Categories:
 * - VAL: Validation errors
 * - NTF: Not found errors
 * - BIZ: Business rule errors
 */
@Getter
public class ConversionException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;

    public ConversionException(String errorCode, String message, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    // ==================== Validation Errors (400) ====================

    public static ConversionException quantityInvalid() {
        return new ConversionException(
                "CNV_VAL_001",
                "数量必须大于0",
                HttpStatus.BAD_REQUEST
        );
    }

    public static ConversionException unitCodeRequired() {
        return new ConversionException(
                "CNV_VAL_002",
                "单位代码不能为空",
                HttpStatus.BAD_REQUEST
        );
    }

    // ==================== Not Found Errors (404) ====================

    public static ConversionException ruleNotFound(String fromUnitCode, String toUnitCode) {
        return new ConversionException(
                "CNV_NTF_001",
                String.format("未找到换算规则: %s -> %s", fromUnitCode, toUnitCode),
                HttpStatus.NOT_FOUND
        );
    }

    public static ConversionException materialNotFound(String materialId) {
        return new ConversionException(
                "CNV_NTF_002",
                "物料不存在: " + materialId,
                HttpStatus.NOT_FOUND
        );
    }

    // ==================== Business Rule Errors (422) ====================

    public static ConversionException unsupportedConversion(String fromUnitCode, String toUnitCode) {
        return new ConversionException(
                "CNV_BIZ_001",
                String.format("不支持的单位换算: %s -> %s", fromUnitCode, toUnitCode),
                HttpStatus.UNPROCESSABLE_ENTITY
        );
    }

    public static ConversionException circularReference(String fromUnitCode, String toUnitCode) {
        return new ConversionException(
                "CNV_BIZ_002",
                String.format("检测到循环引用: %s <-> %s", fromUnitCode, toUnitCode),
                HttpStatus.UNPROCESSABLE_ENTITY
        );
    }
}
