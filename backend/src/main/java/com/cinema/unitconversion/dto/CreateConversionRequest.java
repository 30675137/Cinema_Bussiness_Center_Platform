package com.cinema.unitconversion.dto;

import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;

/**
 * 创建/更新换算规则请求 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversionRequest {

    @NotBlank(message = "源单位不能为空")
    @Size(max = 20, message = "源单位长度不能超过20字符")
    private String fromUnit;

    @NotBlank(message = "目标单位不能为空")
    @Size(max = 20, message = "目标单位长度不能超过20字符")
    private String toUnit;

    @NotNull(message = "换算率不能为空")
    @Positive(message = "换算率必须为正数")
    @DecimalMax(value = "999999.999999", message = "换算率超出范围")
    private BigDecimal conversionRate;

    @NotBlank(message = "单位类别不能为空")
    @Pattern(regexp = "^(volume|weight|quantity)$", message = "类别必须是 volume/weight/quantity")
    private String category;

    private String description; // 可选备注
}
