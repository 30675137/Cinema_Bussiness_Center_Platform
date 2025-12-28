/**
 * @spec O003-beverage-order
 * 饮品数据传输对象
 */
package com.cinema.beverage.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import com.cinema.beverage.entity.Beverage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 饮品DTO - 用于C端饮品列表展示
 *
 * 对应 spec: O003-beverage-order
 * 使用场景: C端饮品菜单列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageDTO {

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
     * 基础价格
     */
    private BigDecimal basePrice;

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
     * 从实体转换为DTO
     */
    public static BeverageDTO fromEntity(Beverage beverage) {
        if (beverage == null) {
            return null;
        }

        return BeverageDTO.builder()
                .id(beverage.getId())
                .name(beverage.getName())
                .description(beverage.getDescription())
                .category(beverage.getCategory() != null ? beverage.getCategory().name() : null)
                .imageUrl(beverage.getImageUrl())
                .basePrice(beverage.getBasePrice())
                .status(beverage.getStatus() != null ? beverage.getStatus().name() : null)
                .isRecommended(beverage.getIsRecommended())
                .sortOrder(beverage.getSortOrder())
                .createdAt(beverage.getCreatedAt())
                .updatedAt(beverage.getUpdatedAt())
                .build();
    }
}
