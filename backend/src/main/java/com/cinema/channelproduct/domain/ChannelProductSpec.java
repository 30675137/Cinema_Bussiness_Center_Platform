package com.cinema.channelproduct.domain;

import com.cinema.channelproduct.domain.enums.SpecType;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * @spec O005-channel-product-config
 * 渠道商品规格配置（存储在 JSONB 中）
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ChannelProductSpec implements Serializable {

    /**
     * 规格 ID
     */
    private String id;

    /**
     * 规格类型
     */
    private SpecType type;

    /**
     * 规格显示名称
     */
    private String name;

    /**
     * 是否必选
     */
    @Builder.Default
    private Boolean required = false;

    /**
     * 是否多选（如配料可多选）
     */
    @Builder.Default
    private Boolean multiSelect = false;

    /**
     * 规格选项列表
     */
    @Builder.Default
    private List<SpecOption> options = new ArrayList<>();
}
