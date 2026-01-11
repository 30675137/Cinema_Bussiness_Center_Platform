/** @spec M001-material-unit-system */
package com.cinema.material.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * Material module business exception.
 *
 * Error Code Format: MAT_{CATEGORY}_{SEQUENCE}
 *
 * Categories:
 * - VAL: Validation errors
 * - NTF: Not found errors
 * - DUP: Duplicate/conflict errors
 * - BIZ: Business rule errors
 * - SYS: System errors
 */
@Getter
public class MaterialException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;

    public MaterialException(String errorCode, String message, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    // ==================== Validation Errors (400) ====================

    public static MaterialException nameRequired() {
        return new MaterialException(
                "MAT_VAL_001",
                "物料名称不能为空",
                HttpStatus.BAD_REQUEST
        );
    }

    public static MaterialException categoryRequired() {
        return new MaterialException(
                "MAT_VAL_002",
                "物料分类不能为空",
                HttpStatus.BAD_REQUEST
        );
    }

    public static MaterialException conversionRateInvalid() {
        return new MaterialException(
                "MAT_VAL_003",
                "换算率必须大于0",
                HttpStatus.BAD_REQUEST
        );
    }

    // ==================== Not Found Errors (404) ====================

    public static MaterialException notFound(String materialId) {
        return new MaterialException(
                "MAT_NTF_001",
                "物料不存在: " + materialId,
                HttpStatus.NOT_FOUND
        );
    }

    // ==================== Duplicate/Conflict Errors (409) ====================

    public static MaterialException codeExists(String code) {
        return new MaterialException(
                "MAT_DUP_001",
                "物料编码已存在: " + code,
                HttpStatus.CONFLICT
        );
    }

    public static MaterialException referencedByBom(String materialId) {
        return new MaterialException(
                "MAT_BIZ_001",
                "物料被BOM引用，无法删除: " + materialId,
                HttpStatus.CONFLICT
        );
    }

    // ==================== Business Rule Errors (422) ====================

    public static MaterialException cannotModifyCode() {
        return new MaterialException(
                "MAT_BIZ_002",
                "物料编码不允许修改",
                HttpStatus.UNPROCESSABLE_ENTITY
        );
    }

    public static MaterialException cannotModifyCategory() {
        return new MaterialException(
                "MAT_BIZ_003",
                "物料分类不允许修改",
                HttpStatus.UNPROCESSABLE_ENTITY
        );
    }
}
