package com.cinema.unitconversion.dto;

import lombok.*;

import java.util.List;

/**
 * 验证错误响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ValidationErrorResponse {
    private String error;           // 错误类型
    private String message;         // 错误消息
    private List<String> cyclePath; // 循环路径（如有）
    private List<BomReference> references; // 引用的 BOM（如有）

    /**
     * BOM 引用信息
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BomReference {
        private String bomId;
        private String productName;
    }

    /**
     * 创建循环依赖错误响应
     */
    public static ValidationErrorResponse cycleDetected(List<String> cyclePath) {
        String pathStr = String.join("→", cyclePath);
        return ValidationErrorResponse.builder()
                .error("CYCLE_DETECTED")
                .message("检测到循环：" + pathStr)
                .cyclePath(cyclePath)
                .build();
    }

    /**
     * 创建重复规则错误响应
     */
    public static ValidationErrorResponse duplicateRule(String fromUnit, String toUnit) {
        return ValidationErrorResponse.builder()
                .error("DUPLICATE_RULE")
                .message(String.format("换算规则 '%s' → '%s' 已存在", fromUnit, toUnit))
                .build();
    }

    /**
     * 创建规则被引用错误响应
     */
    public static ValidationErrorResponse ruleReferenced(List<BomReference> references) {
        return ValidationErrorResponse.builder()
                .error("RULE_REFERENCED")
                .message("该换算规则被 BOM 引用，无法删除")
                .references(references)
                .build();
    }

    /**
     * 创建验证失败错误响应
     */
    public static ValidationErrorResponse validationFailed(String message) {
        return ValidationErrorResponse.builder()
                .error("VALIDATION_ERROR")
                .message(message)
                .build();
    }
}
