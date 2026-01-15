package com.cinema.product.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.PropertyNamingStrategies;
import com.fasterxml.jackson.databind.annotation.JsonNaming;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * @spec P006-fix-sku-edit-data
 * SKU详情聚合响应DTO
 * 包含SKU基本信息、关联的SPU信息和BOM配方信息
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SKUDetailDTO {

    /**
     * SKU基本信息
     */
    private SKUBasicDTO sku;

    /**
     * 关联的SPU信息（可为null）
     */
    private SPUBasicDTO spu;

    /**
     * 关联的BOM配方（可为null）
     */
    private BOMDetailDTO bom;

    /**
     * 加载元数据
     */
    private LoadMetadataDTO metadata;

    /**
     * 加载元数据DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonNaming(PropertyNamingStrategies.SnakeCaseStrategy.class)
    public static class LoadMetadataDTO {
        /**
         * SPU加载是否成功
         */
        private Boolean spuLoadSuccess;

        /**
         * BOM加载是否成功
         */
        private Boolean bomLoadSuccess;

        /**
         * SPU状态（valid=有效，invalid=失效，not_linked=未关联）
         */
        private String spuStatus;

        /**
         * BOM状态（active=有效，inactive=禁用，not_configured=未配置）
         */
        private String bomStatus;
    }
}
