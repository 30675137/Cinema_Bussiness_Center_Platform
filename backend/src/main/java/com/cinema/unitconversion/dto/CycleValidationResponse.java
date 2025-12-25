package com.cinema.unitconversion.dto;

import lombok.*;

import java.util.List;

/**
 * 循环验证响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CycleValidationResponse {
    private boolean valid;
    private List<String> cyclePath;
    private String message;

    /**
     * 创建验证通过响应
     */
    public static CycleValidationResponse valid() {
        return CycleValidationResponse.builder()
                .valid(true)
                .message("无循环依赖")
                .build();
    }

    /**
     * 创建检测到循环响应
     */
    public static CycleValidationResponse cycleDetected(List<String> cyclePath) {
        String pathStr = String.join("→", cyclePath);
        return CycleValidationResponse.builder()
                .valid(false)
                .cyclePath(cyclePath)
                .message("检测到循环：" + pathStr)
                .build();
    }
}
