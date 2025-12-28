/**
 * @spec O003-beverage-order
 * 饮品详情数据传输对象
 */
package com.cinema.beverage.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import com.cinema.beverage.entity.Beverage;
import com.cinema.beverage.entity.BeverageSpec;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 饮品详情DTO - 用于C端饮品详情展示
 *
 * 对应 spec: O003-beverage-order
 * 使用场景: C端饮品详情页，包含完整信息和可选规格列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageDetailDTO {

    /**
     * 饮品ID
     */
    private UUID id;

    /**
     * 饮品名称
     */
    private String name;

    /**
     * 饮品描述
     */
    private String description;

    /**
     * 饮品分类
     */
    private String category;

    /**
     * 主图URL
     */
    private String imageUrl;

    /**
     * 详情图片列表
     */
    private String[] detailImages;

    /**
     * 基础价格
     */
    private BigDecimal basePrice;

    /**
     * 营养信息 (JSON字符串)
     */
    private String nutritionInfo;

    /**
     * 饮品状态
     */
    private String status;

    /**
     * 是否推荐
     */
    private Boolean isRecommended;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 创建时间
     */
    private LocalDateTime createdAt;

    /**
     * 更新时间
     */
    private LocalDateTime updatedAt;

    /**
     * 可选规格列表（按规格类型分组）
     */
    private List<BeverageSpecDTO> specs;

    /**
     * 从实体转换为详情DTO
     */
    public static BeverageDetailDTO fromEntity(Beverage beverage, List<BeverageSpec> specs) {
        if (beverage == null) {
            return null;
        }

        List<BeverageSpecDTO> specDTOs = specs != null
                ? specs.stream().map(BeverageSpecDTO::fromEntity).toList()
                : List.of();

        return BeverageDetailDTO.builder()
                .id(beverage.getId())
                .name(beverage.getName())
                .description(beverage.getDescription())
                .category(beverage.getCategory() != null ? beverage.getCategory().name() : null)
                .imageUrl(beverage.getImageUrl())
                .detailImages(beverage.getDetailImages())
                .basePrice(beverage.getBasePrice())
                .nutritionInfo(beverage.getNutritionInfo())
                .status(beverage.getStatus() != null ? beverage.getStatus().name() : null)
                .isRecommended(beverage.getIsRecommended())
                .sortOrder(beverage.getSortOrder())
                .createdAt(beverage.getCreatedAt())
                .updatedAt(beverage.getUpdatedAt())
                .specs(specDTOs)
                .build();
    }

    /**
     * 饮品规格DTO
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BeverageSpecDTO {
        /**
         * 规格ID
         */
        private UUID id;

        /**
         * 饮品ID
         */
        private UUID beverageId;

        /**
         * 规格类型
         */
        private String specType;

        /**
         * 规格名称
         */
        private String specName;

        /**
         * 价格调整
         */
        private BigDecimal priceAdjustment;

        /**
         * 排序顺序
         */
        private Integer sortOrder;

        /**
         * 从实体转换为DTO
         */
        public static BeverageSpecDTO fromEntity(BeverageSpec spec) {
            if (spec == null) {
                return null;
            }

            return BeverageSpecDTO.builder()
                    .id(spec.getId())
                    .beverageId(spec.getBeverageId())
                    .specType(spec.getSpecType() != null ? spec.getSpecType().name() : null)
                    .specName(spec.getSpecName())
                    .priceAdjustment(spec.getPriceAdjustment())
                    .sortOrder(spec.getSortOrder())
                    .build();
        }
    }
}
