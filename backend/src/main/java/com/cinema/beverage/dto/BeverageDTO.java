/**
 * @spec O003-beverage-order
 * 饮品数据传输对象
 */
package com.cinema.beverage.dto;

import com.cinema.beverage.entity.Beverage;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 饮品DTO - 用于B端/C端饮品列表展示
 *
 * 对应 spec: O003-beverage-order
 * 使用场景: B端饮品管理列表、C端饮品菜单列表
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BeverageDTO {

    /**
     * 饮品ID (UUID字符串)
     */
    private String id;

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
    private Beverage.BeverageCategory category;

    /**
     * 主图URL
     */
    private String mainImage;

    /**
     * 基础价格（单位：分）
     */
    private Long basePrice;

    /**
     * 饮品状态
     */
    private Beverage.BeverageStatus status;

    /**
     * 是否推荐
     */
    private Boolean isRecommended;

    /**
     * 排序顺序
     */
    private Integer sortOrder;

    /**
     * 创建时间 (ISO 8601字符串)
     */
    private String createdAt;

    /**
     * 更新时间 (ISO 8601字符串)
     */
    private String updatedAt;

    /**
     * 创建人ID
     */
    private String createdBy;

    /**
     * 更新人ID
     */
    private String updatedBy;

    /**
     * 规格数量
     */
    private Integer specCount;

    /**
     * 配方数量
     */
    private Integer recipeCount;
}
