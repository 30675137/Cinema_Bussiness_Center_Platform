package com.cinema.channelproduct.domain;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

/**
 * @spec O005-channel-product-config
 * 规格选项（存储在 JSONB 中）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SpecOption implements Serializable {

    /**
     * 选项 ID
     */
    private String id;

    /**
     * 选项名称（如"大杯"、"热"）
     */
    private String name;

    /**
     * 价格调整（分），正数加价，负数减价
     */
    @Builder.Default
    private Integer priceAdjust = 0;

    /**
     * 是否默认选中
     */
    @Builder.Default
    private Boolean isDefault = false;

    /**
     * 排序序号
     */
    @Builder.Default
    private Integer sortOrder = 0;
}
