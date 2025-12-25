package com.cinema.unitconversion.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.UUID;

/**
 * 循环验证请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CycleValidationRequest {

    @NotBlank(message = "源单位不能为空")
    private String fromUnit;

    @NotBlank(message = "目标单位不能为空")
    private String toUnit;

    private UUID excludeId; // 编辑时排除当前规则的 ID
}
