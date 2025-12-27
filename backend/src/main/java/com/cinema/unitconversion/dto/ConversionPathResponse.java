package com.cinema.unitconversion.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * 换算路径计算响应 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConversionPathResponse {
    private String fromUnit;
    private String toUnit;
    private List<String> path;       // 换算路径: ["瓶", "ml", "L"]
    private BigDecimal totalRate;    // 累积换算率
    private int steps;               // 中间步骤数
    private boolean found;           // 是否找到路径
    private String message;          // 结果消息

    /**
     * 创建找到路径的响应
     */
    public static ConversionPathResponse found(String fromUnit, String toUnit, List<String> path, BigDecimal totalRate) {
        return ConversionPathResponse.builder()
                .fromUnit(fromUnit)
                .toUnit(toUnit)
                .path(path)
                .totalRate(totalRate)
                .steps(path.size() - 1)
                .found(true)
                .message("换算路径计算成功")
                .build();
    }

    /**
     * 创建未找到路径的响应
     */
    public static ConversionPathResponse notFound(String fromUnit, String toUnit) {
        return ConversionPathResponse.builder()
                .fromUnit(fromUnit)
                .toUnit(toUnit)
                .path(List.of())
                .totalRate(BigDecimal.ZERO)
                .steps(0)
                .found(false)
                .message(String.format("找不到从 '%s' 到 '%s' 的换算路径", fromUnit, toUnit))
                .build();
    }
}
