package com.cinema.unitconversion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * 换算路径计算请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CalculatePathRequest {

    @NotBlank(message = "源单位不能为空")
    private String fromUnit;

    @NotBlank(message = "目标单位不能为空")
    private String toUnit;
}
